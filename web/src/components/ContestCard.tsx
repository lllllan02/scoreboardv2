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
import { formatTime, formatDuration, getContestStatus } from "../utils/timeUtils";

interface ContestCardProps {
  contest: Contest;
}

const ContestCard: React.FC<ContestCardProps> = ({ contest }) => {
  // 计算比赛进度百分比
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

  // 获取状态图标和文本
  const getStatusContent = () => {
    const status = getContestStatus(
      contest.config.start_time, 
      contest.config.end_time
    );
    
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
    <Link to={`${contest.board_link}`} className="contest-link">
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
              <span>开始时间: {formatTime(contest.config.start_time)}</span>
              <span className="timezone">GMT+8</span>
            </div>
            <div className="time-item">
              <ClockCircleOutlined className="time-icon" />
              <span>持续时长: {formatDuration(
                contest.config.start_time,
                contest.config.end_time
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
