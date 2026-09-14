import AsyncStorage from '@react-native-async-storage/async-storage';
import { autoCompletePastActivities } from '../database/activities';
import { seedDailyHabitLogs } from '../database/habits';

const LAST_OPEN_DATE_KEY = 'LAST_OPEN_DATE';

export async function checkNewDay() {
  try {
    const lastOpenDate = await AsyncStorage.getItem(LAST_OPEN_DATE_KEY);
    const todayStr = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
    
    if (lastOpenDate !== todayStr) {
      console.log(`[Automation] Nhận diện ngày mới: ${todayStr} (Ngày cũ: ${lastOpenDate || 'null'})`);
      
      // 1. Chạy các kịch bản tự động cho ngày mới
      runDailyCron(todayStr);

      // 2. Cập nhật lại ngày mở app
      await AsyncStorage.setItem(LAST_OPEN_DATE_KEY, todayStr);
    } else {
      console.log('[Automation] Vẫn là ngày cũ, bỏ qua Cron.');
    }
  } catch (error) {
    console.error('[Automation] Lỗi kiểm tra ngày mới:', error);
  }
}

function runDailyCron(todayStr: string) {
  try {
    console.log('[Automation] Đang chạy Daily Cron...');

    // A. Tự động hoàn thành các sự kiện đã qua ngày diễn ra (start_date)
    autoCompletePastActivities(todayStr);

    // B. Sinh log trống (is_completed = false) cho tất cả thói quen vào ngày hôm nay
    seedDailyHabitLogs(todayStr);

    console.log('[Automation] Daily Cron chạy xong!');
  } catch (error) {
    console.error('[Automation] Lỗi chạy Daily Cron:', error);
  }
}
