import React from "react";
import { Card } from "antd";
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
import "./ContestCard.css";

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

  // 处理图片路径，移除"data/"前缀
  const getImagePath = (path?: string) => {
    if (!path) return "";
    // 如果路径以"data/"开头，则移除这个前缀
    return path.startsWith("data/") ? `/${path.substring(5)}` : `/${path}`;
  };

  const [logoError, setLogoError] = React.useState(false);
  const logoPath = getImagePath(contest.config.logo?.path);
  
  return (
    <Link to={`/${contest.board_link}`} className="contest-link">
      <Card
        hoverable
        title={
          <div className="contest-card-title">
            {logoPath && !logoError && (
              <img 
                src={logoPath}
                alt="Contest Logo" 
                className="contest-logo"
                onError={() => setLogoError(true)}
              />
            )}
            {contest.config.contest_name}
          </div>
        }
        className="contest-card"
      >
        <div className="contest-card-content">
          <p className="contest-card-time-item">
            <CalendarOutlined className="contest-card-time-icon" />
            开始时间: {formatTime(contest.config.start_time || 0)}
            <span className="contest-timezone">GMT+8</span>
          </p>
          <p className="contest-card-time-item">
            <ClockCircleOutlined className="contest-card-time-icon" />
            持续时长:{" "}
            {getDuration(
              contest.config.start_time || 0,
              contest.config.end_time || 0
            )}
          </p>
        </div>

        <div className="contest-status">
          <span className={`status-text ${status.className}`}>
            {status.icon} <span style={{ marginLeft: 4 }}>{status.text}</span>
          </span>

          <div className="contest-progress">
            <div
              className="contest-progress-inner"
              style={{ width: `${progress}%` }}
            />
          </div>

          <RightOutlined className="contest-arrow" />
        </div>
      </Card>
    </Link>
  );
};

export default ContestCard;
