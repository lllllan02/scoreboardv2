/**
 * ContestCard 组件 - 比赛卡片展示
 * 用于在列表中展示单个比赛的基本信息，包括比赛名称、时间、状态和进度等
 */

import React from "react";
import {
  ClockCircleOutlined,
  CalendarOutlined,
  RightOutlined,
  CheckCircleOutlined,
  SyncOutlined,
  ClockCircleOutlined as ClockPendingOutlined,
} from "@ant-design/icons";
import { Contest } from "../types/contest";
import { Link } from "react-router-dom";
import "../styles/ContestCard.css";
import {
  formatTime,
  formatDuration,
  getContestStatus,
} from "../utils/timeUtils";

/**
 * 组件属性接口定义
 * @interface ContestCardProps
 * @property {Contest} contest - 比赛信息对象
 */
interface ContestCardProps {
  contest: Contest;
}

/**
 * ContestCard 组件实现
 * @param {ContestCardProps} props - 组件属性
 */
const ContestCard: React.FC<ContestCardProps> = ({ contest }) => {
  /**
   * 计算比赛进度百分比
   * @returns {number} 返回 0-100 的进度值
   */
  const getContestProgress = () => {
    const now = Date.now() / 1000; // 秒级时间戳
    const startTime = contest.config.start_time || 0;
    const endTime = contest.config.end_time || 0;

    if (now < startTime) return 0;
    if (now > endTime) return 100;

    const totalDuration = endTime - startTime;
    const elapsed = now - startTime;
    return Math.floor((elapsed / totalDuration) * 100);
  };

  /**
   * 获取比赛状态的展示内容
   * @returns {{ icon: JSX.Element, text: string, className: string }} 返回状态图标、文本和样式类名
   */
  const getStatusContent = () => {
    const status = getContestStatus(
      contest.config.start_time,
      contest.config.end_time
    );

    let icon;
    let text;
    let className;

    switch (status) {
      // 比赛已结束
      case "finished":
        icon = <CheckCircleOutlined />;
        text = "FINISHED";
        className = "status-finished";
        break;
      // 比赛进行中
      case "running":
        icon = <SyncOutlined spin />;
        text = "RUNNING";
        className = "status-running";
        break;
      // 比赛未开始
      default:
        icon = <ClockPendingOutlined />;
        text = "PENDING";
        className = "status-pending";
    }

    return { icon, text, className };
  };

  // 获取比赛状态和进度
  const status = getStatusContent();
  const progress = getContestProgress();

  // Logo 加载错误状态管理
  const logoPath = contest.config.logo?.path;
  const [logoError, setLogoError] = React.useState(false);

  return (
    <Link to={`${contest.board_link}`} className="contest-link">
      <div className="contest-card-new">
        {/* 比赛标题和 Logo 区域 */}
        <div className="contest-header">
          {logoPath && !logoError && (
            <img
              src={logoPath}
              alt="Contest Logo"
              className="contest-logo"
              onError={() => setLogoError(true)}
            />
          )}
          <h3 className="contest-title">{contest.config.contest_name}</h3>
        </div>

        <div className="contest-main">
          {/* 比赛时间信息区域 */}
          <div className="contest-time-info">
            <div className="time-item">
              <CalendarOutlined className="time-icon" />
              <span>开始时间: {formatTime(contest.config.start_time)}</span>
              <span className="timezone">GMT+8</span>
            </div>
            <div className="time-item">
              <ClockCircleOutlined className="time-icon" />
              <span>
                持续时长:{" "}
                {formatDuration(
                  contest.config.start_time,
                  contest.config.end_time
                )}
              </span>
            </div>
          </div>

          {/* 比赛状态和进度条区域 */}
          <div className="contest-status-container">
            <div className="progress-container">
              <span className={`status-tag ${status.className}`}>
                {status.icon} <span>{status.text}</span>
              </span>
              <div className="progress-bar-container">
                <div className="progress-bar">
                  <div
                    className="progress-inner"
                    style={{ width: `${progress}%` }}
                  ></div>
                  <div className="progress-percent">{progress}%</div>
                </div>
                <RightOutlined className="arrow-icon" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ContestCard;
