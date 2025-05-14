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

interface ContestCardProps {
  contest: Contest;
}

const ContestCard: React.FC<ContestCardProps> = ({ contest }) => {
  // 将时间戳转换为可读格式
  const formatTime = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  };

  // 计算持续时间
  const getDuration = (startTime: number, endTime: number) => {
    const durationSeconds = endTime - startTime;
    const hours = Math.floor(durationSeconds / 3600);
    const minutes = Math.floor((durationSeconds % 3600) / 60);
    const seconds = durationSeconds % 60;

    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  // 获取比赛状态
  const getContestStatus = () => {
    const now = Date.now();
    const startTime = (contest.config.start_time || 0) * 1000;
    const endTime = (contest.config.end_time || 0) * 1000;

    if (now < startTime) {
      return "pending";
    } else if (now > endTime) {
      return "finished";
    } else {
      return "running";
    }
  };

  // 计算比赛进度百分比
  const getContestProgress = () => {
    const now = Date.now();
    const startTime = (contest.config.start_time || 0) * 1000;
    const endTime = (contest.config.end_time || 0) * 1000;

    if (now < startTime) return 0;
    if (now > endTime) return 100;

    const totalDuration = endTime - startTime;
    const elapsed = now - startTime;
    return Math.floor((elapsed / totalDuration) * 100);
  };

  // 获取状态图标和文本
  const getStatusContent = () => {
    const status = getContestStatus();
    let icon;
    let text;
    let className;

    switch (status) {
      case "finished":
        icon = <CheckCircleOutlined />;
        text = "FINISHED";
        className = "status-finished";
        break;
      case "running":
        icon = <SyncOutlined spin />;
        text = "RUNNING";
        className = "status-running";
        break;
      default:
        icon = <ClockPendingOutlined />;
        text = "PENDING";
        className = "status-pending";
    }

    return { icon, text, className };
  };

  const status = getStatusContent();
  const progress = getContestProgress();
  
  const [logoError, setLogoError] = React.useState(false);
  const logoPath = contest.config.logo?.path;
  
  return (
    <Link to={`/${contest.board_link}`} className="contest-link">
      <div className="contest-card-new">
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
          <div className="contest-time-info">
            <div className="time-item">
              <CalendarOutlined className="time-icon" />
              <span>开始时间: {formatTime(contest.config.start_time || 0)}</span>
              <span className="timezone">GMT+8</span>
            </div>
            <div className="time-item">
              <ClockCircleOutlined className="time-icon" />
              <span>持续时长: {getDuration(
                contest.config.start_time || 0,
                contest.config.end_time || 0
              )}</span>
            </div>
          </div>

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
