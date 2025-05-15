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