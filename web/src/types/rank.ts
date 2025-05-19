// 排行榜数据类型
export interface Rank {
  rows: Row[];            // 队伍列表
  submitted: number[];    // 提交次数
  attempted: number[];    // 尝试次数
  accepted: number[];     // 解决次数
  dirt: number[];         // 错误次数
  dirty: number[];        // 错误率
  first_solved: number[]; // 第一个解决时间
  last_solved: number[];  // 最后一个解决时间
}

// 队伍行数据
export interface Row {
  team_id: string;       // 队伍 id
  team: string;          // 队伍名称
  organization: string;  // 队伍组织
  place: number;         // 队伍排名
  org_place: number;     // 组织排名
  solved: number;        // 解决题目数
  penalty: number;       // 罚时
  dirty: number;         // 错误率
  problems: Problem[];   // 题目列表
  group?: string;        // 队伍所属分组
}

// 题目数据
export interface Problem {
  first_solved: boolean; // 是否是第一个解决
  solved: boolean;       // 是否解决
  attempted: boolean;    // 是否尝试
  pending: boolean;      // 正在评测
  frozen: boolean;       // 是否冻结
  submitted: number;     // 提交次数
  penalty: number;       // 罚时(分钟)
  timestamp: number;     // 通过时间(分钟)
  dirt: number;          // 错误次数(前提是已经解决)
} 