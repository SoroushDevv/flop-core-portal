export interface BotEvent {
  id: string;
  text: string;
  type: "info" | "success" | "error";
  duration: number;
  timestamp: number;
}

type Listener = (event: BotEvent | null) => void;

class BotStateManager {
  private listeners: Listener[] = [];
  private currentEvent: BotEvent | null = null;
  private timer: NodeJS.Timeout | null = null;

  subscribe(listener: Listener): () => void {
    this.listeners.push(listener);
    if (this.currentEvent) {
      listener(this.currentEvent);
    }
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  notify(event: BotEvent | null) {
    this.currentEvent = event;
    this.listeners.forEach((l) => l(event));
  }

  speak(text: string, type: "info" | "success" | "error" = "info", duration = 4000) {
    if (this.timer) {
      clearTimeout(this.timer);
    }

    const event: BotEvent = {
      id: `bot-${Date.now()}-${Math.random()}`,
      text,
      type,
      duration,
      timestamp: Date.now(),
    };

    this.notify(event);

    this.timer = setTimeout(() => {
      this.notify(null);
    }, duration);
  }
}

export const botState = new BotStateManager();

export function botSpeak(
  text: string,
  type: "info" | "success" | "error" = "info",
  duration = 4000
) {
  botState.speak(text, type, duration);
}