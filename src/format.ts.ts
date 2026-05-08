import { Task } from "./db";

export function formatTaskList(tasks: Task[]): string {
  if (tasks.length === 0) {
    return "📭 У тебя пока нет задач.\n\nДобавь первую: /add Купить молоко";
  }

  const pending = tasks.filter((t) => !t.done);
  const done = tasks.filter((t) => t.done);
  const lines: string[] = [];

  if (pending.length > 0) {
    lines.push("📋 *Активные задачи:*");
    for (const t of pending) {
      lines.push(`  ⬜ \`${t.id}\` ${escapeMarkdown(t.text)}`);
    }
  }

  if (done.length > 0) {
    lines.push("");
    lines.push("✅ *Выполненные:*");
    for (const t of done) {
      lines.push(`  ~~\`${t.id}\` ${escapeMarkdown(t.text)}~~`);
    }
  }

  lines.push("");
  lines.push(
    `📊 Всего: *${tasks.length}* | Выполнено: *${done.length}* | Осталось: *${pending.length}*`
  );

  return lines.join("\n");
}

export function formatHelp(): string {
  return [
    "🤖 *Todo\\-бот — список команд:*",
    "",
    "➕ `/add <текст>` — добавить задачу",
    "📋 `/list` — показать все задачи",
    "✅ `/done <id>` — отметить выполненной",
    "🗑 `/delete <id>` — удалить задачу",
    "🧹 `/clear` — удалить все выполненные",
    "",
    "📈 *Крипто алерты:*",
    "🔔 `/alerts on` — включить уведомления",
    "🔕 `/alerts off` — выключить",
    "📊 `/alerts status` — статус",
    "",
    "_Алерты срабатывают при изменении цены топ\\-10 монет на 10%\\+ за 1 час_",
  ].join("\n");
}

function escapeMarkdown(text: string): string {
  return text.replace(/([_*[\]()~`>#+\-=|{}.!\\])/g, "\\$1");
}
