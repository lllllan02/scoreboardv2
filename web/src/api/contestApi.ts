import axios from 'axios';
import { Contest, ContestConfig } from '../types/contest';

// 请求缓存
const requestCache = new Map<string, {data: any, timestamp: number}>();
// 缓存过期时间（毫秒）
const CACHE_EXPIRY = 60000; // 1分钟

export const getContestList = async (contest_name: string = ''): Promise<Contest[]> => {
  try {
    // 构建缓存键
    const cacheKey = `contests-${contest_name}`;
    
    // 检查缓存
    const cached = requestCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_EXPIRY) {
      console.log('从缓存获取比赛列表');
      return cached.data;
    }
    
    const response = await axios.get(`/api/contests`, {
      params: { contest_name: contest_name }
    });
    
    console.log('API响应原始数据:', response);
    
    // 处理响应数据
    let data: Contest[] = [];
    if (response.data && Array.isArray(response.data)) {
      data = response.data;
    } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
      data = response.data.data;
    } else {
      console.warn('API返回的数据格式不符合预期:', response.data);
      data = [];
    }
    
    // 更新缓存
    requestCache.set(cacheKey, {
      data: data,
      timestamp: Date.now()
    });
    
    return data;
  } catch (error) {
    console.error('获取比赛列表失败:', error);
    throw error;
  }
};

// 获取比赛配置
export const getContestConfig = async (path: string, relativeTimeMs?: number): Promise<ContestConfig> => {
  try {
    // 构建缓存键（包含时间参数）
    const cacheKey = `config-${path}-${relativeTimeMs || 'latest'}`;
    
    // 检查缓存
    const cached = requestCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_EXPIRY) {
      console.log('从缓存获取比赛配置');
      return cached.data;
    }
    
    // 构建URL，添加时间参数
    const url = relativeTimeMs !== undefined
      ? `/api/config/${path}?t=${relativeTimeMs}` 
      : `/api/config/${path}`;
    
    const response = await axios.get(url);
    
    console.log('获取比赛配置响应:', response);
    
    // 处理响应数据
    let data: ContestConfig;
    if (response.data && response.data.data) {
      data = response.data.data;
    } else if (response.data) {
      data = response.data;
    } else {
      console.warn('API返回的比赛配置格式不符合预期:', response.data);
      throw new Error('比赛配置数据格式错误');
    }
    
    // 更新缓存
    requestCache.set(cacheKey, {
      data: data,
      timestamp: Date.now()
    });
    
    return data;
  } catch (error) {
    console.error('获取比赛配置失败:', error);
    throw error;
  }
};
