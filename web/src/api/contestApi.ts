import axios from 'axios';
import { Contest, ContestConfig } from '../types/contest';

export const getContestList = async (contest_name: string = ''): Promise<Contest[]> => {
  try {
    const response = await axios.get(`/api/contests`, {
      params: { contest_name: contest_name }
    });
    
    console.log('API响应原始数据:', response);
    
    // 检查响应数据格式并处理
    if (response.data && Array.isArray(response.data)) {
      return response.data;
    } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
      // 如果数据在data字段中
      return response.data.data;
    } else {
      console.warn('API返回的数据格式不符合预期:', response.data);
      return [];
    }
  } catch (error) {
    console.error('获取比赛列表失败:', error);
    throw error;
  }
};

// 获取比赛配置
export const getContestConfig = async (path: string): Promise<ContestConfig> => {
  try {
    const response = await axios.get(`/api/config/${path}`);
    
    console.log('获取比赛配置响应:', response);
    
    // 检查响应数据格式并处理
    if (response.data && response.data.data) {
      return response.data.data;
    } else if (response.data) {
      return response.data;
    } else {
      console.warn('API返回的比赛配置格式不符合预期:', response.data);
      throw new Error('比赛配置数据格式错误');
    }
  } catch (error) {
    console.error('获取比赛配置失败:', error);
    throw error;
  }
};