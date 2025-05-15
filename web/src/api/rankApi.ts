import axios from 'axios';
import { Rank } from '../types/rank';

// 获取比赛排行榜
export const getContestRank = async (path: string): Promise<Rank> => {
  try {
    const response = await axios.get(`/api/rank/${path}`);
    
    console.log('获取排行榜响应:', response);
    
    // 检查响应数据格式并处理
    if (response.data && response.data.data) {
      return response.data.data;
    } else if (response.data) {
      return response.data;
    } else {
      console.warn('API返回的排行榜数据格式不符合预期:', response.data);
      throw new Error('排行榜数据格式错误');
    }
  } catch (error) {
    console.error('获取排行榜数据失败:', error);
    throw error;
  }
}; 