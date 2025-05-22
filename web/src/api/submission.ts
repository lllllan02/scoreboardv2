import axios from "axios";
import { SubmissionResponse } from "../types/submission";

/**
 * 获取比赛提交列表
 * @param path 比赛路径
 * @param group 可选的分组筛选
 * @param relativeTimeMs 可选的相对时间（毫秒）
 * @param page 页码，从1开始
 * @param size 每页条数
 * @returns 提交列表数据
 */
export const getContestSubmissions = async (
  path: string,
  group?: string,
  relativeTimeMs?: number,
  page: number = 1,
  size: number = 50
): Promise<SubmissionResponse> => {
  try {
    const params = new URLSearchParams();
    if (group && group !== "all") {
      params.append("group", group);
    }
    if (relativeTimeMs !== undefined) {
      params.append("t", relativeTimeMs.toString());
    }
    params.append("page", page.toString());
    params.append("size", size.toString());

    const response = await axios.get<SubmissionResponse>(
      `/api/run/${path}${params.toString() ? `?${params.toString()}` : ""}`
    );
    return response.data;
  } catch (error) {
    console.error("获取提交列表失败:", error);
    throw error;
  }
};
