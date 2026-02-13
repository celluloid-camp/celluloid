// PeerTube Video Element - Custom element for PeerTube video embeds
// Based on https://github.com/muxinc/media-elements pattern

const EMBED_BASE = "/videos/embed";
const MATCH_SRC = /(https?):\/\/([^/]+)\/(?:videos\/watch|w)\/(.+)$/;

// SDK configuration
const SDK_URL = "https://unpkg.com/@peertube/embed-api/build/player.min.js";
const SDK_GLOBAL = "PeerTubePlayer";

interface PeerTubeAPI {
  ready: Promise<void>;
  play: () => Promise<void>;
  pause: () => Promise<void>;
  seek: (seconds: number) => Promise<void>;
  setVolume: (volume: number) => Promise<void>;
  getVolume: () => Promise<number>;
  setPlaybackRate: (rate: number) => Promise<void>;
  getPlaybackRate: () => Promise<number>;
  addEventListener: (event: string, handler: (data?: unknown) => void) => void;
  removeEventListener: (
    event: string,
    handler: (data?: unknown) => void,
  ) => void;
  destroy: () => void;
}

export function canPlay(src: string): boolean {
  return MATCH_SRC.test(src);
}

function getTemplateHTML(
  attrs: Record<string, string>,
  config?: Record<string, unknown>,
) {
  const iframeAttrs: Record<string, string | number> = {
    src: serializeIframeUrl(attrs, config) || "",
    frameborder: 0,
    width: "100%",
    height: "100%",
    allow:
      "accelerometer; fullscreen; autoplay; encrypted-media; gyroscope; picture-in-picture",
    sandbox: "allow-same-origin allow-scripts allow-popups",
  };

  if (config) {
    iframeAttrs["data-config"] = JSON.stringify(config);
  }

  return /*html*/ `
    <style>
      :host {
        display: inline-block;
        min-width: 300px;
        min-height: 150px;
        position: relative;
      }
      iframe {
        position: absolute;
        top: 0;
        left: 0;
      }
      :host(:not([controls])) {
        pointer-events: none;
      }
    </style>
    <iframe${serializeAttributes(iframeAttrs)}></iframe>
  `;
}

function serializeIframeUrl(
  attrs: Record<string, string>,
  config?: Record<string, unknown>,
): string | undefined {
  if (!attrs.src) return undefined;

  const matches = attrs.src.match(MATCH_SRC);
  if (!matches) return undefined;

  const protocol = matches[1];
  const domain = matches[2];
  const videoId = matches[3];

  const params: Record<string, unknown> = {
    api: 1,
    controls: attrs.controls === "" ? 1 : 0,
    autoplay: attrs.autoplay === "" ? 1 : 0,
    loop: attrs.loop === "" ? 1 : 0,
    muted: attrs.muted === "" ? 1 : 0,
    peertubeLink: 0,
    title: 0,
    warningTitle: 0,
    ...config,
  };

  return `${protocol}://${domain}${EMBED_BASE}/${videoId}?${serialize(params)}`;
}

// Store resolve functions for concurrent SDK loading attempts
const sdkResolves: Record<string, Array<(sdk: unknown) => void>> = {};

// Helper to access global SDK
function getGlobalSDK():
  | (new (
      iframe: HTMLIFrameElement,
    ) => PeerTubeAPI)
  | undefined {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (window as any)[SDK_GLOBAL];
}

function getSDK(): Promise<new (iframe: HTMLIFrameElement) => PeerTubeAPI> {
  return new Promise((resolve, reject) => {
    // Check if SDK is already loaded
    const existingSDK = getGlobalSDK();
    if (existingSDK) {
      resolve(existingSDK);
      return;
    }

    // If we are already loading the SDK, add the resolve function to the array
    if (sdkResolves[SDK_URL]) {
      sdkResolves[SDK_URL].push(resolve as (sdk: unknown) => void);
      return;
    }
    sdkResolves[SDK_URL] = [resolve as (sdk: unknown) => void];

    // Check if script is already being loaded
    const existingScript = document.querySelector(`script[src="${SDK_URL}"]`);
    if (existingScript) {
      existingScript.addEventListener("load", () => {
        const sdk = getGlobalSDK();
        if (sdkResolves[SDK_URL]) {
          sdkResolves[SDK_URL].forEach((res) => res(sdk));
          delete sdkResolves[SDK_URL];
        }
      });
      existingScript.addEventListener("error", reject);
      return;
    }

    // Load the script
    const script = document.createElement("script");
    script.src = SDK_URL;
    script.async = true;
    script.onload = () => {
      const sdk = getGlobalSDK();
      sdkResolves[SDK_URL].forEach((res) => res(sdk));
      delete sdkResolves[SDK_URL];
    };
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

/**
 * A utility to create Promises with convenient public resolve and reject methods.
 */
class PublicPromise<T = void> extends Promise<T> {
  resolve!: (value: T | PromiseLike<T>) => void;
  reject!: (reason?: unknown) => void;

  constructor(
    executor: (
      resolve: (value: T | PromiseLike<T>) => void,
      reject: (reason?: unknown) => void,
    ) => void = () => void 0,
  ) {
    let res: (value: T | PromiseLike<T>) => void;
    let rej: (reason?: unknown) => void;
    super((resolve, reject) => {
      executor(resolve, reject);
      res = resolve;
      rej = reject;
    });
    this.resolve = res!;
    this.reject = rej!;
  }
}

class PeerTubeVideoElement extends HTMLElement {
  static getTemplateHTML = getTemplateHTML;
  static shadowRootOptions = { mode: "open" as const };
  static observedAttributes = [
    "autoplay",
    "controls",
    "crossorigin",
    "loop",
    "muted",
    "playsinline",
    "poster",
    "preload",
    "src",
  ];

  loadComplete: PublicPromise = new PublicPromise();
  #loadRequested: Promise<void> | null = null;
  #hasLoaded = false;
  #isInit = false;
  #currentTime = 0;
  #duration = NaN;
  #muted = false;
  #paused = true;
  #playbackRate = 1;
  #progress = 0;
  #readyState = 0;
  #seeking = false;
  #volume = 1;
  #volumeBeforeMute = 1;
  #videoWidth = NaN;
  #videoHeight = NaN;
  #config: Record<string, unknown> | null = null;

  api: PeerTubeAPI | null = null;
  textTracks: TextTrackList | null = null;

  constructor() {
    super();
    this.#upgradeProperty("config");

    // Initialize paused based on autoplay attribute
    this.#paused = !this.autoplay;
  }

  /**
   * True only when we're in a browser, connected to DOM, and API is ready.
   * PeerTube SDK's Channel.build() throws if called without a valid window (e.g. SSR or before iframe ready).
   */
  #canUseApi(): boolean {
    return (
      typeof window !== "undefined" && this.isConnected && this.api != null
    );
  }

  connectedCallback() {
    // Auto-load when connected to DOM if src is present
    if (this.src && !this.#hasLoaded) {
      this.load();
    }
  }

  requestFullscreen(): Promise<void> {
    // PeerTube doesn't expose fullscreen API directly, use iframe fullscreen
    const iframe = this.shadowRoot?.querySelector("iframe");
    return (
      iframe?.requestFullscreen() ??
      Promise.reject(new Error("No iframe found"))
    );
  }

  get config(): Record<string, unknown> | null {
    return this.#config;
  }

  set config(value: Record<string, unknown> | null) {
    this.#config = value;
  }

  async load(): Promise<void> {
    if (this.#loadRequested) return;

    const isFirstLoad = !this.#hasLoaded;

    if (this.#hasLoaded) this.loadComplete = new PublicPromise();
    this.#hasLoaded = true;

    // Wait 1 tick to allow other attributes to be set.
    await (this.#loadRequested = Promise.resolve());
    this.#loadRequested = null;

    this.#currentTime = 0;
    this.#duration = NaN;
    this.#muted = this.defaultMuted;
    this.#paused = !this.autoplay;
    this.#playbackRate = 1;
    this.#progress = 0;
    this.#readyState = 0;
    this.#seeking = false;
    this.#volume = 1;
    this.#videoWidth = NaN;
    this.#videoHeight = NaN;
    this.dispatchEvent(new Event("emptied"));

    const oldApi = this.api;
    this.api = null;

    if (!this.src) {
      return;
    }

    this.dispatchEvent(new Event("loadstart"));

    const onLoaded = async () => {
      this.#readyState = 1; // HTMLMediaElement.HAVE_METADATA
      this.dispatchEvent(new Event("loadedmetadata"));

      if (this.api && typeof window !== "undefined") {
        try {
          // PeerTube doesn't have getMuted - infer from volume or defaultMuted attribute
          this.#volume = await this.api.getVolume();
          this.#muted = this.defaultMuted || this.#volume === 0;
          this.dispatchEvent(new Event("volumechange"));
        } catch {
          // Channel.build() can throw if iframe not ready; keep defaults
        }
      }

      this.dispatchEvent(new Event("loadcomplete"));
      this.loadComplete.resolve();
    };

    // If already initialized, we need to reload the iframe
    if (this.#isInit && oldApi) {
      // Destroy old player and reinitialize
      try {
        oldApi.destroy();
      } catch (_) {
        // Ignore destroy errors - player may already be destroyed
        void 0;
      }
      this.#isInit = false;
    }

    this.#isInit = true;

    let iframe = this.shadowRoot?.querySelector("iframe");

    if (isFirstLoad && iframe) {
      const configAttr = iframe.getAttribute("data-config");
      this.#config = configAttr ? JSON.parse(configAttr) : {};
    }

    if (!this.shadowRoot) {
      this.attachShadow({ mode: "open" });
      this.shadowRoot!.innerHTML = getTemplateHTML(
        namedNodeMapToObject(this.attributes),
        this.#config ?? undefined,
      );
      iframe = this.shadowRoot!.querySelector("iframe");
    } else if (!iframe) {
      this.shadowRoot.innerHTML = getTemplateHTML(
        namedNodeMapToObject(this.attributes),
        this.#config ?? undefined,
      );
      iframe = this.shadowRoot.querySelector("iframe");
    } else {
      // Update iframe src
      const newSrc = serializeIframeUrl(
        namedNodeMapToObject(this.attributes),
        this.#config ?? undefined,
      );
      if (newSrc) {
        iframe.src = newSrc;
      }
    }

    if (!iframe) {
      this.loadComplete.reject(new Error("Failed to create iframe"));
      return;
    }

    try {
      const PeerTubePlayerConstructor = await getSDK();
      this.api = new PeerTubePlayerConstructor(iframe);

      await this.api.ready;

      // Set up event listeners
      this.api.addEventListener("playbackStatusUpdate", (data: unknown) => {
        const statusData = data as { position: number; duration: number };
        const prevTime = this.#currentTime;
        this.#currentTime = statusData.position;

        if (statusData.duration && statusData.duration !== this.#duration) {
          this.#duration = statusData.duration;
          this.dispatchEvent(new Event("durationchange"));
        }

        if (prevTime !== this.#currentTime) {
          this.dispatchEvent(new Event("timeupdate"));
        }

        // Update progress (buffered)
        this.#progress = statusData.position;
        this.dispatchEvent(new Event("progress"));
      });

      this.api.addEventListener("playbackStatusChange", (status: unknown) => {
        const statusStr = status as string;
        if (statusStr === "playing") {
          if (this.#paused) {
            this.#paused = false;
            this.dispatchEvent(new Event("play"));
          }
          this.#readyState = 3; // HTMLMediaElement.HAVE_FUTURE_DATA
          this.dispatchEvent(new Event("playing"));
        } else if (statusStr === "paused") {
          this.#paused = true;
          this.dispatchEvent(new Event("pause"));
        } else if (statusStr === "ended") {
          this.#paused = true;
          this.dispatchEvent(new Event("ended"));
        }
      });

      // Handle resolution change for video dimensions
      this.api.addEventListener("resolutionChange", (data: unknown) => {
        const resData = data as { width?: number; height?: number };
        if (resData.width) this.#videoWidth = resData.width;
        if (resData.height) this.#videoHeight = resData.height;
        this.dispatchEvent(new Event("resize"));
      });

      await onLoaded();
    } catch (error) {
      this.loadComplete.reject(error);
      this.dispatchEvent(new ErrorEvent("error", { error }));
    }

    await this.loadComplete;
  }

  async attributeChangedCallback(
    attrName: string,
    oldValue: string | null,
    newValue: string | null,
  ): Promise<void> {
    if (oldValue === newValue) return;

    // These attributes trigger a reload
    switch (attrName) {
      case "autoplay":
      case "controls":
      case "src": {
        this.load();
        return;
      }
    }

    await this.loadComplete;

    switch (attrName) {
      case "loop": {
        // PeerTube doesn't have a setLoop method, handled via embed params
        break;
      }
      case "muted": {
        if (!this.#canUseApi()) break;
        try {
          if (this.defaultMuted) {
            this.#volumeBeforeMute = this.#volume || 1;
            this.api!.setVolume(0).catch(() => void 0);
          } else {
            this.api!.setVolume(this.#volumeBeforeMute).catch(() => void 0);
          }
        } catch {
          // PeerTube SDK can throw before iframe ready
        }
        break;
      }
    }
  }

  async play(): Promise<void> {
    this.#paused = false;
    this.dispatchEvent(new Event("play"));

    await this.loadComplete;

    if (!this.#canUseApi()) return;
    try {
      await this.api!.play();
    } catch (error) {
      this.#paused = true;
      this.dispatchEvent(new Event("pause"));
      throw error;
    }
  }

  async pause(): Promise<void> {
    await this.loadComplete;
    if (!this.#canUseApi()) return;
    try {
      return await this.api!.pause();
    } catch {
      return undefined;
    }
  }

  get ended(): boolean {
    return this.#currentTime >= this.#duration;
  }

  get seeking(): boolean {
    return this.#seeking;
  }

  get readyState(): number {
    return this.#readyState;
  }

  get videoWidth(): number {
    return this.#videoWidth;
  }

  get videoHeight(): number {
    return this.#videoHeight;
  }

  get src(): string | null {
    return this.getAttribute("src");
  }

  set src(val: string | null) {
    if (this.src === val) return;
    if (val) {
      this.setAttribute("src", val);
    } else {
      this.removeAttribute("src");
    }
  }

  get paused(): boolean {
    return this.#paused;
  }

  get duration(): number {
    return this.#duration;
  }

  get autoplay(): boolean {
    return this.hasAttribute("autoplay");
  }

  set autoplay(val: boolean) {
    if (this.autoplay === val) return;
    this.toggleAttribute("autoplay", Boolean(val));
  }

  get seekable(): TimeRanges {
    if (this.#duration > 0) {
      return createTimeRanges(0, this.#duration);
    }
    return createTimeRanges();
  }

  get buffered(): TimeRanges {
    if (this.#progress > 0) {
      return createTimeRanges(0, this.#progress);
    }
    return createTimeRanges();
  }

  get controls(): boolean {
    return this.hasAttribute("controls");
  }

  set controls(val: boolean) {
    if (this.controls === val) return;
    this.toggleAttribute("controls", Boolean(val));
  }

  get currentTime(): number {
    return this.#currentTime;
  }

  set currentTime(val: number) {
    if (this.currentTime === val) return;
    this.#currentTime = val;
    this.#seeking = true;
    this.dispatchEvent(new Event("seeking"));

    console.log("set currentTime", val);
    this.loadComplete.then(() => {
      if (!this.#canUseApi()) {
        this.#seeking = false;
        return;
      }
      try {
        this.api!.seek(val)
          .then(() => {
            this.#seeking = false;
            this.dispatchEvent(new Event("seeked"));
          })
          .catch(() => {
            this.#seeking = false;
            void 0;
          });
      } catch {
        this.#seeking = false;
      }
    });
  }

  get defaultMuted(): boolean {
    return this.hasAttribute("muted");
  }

  set defaultMuted(val: boolean) {
    if (this.defaultMuted === val) return;
    this.toggleAttribute("muted", Boolean(val));
  }

  get loop(): boolean {
    return this.hasAttribute("loop");
  }

  set loop(val: boolean) {
    if (this.loop === val) return;
    this.toggleAttribute("loop", Boolean(val));
  }

  get muted(): boolean {
    return this.#muted;
  }

  set muted(val: boolean) {
    if (this.muted === val) return;
    this.#muted = val;
    this.loadComplete.then(() => {
      if (!this.#canUseApi()) return;
      try {
        if (val) {
          this.#volumeBeforeMute = this.#volume || 1;
          this.api!.setVolume(0).catch(() => void 0);
        } else {
          this.api!.setVolume(this.#volumeBeforeMute).catch(() => void 0);
        }
      } catch {
        // PeerTube SDK can throw before iframe ready
      }
    });
    this.dispatchEvent(new Event("volumechange"));
  }

  get playbackRate(): number {
    return this.#playbackRate;
  }

  set playbackRate(val: number) {
    if (this.playbackRate === val) return;
    this.#playbackRate = val;
    this.loadComplete.then(() => {
      if (!this.#canUseApi()) return;
      try {
        this.api!.setPlaybackRate(val).catch(() => void 0);
      } catch {
        // PeerTube SDK can throw before iframe ready
      }
    });
    this.dispatchEvent(new Event("ratechange"));
  }

  get playsInline(): boolean {
    return this.hasAttribute("playsinline");
  }

  set playsInline(val: boolean) {
    if (this.playsInline === val) return;
    this.toggleAttribute("playsinline", Boolean(val));
  }

  get poster(): string | null {
    return this.getAttribute("poster");
  }

  set poster(val: string | null) {
    if (this.poster === val) return;
    if (val) {
      this.setAttribute("poster", val);
    } else {
      this.removeAttribute("poster");
    }
  }

  get preload(): string | null {
    return this.getAttribute("preload");
  }

  set preload(val: string | null) {
    if (this.preload === val) return;
    if (val) {
      this.setAttribute("preload", val);
    } else {
      this.removeAttribute("preload");
    }
  }

  get volume(): number {
    return this.#volume;
  }

  set volume(val: number) {
    if (this.volume === val) return;
    this.#volume = val;
    this.loadComplete.then(() => {
      if (!this.#canUseApi()) return;
      try {
        this.api!.setVolume(val).catch(() => void 0);
      } catch {
        // PeerTube SDK can throw "Channel.build() called without a valid window" e.g. before iframe ready
      }
    });
    this.dispatchEvent(new Event("volumechange"));
  }

  // This is a pattern to update property values that are set before
  // the custom element is upgraded.
  // https://web.dev/custom-elements-best-practices/#make-properties-lazy
  #upgradeProperty(prop: keyof this) {
    if (Object.hasOwn(this, prop)) {
      const value = this[prop];
      // Delete the set property from this instance.
      delete this[prop];
      // Set the value again via the (prototype) setter on this class.
      this[prop] = value;
    }
  }
}

function serializeAttributes(attrs: Record<string, string | number>): string {
  let html = "";
  for (const key in attrs) {
    const value = attrs[key];
    if (value === "") html += ` ${escapeHtml(key)}`;
    else html += ` ${escapeHtml(key)}="${escapeHtml(`${value}`)}"`;
  }
  return html;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
    .replace(/`/g, "&#x60;");
}

function serialize(props: Record<string, unknown>): string {
  return String(
    new URLSearchParams(boolToBinary(props) as Record<string, string>),
  );
}

function boolToBinary(
  props: Record<string, unknown>,
): Record<string, string | number> {
  const p: Record<string, string | number> = {};
  for (const key in props) {
    const val = props[key];
    if (val === true || val === "") p[key] = 1;
    else if (val === false) p[key] = 0;
    else if (val != null) p[key] = val as string | number;
  }
  return p;
}

function namedNodeMapToObject(
  namedNodeMap: NamedNodeMap,
): Record<string, string> {
  const obj: Record<string, string> = {};
  for (const attr of namedNodeMap) {
    obj[attr.name] = attr.value;
  }
  return obj;
}

/**
 * Creates a fake `TimeRanges` object.
 */
function createTimeRanges(start?: number, end?: number): TimeRanges {
  if (start == null || end == null || (start === 0 && end === 0)) {
    return createTimeRangesObj([[0, 0]]);
  }
  return createTimeRangesObj([[start, end]]);
}

function createTimeRangesObj(ranges: number[][]): TimeRanges {
  return {
    length: ranges.length,
    start: (i: number) => ranges[i][0],
    end: (i: number) => ranges[i][1],
  };
}

// Register the custom element
if (
  typeof globalThis !== "undefined" &&
  globalThis.customElements &&
  !globalThis.customElements.get("peertube-video")
) {
  globalThis.customElements.define("peertube-video", PeerTubeVideoElement);
}

// Type declaration for use in HTML
declare global {
  interface HTMLElementTagNameMap {
    "peertube-video": PeerTubeVideoElement;
  }
}

export default PeerTubeVideoElement;
export { PeerTubeVideoElement };
