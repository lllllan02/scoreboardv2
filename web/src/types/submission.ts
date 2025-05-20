/**
 * 提交状态类型
 */
export type SubmissionStatus = 
  | "Accepted"
  | "Compilation Error"
  | "Memory Limit Exceeded"
  | "Presentation Error"
  | "Runtime Error"
  | "Time Limit Exceeded"
  | "Wrong Answer"
  | "Pending"
  | "Frozen";

/**
 * 单个提交记录类型
 */
export interface Submission {
  id: string;
  team_id: string;
  problem_id: string;
  team: string;
  organization: string;
  girl: boolean;
  language: string;
  status: SubmissionStatus;
  timestamp: number;
}

/**
 * 参赛队伍信息
 */
export interface Participant {
  team_id: string;
  team: string;
}

/**
 * 提交列表响应数据类型
 */
export interface SubmissionResponse {
  code: number;
  data: {
    total: number;
    data: Submission[];
    schools: string[];
    participants: Participant[];
  };
} 