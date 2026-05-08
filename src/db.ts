import Database from "better-sqlite3";
import path from "path";

export interface Task {
  id: number;
  user_id: number;
  text: string;
  done: boolean;
  created_at: string;
}

const DB_PATH = path.join(process.cwd(), "tasks.db");

export function createDb(): Database.Database {
  const db = new Database(DB_PATH);

  db.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id    INTEGER NOT NULL,
      text       TEXT    NOT NULL,
      done       INTEGER NOT NULL DEFAULT 0,
      created_at TEXT    NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_tasks_user ON tasks (user_id);
  `);

  return db;
}

export class TaskRepository {
  constructor(private db: Database.Database) {}

  add(userId: number, text: string): Task {
    const stmt = this.db.prepare(
      "INSERT INTO tasks (user_id, text) VALUES (?, ?) RETURNING *"
    );
    return stmt.get(userId, text) as Task;
  }

  list(userId: number): Task[] {
    return this.db
      .prepare("SELECT * FROM tasks WHERE user_id = ? ORDER BY id ASC")
      .all(userId) as Task[];
  }

  getByIdAndUser(id: number, userId: number): Task | undefined {
    return this.db
      .prepare("SELECT * FROM tasks WHERE id = ? AND user_id = ?")
      .get(id, userId) as Task | undefined;
  }

  markDone(id: number, userId: number): boolean {
    const result = this.db
      .prepare("UPDATE tasks SET done = 1 WHERE id = ? AND user_id = ? AND done = 0")
      .run(id, userId);
    return result.changes > 0;
  }

  delete(id: number, userId: number): boolean {
    const result = this.db
      .prepare("DELETE FROM tasks WHERE id = ? AND user_id = ?")
      .run(id, userId);
    return result.changes > 0;
  }

  clearDone(userId: number): number {
    const result = this.db
      .prepare("DELETE FROM tasks WHERE user_id = ? AND done = 1")
      .run(userId);
    return result.changes;
  }
}