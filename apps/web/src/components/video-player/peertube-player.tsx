import type React from "react";
import { Component } from "react";
import type { VideoElementProps } from "react-player";

// PeerTube URL pattern
const MATCH_URL_PEERTUBE = /^(https?):\/\/(.*)\/w\/(.*)$/;

// SDK configuration
const SDK_URL = "https://unpkg.com/@peertube/embed-api/build/player.min.js";
const SDK_GLOBAL = "PeerTubePlayer";

// Helper function to load the PeerTube SDK
function getSDK(url: string, sdkGlobal: string): Promise<void> {
  return new Promise((resolve, reject) => {
    // Check if SDK is already loaded
    if ((window as any)[sdkGlobal]) {
      resolve();
      return;
    }

    // Check if script is already being loaded
    const existingScript = document.querySelector(`script[src="${url}"]`);
    if (existingScript) {
      existingScript.addEventListener("load", () => resolve());
      existingScript.addEventListener("error", reject);
      return;
    }

    // Load the script
    const script = document.createElement("script");
    script.src = url;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

// Helper function to create query string
function queryString(params: Record<string, any>): string {
  return Object.keys(params)
    .filter((key) => params[key] !== undefined && params[key] !== null)
    .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    .join("&");
}

interface PeerTubePlayer {
  ready: Promise<void>;
  play: () => Promise<void>;
  pause: () => Promise<void>;
  seek: (seconds: number) => Promise<void>;
  setVolume: (volume: number) => Promise<void>;
  getVolume: () => Promise<number>;
  setPlaybackRate: (rate: number) => Promise<void>;
  getPlaybackRate: () => Promise<number>;
  addEventListener: (event: string, handler: (data?: any) => void) => void;
  removeEventListener: (event: string, handler: (data?: any) => void) => void;
}

export class PeerTubePlayerComponent extends Component<VideoElementProps> {
  static displayName = "PeerTubePlayer";

  static canPlay(url: string): boolean {
    return MATCH_URL_PEERTUBE.test(url);
  }

  private iframe: HTMLIFrameElement | null = null;
  private player: PeerTubePlayer | null = null;
  private currentTime = 0;
  private duration = 0;
  private playbackRate = 1;
  private progressInterval: number | null = null;

  componentDidMount() {
    this.props.onMount?.(this);
  }

  componentWillUnmount() {
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
    }
  }

  componentDidUpdate(prevProps: VideoElementProps) {
    const { playing, volume, muted, playbackRate } = this.props;

    if (playing !== prevProps.playing) {
      if (playing) {
        this.play();
      } else {
        this.pause();
      }
    }

    if (volume !== prevProps.volume && volume !== undefined) {
      this.setVolume(volume);
    }

    if (playbackRate !== prevProps.playbackRate && playbackRate !== undefined) {
      this.setPlaybackRate(playbackRate);
    }
  }

  private getEmbedUrl = (): string => {
    const { config, src } = this.props;
    const match = MATCH_URL_PEERTUBE.exec(src);

    if (!match) {
      return "";
    }

    const peertubeConfig = config && typeof config === "object" && "peertube" in config
      ? (config as { peertube?: Record<string, any> }).peertube || {}
      : {};
    const query = queryString({
      ...peertubeConfig,
      api: 1,
    });

    return `${match[1]}://${match[2]}/videos/embed/${match[3]}?${query}`;
  };

  load() {
    getSDK(SDK_URL, SDK_GLOBAL)
      .then(() => {
        if (!this.iframe) {
          return;
        }

        const PeerTubePlayerConstructor = (window as any)[SDK_GLOBAL];
        this.player = new PeerTubePlayerConstructor(this.iframe);

        this.player?.ready.then(() => {
          // Set up event listeners
          this.player?.addEventListener("playbackStatusUpdate", (data: any) => {
            this.currentTime = data.position;
            this.duration = data.duration;

            // Call onProgress callback
            if (this.props.onProgress) {
              this.props.onProgress({
                playedSeconds: data.position,
                loadedSeconds: 0, // PeerTube doesn't provide buffered/loaded seconds
              });
            }

            // Call onDuration callback once
            if (this.duration && this.props.onDuration) {
              this.props.onDuration(this.duration);
            }
          });

          this.player?.addEventListener("playbackStatusChange", (status: string) => {
            if (status === "playing") {
              this.props.onPlay?.();
            } else if (status === "paused") {
              this.props.onPause?.();
            }
          });

          // Start progress updates if playing
          if (this.props.playing) {
            this.play();
          }

          this.props.onReady?.();
        });
      })
      .catch((error) => {
        this.props.onError?.(error);
      });
  }

  play() {
    this.callPlayer("play");
  }

  pause() {
    this.callPlayer("pause");
  }

  stop() {
    this.pause();
  }

  seekTo(seconds: number, _keepPlaying?: boolean) {
    this.callPlayer("seek", seconds);
  }

  setVolume(fraction: number) {
    this.callPlayer("setVolume", fraction);
  }

  setPlaybackRate(rate: number) {
    if (this.player) {
      this.player.setPlaybackRate(rate).catch((error) => {
        console.error("Failed to set playback rate:", error);
      });
    }
  }

  getDuration(): number {
    return this.duration;
  }

  getCurrentTime(): number {
    return this.currentTime;
  }

  getSecondsLoaded(): number {
    return this.currentTime; // PeerTube doesn't provide this info
  }

  private callPlayer(method: string, ...args: any[]) {
    if (!this.player) {
      return;
    }

    const func = (this.player as any)[method];
    if (typeof func === "function") {
      func.apply(this.player, args).catch((error: Error) => {
        console.error(`PeerTube player error calling ${method}:`, error);
      });
    }
  }

  private ref = (iframe: HTMLIFrameElement | null) => {
    this.iframe = iframe;
  };

  render() {
    const style: React.CSSProperties = {
      width: "100%",
      height: "100%",
      margin: 0,
      padding: 0,
      border: 0,
      overflow: "hidden",
    };

    const { src } = this.props;

    return (
      <iframe
        key={src}
        ref={this.ref}
        style={style}
        src={this.getEmbedUrl()}
        id="peerTubeContainer"
        allow="autoplay; fullscreen"
        sandbox="allow-same-origin allow-scripts allow-popups"
        title="PeerTube Video Player"
      />
    );
  }
}

export default PeerTubePlayerComponent;
