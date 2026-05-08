\# 🤖 tg-todo-bot



Telegram bot for managing personal tasks with crypto price alerts — built with TypeScript, grammY and SQLite.



\## Features



\- 📋 Personal task lists per user

\- ✅ Mark tasks as done

\- 🗑 Delete individual tasks or bulk-clear completed ones

\- 🔔 Crypto price alerts — get notified when top-10 coins move 10%+ in 1 hour

\- 💾 Persistent storage via SQLite

\- 🔒 Type-safe codebase with strict TypeScript



\## Commands



\### Tasks

| Command | Description |

|---|---|

| `/add <text>` | Add a new task |

| `/list` | Show all tasks |

| `/done <id>` | Mark task as completed |

| `/delete <id>` | Delete a task |

| `/clear` | Remove all completed tasks |



\### Crypto Alerts

| Command | Description |

|---|---|

| `/alerts on` | Enable price alerts |

| `/alerts off` | Disable price alerts |

| `/alerts status` | Check alert status |



\## Getting Started



\### 1. Create a bot

Talk to @BotFather on Telegram and create a new bot. Copy the token.



\### 2. Clone and install

```bash

git clone https://github.com/timneyatebe/tg-todo-bot.git

cd tg-todo-bot

npm install

```



\### 3. Configure environment

```bash

cp .env.example .env

\# Edit .env and paste your BOT\_TOKEN

```



\### 4. Run

```bash

\# Development

npm run dev



\# Production

npm run build \&\& npm start

```



\## Tech Stack



\- \*\*Runtime\*\*: Node.js

\- \*\*Language\*\*: TypeScript

\- \*\*Bot framework\*\*: grammY

\- \*\*Database\*\*: SQLite via better-sqlite3

\- \*\*Crypto data\*\*: CoinGecko API



\## License



MIT

