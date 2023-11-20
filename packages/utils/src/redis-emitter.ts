import { createClient } from 'redis';

type Callback = (message: string) => void;

export class RedisEventEmitter {
  private pubClient
  private subClient
  private listeners: Map<string, Callback[]>;

  constructor(redisUrl?: string) {
    const clientOptions = redisUrl ? { url: redisUrl } : {};

    this.pubClient = createClient(clientOptions);
    this.subClient = createClient(clientOptions);
    this.listeners = new Map();

    this.subClient.on('message', (channel, message) => {
      this.emit(channel, message);
    });
  }

  subscribe(channel: string): void {
    this.subClient.subscribe(channel, (message) => this.emit(channel, message));
  }

  unsubscribe(channel: string): void {
    this.subClient.unsubscribe(channel);
  }

  publish(channel: string, message: string): void {
    this.pubClient.publish(channel, message);
  }

  on(channel: string, callback: Callback): void {
    if (!this.listeners.has(channel)) {
      this.listeners.set(channel, []);
    }
    this.listeners.get(channel)?.push(callback);
  }

  private emit(channel: string, message: string): void {
    this.listeners.get(channel)?.forEach(callback => callback(message));
  }
}
