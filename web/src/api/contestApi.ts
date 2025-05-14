import axios from 'axios';
import { Contest } from '../types/contest';

// 使用相对路径，通过Vite代理转发请求
const API_URL = '/api';

export const getContestList = async (contestName: string = ''): Promise<Contest[]> => {
  try {
    const response = await axios.get(`${API_URL}/contests`, {
      params: { contestName }
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