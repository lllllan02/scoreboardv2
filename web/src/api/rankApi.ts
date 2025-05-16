import axios from 'axios';
import { Rank } from '../types/rank';

// 请求缓存
const requestCache = new Map<string, {data: any, timestamp: number}>();
// 缓存过期时间（毫秒）
const CACHE_EXPIRY = 30000; // 30秒

// 获取比赛排行榜
export const getContestRank = async (path: string, relativeTimeMs?: number): Promise<Rank> => {
  try {
    // 确保始终有时间参数
    const timeParam = relativeTimeMs !== undefined ? relativeTimeMs : 'latest';

    // 构建缓存键
    const cacheKey = `rank-${path}-${timeParam}`;
    
    // 检查缓存
    const cached = requestCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_EXPIRY) {
      console.log('从缓存获取排行榜数据');
      return cached.data;
    }
    
    // 构建URL，确保每次请求都带有时间参数
    const url = `/api/rank/${path}?t=${timeParam}`;
    
    const response = await axios.get(url);
    
    console.log('获取排行榜响应:', response);
    
    // 处理响应数据
    let data: Rank;
    if (response.data && response.data.data) {
      data = response.data.data;
    } else if (response.data) {
      data = response.data;
    } else {
      console.warn('API返回的排行榜数据格式不符合预期:', response.data);
      throw new Error('排行榜数据格式错误');
    }
    
    // 更新缓存
    requestCache.set(cacheKey, {
      data: data,
      timestamp: Date.now()
    });
    
    return data;
  } catch (error) {
    console.error('获取排行榜数据失败:', error);
    throw error;
  }
}; 