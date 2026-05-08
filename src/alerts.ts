import { Bot } from "grammy";

const COINGECKO_URL =
  "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=false&price_change_percentage=1h";

const THRESHOLD = 10; // percent
const INTERVAL_MS = 15 * 60 * 1000; // 15 minutes

interface CoinData {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_1h_in_currency: number;
}

export class AlertService {
  private subscribers = new Set<number>();
  private timer: ReturnType<typeof setInterval> | null = null;

  constructor(private bot: Bot) {}

  subscribe(userId: number): boolean {
    if (this.subscribers.has(userId)) return false;
    this.subscribers.add(userId);
    this.ensureRunning();
    return true;
  }

  unsubscribe(userId: number): boolean {
    const had = this.subscribers.has(userId);
    this.subscribers.delete(userId);
    if (this.subscribers.size === 0) this.stop();
    return had;
  }

  isSubscribed(userId: number): boolean {
    return this.subscribers.has(userId);
  }

  subscriberCount(): number {
    return this.subscribers.size;
  }

  private ensureRunning() {
    if (this.timer) return;
    console.log("Alert service started");
    this.timer = setInterval(() => this.check(), INTERVAL_MS);
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
      console.log("Alert service stopped");
    }
  }

  async check() {
    if (this.subscribers.size === 0) return;

    let coins: CoinData[];
    try {
      const res = await fetch(COINGECKO_URL);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      coins = await res.json();
    } catch (e) {
      console.error("Alert check failed:", e);
      return;
    }

    const triggered = coins.filter(
      (c) => Math.abs(c.price_change_percentage_1h_in_currency ?? 0) >= THRESHOLD
    );

    if (triggered.length === 0) return;

    const lines = triggered.map((c) => {
      const chg = c.price_change_percentage_1h_in_currency;
      const dir = chg >= 0 ? "🟢 ▲" : "🔴 ▼";
      const price = c.current_price >= 1
        ? `$${c.current_price.toLocaleString("en", { maximumFractionDigits: 2 })}`
        : `$${c.current_price.toFixed(4)}`;
      return `${dir} *${c.symbol.toUpperCase()}* ${price} \\(${chg >= 0 ? "+" : ""}${chg.toFixed(1)}% за 1ч\\)`;
    });

    const message =
      `🚨 *Резкое движение цены\\!*\n\n` +
      lines.join("\n") +
      `\n\n_Порог: ${THRESHOLD}% за 1 час_`;

    for (const userId of this.subscribers) {
      try {
        await this.bot.api.sendMessage(userId, message, { parse_mode: "MarkdownV2" });
      } catch (e) {
        console.error(`Failed to notify ${userId}:`, e);
        this.subscribers.delete(userId);
      }
    }
  }
}
