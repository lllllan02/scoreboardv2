import axios from "axios";
import { SubmissionResponse } from "../types/submission";

/**
 * 获取比赛提交列表
 * @param path 比赛路径
 * @param group 可选的分组筛选
 * @param relativeTimeMs 可选的相对时间（毫秒）
 * @param page 页码，从1开始
 * @param size 每页条数
 * @param filters 筛选条件
 * @returns 提交列表数据
 */
export const getContestSubmissions = async (
  path: string,
  group?: string,
  relativeTimeMs?: number | null,
  page: number = 1,
  size: number = 50,
  filters: {
    school?: string;
    team?: string;
    language?: string;
    status?: string;
  } = {}
): Promise<SubmissionResponse> => {
  try {
    const params = new URLSearchParams();
    if (group && group !== "all") {
      params.append("group", group);
    }
    if (relativeTimeMs !== undefined && relativeTimeMs !== null) {
      params.append("t", relativeTimeMs.toString());
    }
    params.append("page", page.toString());
    params.append("size", size.toString());

    // 添加筛选参数
    if (filters.school) {
      params.append("school", filters.school);
    }
    if (filters.team) {
      params.append("team_id", filters.team);
    }
    if (filters.language) {
      params.append("language", filters.language);
    }
    if (filters.status) {
      params.append("status", filters.status);
    }

    const response = await axios.get<SubmissionResponse>(
      `/api/run/${path}${params.toString() ? `?${params.toString()}` : ""}`
    );
    return response.data;
  } catch (error) {
    console.error("获取提交列表失败:", error);
    throw error;
  }
};
