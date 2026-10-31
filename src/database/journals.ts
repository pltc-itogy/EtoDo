import { db, isWeb, getLocalTable, saveLocalTable } from './connection';
import { generateUUID } from '../utils/uuid';

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
  if (isWeb) {
    return getLocalTable<Journal>('journals')
      .sort((a, b) => {
        const dateDiff = new Date(b.entry_date).getTime() - new Date(a.entry_date).getTime();
        if (dateDiff !== 0) return dateDiff;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
  }
  return db.getAllSync<Journal>('SELECT * FROM journals ORDER BY entry_date DESC, created_at DESC');
}

export function getJournalById(id: string): Journal | null {
  if (isWeb) {
    const table = getLocalTable<Journal>('journals');
    return table.find(x => x.id === id) || null;
  }
  return db.getFirstSync<Journal>('SELECT * FROM journals WHERE id = ?', [id]);
}

export function addJournal(data: AddJournalData): Journal {
  const id = generateUUID();
  const now = new Date().toISOString();
  const imagesStr = JSON.stringify(data.images || []);
  
  const newJournal: Journal = {
    id,
    user_id: data.userId,
    entry_date: data.entryDate,
    day_sequence: data.daySequence,
    content: data.content,
    mood: data.mood,
    images: imagesStr,
    created_at: now
  };

  if (isWeb) {
    const table = getLocalTable<Journal>('journals');
    table.push(newJournal);
    saveLocalTable('journals', table);
    return newJournal;
  }

  db.runSync(
    `INSERT INTO journals (id, user_id, entry_date, day_sequence, content, mood, images, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, data.userId, data.entryDate, data.daySequence || null, data.content || null, data.mood || null, imagesStr, now]
  );

  return newJournal;
}

export function updateJournal(id: string, data: AddJournalData) {
  const imagesStr = JSON.stringify(data.images || []);
  
  if (isWeb) {
    const table = getLocalTable<Journal>('journals');
    const idx = table.findIndex(x => x.id === id);
    if (idx >= 0) {
      table[idx].entry_date = data.entryDate;
      table[idx].day_sequence = data.daySequence || undefined;
      table[idx].content = data.content || undefined;
      table[idx].mood = data.mood || undefined;
      table[idx].images = imagesStr;
      saveLocalTable('journals', table);
    }
    return;
  }

  db.runSync(
    `UPDATE journals SET entry_date = ?, day_sequence = ?, content = ?, mood = ?, images = ? WHERE id = ?`,
    [data.entryDate, data.daySequence || null, data.content || null, data.mood || null, imagesStr, id]
  );
}

export function deleteJournal(id: string) {
  if (isWeb) {
    let table = getLocalTable<Journal>('journals');
    table = table.filter(x => x.id !== id);
    saveLocalTable('journals', table);
    return;
  }
  db.runSync('DELETE FROM journals WHERE id = ?', [id]);
}

export function upsertJournalLocal(journal: Journal) {
  if (isWeb) {
    const table = getLocalTable<Journal>('journals');
    const idx = table.findIndex(x => x.id === journal.id);
    if (idx >= 0) table[idx] = journal;
    else table.push(journal);
    saveLocalTable('journals', table);
    return;
  }

  db.runSync(
    `INSERT OR REPLACE INTO journals (id, user_id, entry_date, day_sequence, content, mood, images, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [journal.id, journal.user_id, journal.entry_date, journal.day_sequence || null, journal.content || null, journal.mood || null, journal.images, journal.created_at]
  );
}
