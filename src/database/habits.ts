import { db, isWeb, getLocalTable, saveLocalTable } from './connection';
import { generateUUID } from '../utils/uuid';

export interface Habit {
  id: string;
  user_id: string;
  name: string;
  icon: string;
  color: string;
  created_at: string;
}

export interface HabitLog {
  id: string;
  habit_id: string;
  log_date: string; // YYYY-MM-DD
  is_completed: boolean;
}

export interface HabitWithStreak extends Habit {
  is_completed_today: boolean;
  streak: number;
}

export function initHabitsTable() {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS habits (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      icon TEXT,
      color TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE TABLE IF NOT EXISTS habit_logs (
      id TEXT PRIMARY KEY,
      habit_id TEXT NOT NULL,
      log_date TEXT NOT NULL,
      is_completed INTEGER DEFAULT 0,
      UNIQUE(habit_id, log_date),
      FOREIGN KEY (habit_id) REFERENCES habits(id) ON DELETE CASCADE
    );
  `);
}

export function addHabit(data: { userId: string; name: string; icon: string; color: string }): Habit {
  const id = generateUUID();
  const now = new Date().toISOString();

  const newHabit: Habit = {
    id,
    user_id: data.userId,
    name: data.name,
    icon: data.icon,
    color: data.color,
    created_at: now
  };

  if (isWeb) {
    const table = getLocalTable<Habit>('habits');
    table.push(newHabit);
    saveLocalTable('habits', table);
    return newHabit;
  }

  db.runSync(
    `INSERT INTO habits (id, user_id, name, icon, color, created_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [id, data.userId, data.name, data.icon, data.color, now]
  );

  return newHabit;
}

export function getHabits(): Habit[] {
  if (isWeb) {
    return getLocalTable<Habit>('habits')
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  }
  return db.getAllSync<Habit>('SELECT * FROM habits ORDER BY created_at ASC');
}

export function getAllHabitLogs(): HabitLog[] {
  if (isWeb) {
    return getLocalTable<HabitLog>('habit_logs');
  }
  // SQLite stores boolean as 0 or 1. We need to map it.
  const rawLogs = db.getAllSync<any>('SELECT * FROM habit_logs');
  return rawLogs.map(l => ({
    ...l,
    is_completed: l.is_completed === 1
  }));
}

export function toggleHabitLog(habitId: string, logDate: string, isCompleted: boolean) {
  const id = generateUUID();
  
  if (isWeb) {
    const table = getLocalTable<HabitLog>('habit_logs');
    const idx = table.findIndex(x => x.habit_id === habitId && x.log_date === logDate);
    if (idx >= 0) {
      table[idx].is_completed = isCompleted;
    } else {
      table.push({ id, habit_id: habitId, log_date: logDate, is_completed: isCompleted });
    }
    saveLocalTable('habit_logs', table);
    return;
  }

  // Sử dụng INSERT OR REPLACE nhờ UNIQUE(habit_id, log_date)
  db.runSync(
    `INSERT OR REPLACE INTO habit_logs (id, habit_id, log_date, is_completed)
     VALUES (
       COALESCE((SELECT id FROM habit_logs WHERE habit_id = ? AND log_date = ?), ?), 
       ?, ?, ?
     )`,
    [habitId, logDate, id, habitId, logDate, isCompleted ? 1 : 0]
  );
}

// Lấy danh sách thói quen kèm thông tin đã check-in hôm nay và số ngày liên tiếp (Streak)
export function getHabitsWithTodayLog(todayDateString: string): HabitWithStreak[] {
  const habits = getHabits();
  let allLogs: any[] = [];
  
  if (isWeb) {
    allLogs = getLocalTable<HabitLog>('habit_logs')
      .filter(x => x.is_completed)
      .sort((a, b) => new Date(b.log_date).getTime() - new Date(a.log_date).getTime());
  } else {
    allLogs = db.getAllSync<any>('SELECT * FROM habit_logs WHERE is_completed = 1 ORDER BY log_date DESC');
  }
  
  // Parse logs into a map for fast lookup
  const logsMap: Record<string, string[]> = {};
  allLogs.forEach(log => {
    if (!logsMap[log.habit_id]) {
      logsMap[log.habit_id] = [];
    }
    logsMap[log.habit_id].push(log.log_date); // Đã được sắp xếp DESC từ SQL
  });

  return habits.map(habit => {
    const habitLogs = logsMap[habit.id] || [];
    const isCompletedToday = habitLogs.includes(todayDateString);
    
    // Tính chuỗi (Streak)
    let streak = 0;
    let currentDate = new Date(todayDateString);
    
    // Nếu hôm nay chưa làm, ta bắt đầu đếm lùi từ hôm qua. Nếu hqua làm thì streak vẫn còn.
    if (!isCompletedToday) {
      currentDate.setDate(currentDate.getDate() - 1);
    }
    
    while (true) {
      const checkDateStr = currentDate.toISOString().split('T')[0];
      if (habitLogs.includes(checkDateStr)) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1); // Lùi 1 ngày
      } else {
        break; // Bị đứt chuỗi
      }
    }

    return {
      ...habit,
      is_completed_today: isCompletedToday,
      streak
    };
  });
}

// Dùng cho hàm Sync
export function upsertHabitLocal(habit: Habit) {
  if (isWeb) {
    const table = getLocalTable<Habit>('habits');
    const idx = table.findIndex(x => x.id === habit.id);
    if (idx >= 0) table[idx] = habit;
    else table.push(habit);
    saveLocalTable('habits', table);
    return;
  }

  db.runSync(
    `INSERT OR REPLACE INTO habits (id, user_id, name, icon, color, created_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [habit.id, habit.user_id, habit.name, habit.icon, habit.color, habit.created_at]
  );
}

export function upsertHabitLogLocal(log: HabitLog) {
  if (isWeb) {
    const table = getLocalTable<HabitLog>('habit_logs');
    const idx = table.findIndex(x => x.id === log.id);
    if (idx >= 0) table[idx] = log;
    else table.push(log);
    saveLocalTable('habit_logs', table);
    return;
  }

  db.runSync(
    `INSERT OR REPLACE INTO habit_logs (id, habit_id, log_date, is_completed)
     VALUES (?, ?, ?, ?)`,
    [log.id, log.habit_id, log.log_date, log.is_completed ? 1 : 0]
  );
}

// Automation: Sinh log mặc định (chưa hoàn thành) cho ngày mới để đồng bộ Cloud dễ dàng
export function seedDailyHabitLogs(todayStr: string) {
  const habits = getHabits();
  if (isWeb) {
    const table = getLocalTable<HabitLog>('habit_logs');
    let changed = false;
    habits.forEach(h => {
      const exists = table.find(x => x.habit_id === h.id && x.log_date === todayStr);
      if (!exists) {
        table.push({ id: generateUUID(), habit_id: h.id, log_date: todayStr, is_completed: false });
        changed = true;
      }
    });
    if (changed) saveLocalTable('habit_logs', table);
    return;
  }

  habits.forEach(h => {
    const id = generateUUID();
    // Dùng INSERT OR IGNORE để không ghi đè nếu đã có log cho ngày hôm nay
    db.runSync(
      `INSERT OR IGNORE INTO habit_logs (id, habit_id, log_date, is_completed)
       VALUES (?, ?, ?, 0)`,
      [id, h.id, todayStr]
    );
  });
}
