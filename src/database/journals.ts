import { db } from './connection';

export interface Journal {
  id: string;
  user_id: string;
  entry_date: string;
  day_sequence?: string;
  content?: string;
  mood?: string;
  images: string; // JSON string array of image URIs
  created_at: string;
}

export interface AddJournalData {
  userId: string;
  entryDate: string;
  daySequence?: string;
  content?: string;
  mood?: string;
  images: string[]; // Array of local URIs or remote URLs
}

export function initJournalsTable() {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS journals (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      entry_date TEXT NOT NULL,
      day_sequence TEXT,
      content TEXT,
      mood TEXT,
      images TEXT DEFAULT '[]',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

export function getJournals(): Journal[] {
  return db.getAllSync<Journal>('SELECT * FROM journals ORDER BY entry_date DESC, created_at DESC');
}

export function getJournalById(id: string): Journal | null {
  return db.getFirstSync<Journal>('SELECT * FROM journals WHERE id = ?', [id]);
}

export function addJournal(data: AddJournalData): Journal {
  const id = Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
  const now = new Date().toISOString();
  const imagesStr = JSON.stringify(data.images || []);

  db.runSync(
    `INSERT INTO journals (id, user_id, entry_date, day_sequence, content, mood, images, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, data.userId, data.entryDate, data.daySequence || null, data.content || null, data.mood || null, imagesStr, now]
  );

  return {
    id,
    user_id: data.userId,
    entry_date: data.entryDate,
    day_sequence: data.daySequence,
    content: data.content,
    mood: data.mood,
    images: imagesStr,
    created_at: now
  };
}

export function updateJournal(id: string, data: AddJournalData) {
  const imagesStr = JSON.stringify(data.images || []);
  db.runSync(
    `UPDATE journals SET entry_date = ?, day_sequence = ?, content = ?, mood = ?, images = ? WHERE id = ?`,
    [data.entryDate, data.daySequence || null, data.content || null, data.mood || null, imagesStr, id]
  );
}

export function deleteJournal(id: string) {
  db.runSync('DELETE FROM journals WHERE id = ?', [id]);
}

export function upsertJournalLocal(journal: Journal) {
  db.runSync(
    `INSERT OR REPLACE INTO journals (id, user_id, entry_date, day_sequence, content, mood, images, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [journal.id, journal.user_id, journal.entry_date, journal.day_sequence || null, journal.content || null, journal.mood || null, journal.images, journal.created_at]
  );
}
