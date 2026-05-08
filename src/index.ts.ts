import "dotenv/config";
import { Bot, GrammyError, HttpError } from "grammy";
import { createDb, TaskRepository } from "./db";
import { formatTaskList, formatHelp } from "./format";
import { AlertService } from "./alerts";

const TOKEN = process.env.BOT_TOKEN;
if (!TOKEN) throw new Error("BOT_TOKEN is not set in .env");

const bot = new Bot(TOKEN);
const db = createDb();
const repo = new TaskRepository(db);
const alerts = new AlertService(bot);

// ── /start & /help ────────────────────────────────────────────────────────────
bot.command(["start", "help"], (ctx) =>
  ctx.reply(formatHelp(), { parse_mode: "MarkdownV2" })
);

// ── /add <text> ───────────────────────────────────────────────────────────────
bot.command("add", (ctx) => {
  const text = ctx.match.trim();
  if (!text) return ctx.reply("✏️ Напиши текст задачи: /add Купить молоко");
  const task = repo.add(ctx.from!.id, text);
  return ctx.reply(`✅ Задача *#${task.id}* добавлена\\!`, { parse_mode: "MarkdownV2" });
});

// ── /list ─────────────────────────────────────────────────────────────────────
bot.command("list", (ctx) => {
  const tasks = repo.list(ctx.from!.id);
  return ctx.reply(formatTaskList(tasks), { parse_mode: "MarkdownV2" });
});

// ── /done <id> ────────────────────────────────────────────────────────────────
bot.command("done", (ctx) => {
  const id = parseInt(ctx.match.trim(), 10);
  if (isNaN(id)) return ctx.reply("❓ Укажи номер задачи: /done 3");
  const changed = repo.markDone(id, ctx.from!.id);
  if (!changed) return ctx.reply(`⚠️ Задача #${id} не найдена или уже выполнена.`);
  return ctx.reply(`🎉 Задача *#${id}* отмечена как выполненная\\!`, { parse_mode: "MarkdownV2" });
});

// ── /delete <id> ──────────────────────────────────────────────────────────────
bot.command("delete", (ctx) => {
  const id = parseInt(ctx.match.trim(), 10);
  if (isNaN(id)) return ctx.reply("❓ Укажи номер задачи: /delete 3");
  const deleted = repo.delete(id, ctx.from!.id);
  if (!deleted) return ctx.reply(`⚠️ Задача #${id} не найдена.`);
  return ctx.reply(`🗑 Задача *#${id}* удалена\\.`, { parse_mode: "MarkdownV2" });
});

// ── /clear ────────────────────────────────────────────────────────────────────
bot.command("clear", (ctx) => {
  const count = repo.clearDone(ctx.from!.id);
  if (count === 0) return ctx.reply("🤷 Нет выполненных задач для удаления.");
  return ctx.reply(`🧹 Удалено *${count}* выполненных задач\\.`, { parse_mode: "MarkdownV2" });
});

// ── /alerts ───────────────────────────────────────────────────────────────────
bot.command("alerts", (ctx) => {
  const sub = ctx.match.trim().toLowerCase();
  const userId = ctx.from!.id;

  if (sub === "on") {
    const added = alerts.subscribe(userId);
    if (!added) return ctx.reply("🔔 Алерты уже включены\\! Жду движений ≥10% за 1ч по топ\\-10 монетам\\.", { parse_mode: "MarkdownV2" });
    return ctx.reply(
      "🔔 *Алерты включены\\!*\n\nБуду присылать уведомление когда любая монета из топ\\-10 изменится на 10% и больше за последний час\\.\n\nПроверка каждые 15 минут\\.",
      { parse_mode: "MarkdownV2" }
    );
  }

  if (sub === "off") {
    const removed = alerts.unsubscribe(userId);
    if (!removed) return ctx.reply("🔕 Алерты и так выключены.");
    return ctx.reply("🔕 Алерты выключены\\. Напиши /alerts on чтобы включить снова\\.", { parse_mode: "MarkdownV2" });
  }

  if (sub === "status") {
    const on = alerts.isSubscribed(userId);
    return ctx.reply(
      on
        ? "🔔 Алерты *включены*\\. Слежу за топ\\-10, порог 10% за 1ч\\."
        : "🔕 Алерты *выключены*\\. Напиши /alerts on чтобы включить\\.",
      { parse_mode: "MarkdownV2" }
    );
  }

  return ctx.reply(
    "📋 *Управление алертами:*\n\n/alerts on — включить\n/alerts off — выключить\n/alerts status — статус",
    { parse_mode: "MarkdownV2" }
  );
});

// ── Unknown messages ──────────────────────────────────────────────────────────
bot.on("message:text", (ctx) =>
  ctx.reply("Не понимаю 🤔 Напиши /help чтобы увидеть список команд.")
);

// ── Error handling ────────────────────────────────────────────────────────────
bot.catch(({ ctx, error }) => {
  console.error(`Error in update ${ctx.update.update_id}:`);
  if (error instanceof GrammyError) console.error("Grammy:", error.description);
  else if (error instanceof HttpError) console.error("HTTP:", error);
  else console.error("Unknown:", error);
});

bot.start({ onStart: () => console.log("🤖 Bot is running with alerts...") });
