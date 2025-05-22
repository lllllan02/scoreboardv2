import axios from "axios";
import { Stat, StatResponse } from "../types/stat";

export const getContestStats = async (
  path: string,
  group?: string,
  relativeTimeMs?: number
): Promise<Stat> => {
  try {
    const params = new URLSearchParams();
    if (group && group !== "all") {
      params.set("group", group);
    }
    if (relativeTimeMs !== undefined) {
      params.set("t", relativeTimeMs.toString());
    }

    const response = await axios.get<StatResponse>(
      `/api/stat/${path}${params.toString() ? `?${params.toString()}` : ""}`
    );

    return response.data.data;
  } catch (error) {
    console.error("获取统计数据失败:", error);
    throw error;
  }
};
