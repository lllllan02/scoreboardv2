// 比赛类型
export interface Contest {
  board_link: string;
  config: ContestConfig;
}

// 比赛配置类型
export interface ContestConfig {
  contest_id?: string;
  contest_name?: string;
  start_time?: number;
  end_time?: number;
  frozen_time?: number;
  penalty?: number;
  problem_quantity?: number;
  problem_id?: string[];
  group?: Record<string, string>;
  organization?: string;
  status_time_display?: StatusTimeDisplay;
  medal?: Medal;
  balloon_color?: BalloonColor[];
  logo?: Logo;
  link?: Link;
  banner?: Banner;
  options?: Options;
  frozen?: boolean;
  unfrozen?: boolean;
}

// 状态时间显示类型
export interface StatusTimeDisplay {
  correct?: boolean;
  incorrect?: boolean;
  pending?: boolean;
}

// 奖牌信息类型
export interface Medal {
  type?: string;
  official?: OfficialMedal;
}

// 正式奖牌类型
export interface OfficialMedal {
  gold?: number;
  silver?: number;
  bronze?: number;
}

// 气球颜色类型
export interface BalloonColor {
  color?: string;
  background_color?: string;
}

// Logo 类型
export interface Logo {
  preset?: string;
  base64?: string;
  path?: string;
}

// 链接类型
export interface Link {
  homepage?: string;
  registration?: string;
}

// Banner 类型
export interface Banner {
  url?: string;
  path?: string;
}

// 选项类型
export interface Options {
  calculation_of_penalty?: string;
}
