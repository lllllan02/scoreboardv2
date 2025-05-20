export interface TrendPoint {
  place: number;  // 排名
  time: number;   // 相对时间（毫秒）
}

export interface TeamTrend {
  points: TrendPoint[];
} 