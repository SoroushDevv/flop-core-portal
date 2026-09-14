export type BotMessageType = "info" | "success" | "error" | "warning";

export interface BotMessagePayload {
  text: string;
  type: BotMessageType;
  duration?: number;
}

export const botSpeak = (text: string, type: BotMessageType = "info", duration = 4000) => {
  if (typeof window !== "undefined") {
    const event = new CustomEvent<BotMessagePayload>("bot-speak", {
      detail: { text, type, duration },
    });
    window.dispatchEvent(event);
  }
};