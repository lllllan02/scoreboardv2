/**
 * 将时间戳转换为格式化的日期时间字符串
 * @param timestamp 时间戳（秒）
 * @returns 格式化的日期时间字符串
 */
export const formatTime = (timestamp?: number): string => {
  if (!timestamp) return '';
  return new Date(timestamp * 1000).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }) + ' GMT+8';
};

/**
 * 计算并格式化持续时间
 * @param startTime 开始时间戳（秒）
 * @param endTime 结束时间戳（秒）
 * @returns 格式化的持续时间字符串 (HH:MM:SS)
 */
export const formatDuration = (startTime?: number, endTime?: number): string => {
  if (!startTime || !endTime) return '00:00:00';
  
  const durationSeconds = endTime - startTime;
  const hours = Math.floor(durationSeconds / 3600);
  const minutes = Math.floor((durationSeconds % 3600) / 60);
  const seconds = durationSeconds % 60;

  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

/**
 * 计算剩余时间（倒计时）
 * @param endTime 结束时间戳（秒）
 * @returns 格式化的剩余时间字符串 (HH:MM:SS)
 */
export const getRemainingTime = (endTime?: number): string => {
  if (!endTime) return '00:00:00';
  
  const now = Math.floor(Date.now() / 1000);
  
  if (now >= endTime) return '00:00:00';
  
  const remainingSeconds = endTime - now;
  const hours = Math.floor(remainingSeconds / 3600);
  const minutes = Math.floor((remainingSeconds % 3600) / 60);
  const seconds = remainingSeconds % 60;

  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

/**
 * 获取比赛状态
 * @param startTime 开始时间戳（秒）
 * @param endTime 结束时间戳（秒）
 * @returns 比赛状态：'pending'|'running'|'finished'
 */
export const getContestStatus = (startTime?: number, endTime?: number): 'pending' | 'running' | 'finished' => {
  if (!startTime || !endTime) {
    return 'pending';
  }
  
  const now = Date.now() / 1000; // 当前时间（秒）

  if (now < startTime) {
    return 'pending';
  } else if (now > endTime) {
    return 'finished';
  } else {
    return 'running';
  }
};

/**
 * 计算比赛相对时间（毫秒）
 * @param startTime 开始时间戳（秒）
 * @param endTime 结束时间戳（秒）
 * @param progressPercent 进度百分比（0-100）
 * @returns {number} 相对时间（毫秒）
 */
export const calculateRelativeTimeMs = (
  startTime?: number,
  endTime?: number,
  progressPercent: number = 100
): number => {
  if (!startTime || !endTime) return 0;
  
  // 计算比赛总时长（秒）
  const contestDurationSec = endTime - startTime;
  // 转为毫秒
  const contestDurationMs = contestDurationSec * 1000;
  
  // 根据进度百分比计算相对时间（毫秒）
  const timeOffsetMs = contestDurationMs * (progressPercent / 100);
  
  // 返回相对时间（毫秒），向下取整
  return Math.floor(timeOffsetMs);
};

/**
 * 格式化相对时间（毫秒）为时:分:秒格式
 * @param relativeTimeMs 相对时间（毫秒）
 * @returns {string} 格式化的时间字符串（HH:mm:ss）
 */
export const formatRelativeTime = (relativeTimeMs: number): string => {
  // 将毫秒转换为秒
  const relativeTimeSec = Math.floor(relativeTimeMs / 1000);
  
  // 将秒数转换为时:分:秒格式
  const hours = Math.floor(relativeTimeSec / 3600);
  const minutes = Math.floor((relativeTimeSec % 3600) / 60);
  const seconds = relativeTimeSec % 60;
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

/**
 * 计算并格式化比赛剩余时间
 * @param contestDurationMs 比赛总时长（毫秒）
 * @param relativeTimeMs 当前相对时间（毫秒）
 * @returns {string} 格式化的剩余时间字符串（HH:mm:ss）
 */
export const formatContestRemainingTime = (contestDurationMs: number, relativeTimeMs: number): string => {
  // 计算剩余时间（毫秒）
  const remainingMs = contestDurationMs - relativeTimeMs;
  if (remainingMs <= 0) return "00:00:00";
  
  // 转换为秒
  const remainingSec = Math.floor(remainingMs / 1000);
  
  // 将剩余秒数转换为时:分:秒格式
  const hours = Math.floor(remainingSec / 3600);
  const minutes = Math.floor((remainingSec % 3600) / 60);
  const seconds = remainingSec % 60;
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}; 