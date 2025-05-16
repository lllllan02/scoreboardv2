import React, { useState } from "react";
import { Link } from "react-router-dom";
import { HomeOutlined } from "@ant-design/icons";
import { ContestConfig } from "../types/contest";
import { formatTime } from "../utils/timeUtils";
import "../styles/Contest.css";

interface ContestHeaderProps {
  contestConfig: ContestConfig;
}

const ContestHeader: React.FC<ContestHeaderProps> = ({ contestConfig }) => {
  const [bannerError, setBannerError] = useState(false);

  // 处理banner路径
  const getBannerPath = () => {
    // 检查路径是否存在
    if (!contestConfig?.banner?.path) return null;

    const path = contestConfig.banner.path;

    // 如果是完整URL，直接返回
    if (path.startsWith("http://") || path.startsWith("https://")) {
      return path;
    }

    // 如果是相对路径，添加前缀
    if (path.startsWith("/")) {
      return path; // 已经是以/开头的绝对路径
    }

    // 其他情况，添加/前缀
    return `/${path}`;
  };

  // 获取状态标签 - 对于历史比赛，固定显示已完成
  const getStatusBadge = () => {
    return (
      <span className="detail-custom-status">
        <span className="detail-status-dot"></span>
        <span className="detail-status-text">FINISHED</span>
      </span>
    );
  };

  const bannerPath = getBannerPath();

  return (
    <>
      {/* 返回首页按钮 */}
      <Link to="/" className="detail-home-button">
        <HomeOutlined />
        <span>返回首页</span>
      </Link>

      {/* 显示比赛横幅 */}
      {bannerPath && !bannerError && (
        <img
          src={bannerPath}
          alt={`${contestConfig.contest_name} 横幅`}
          className="detail-contest-banner"
          onError={() => {
            setBannerError(true);
          }}
        />
      )}

      {/* 标题居中，增加下方间距 */}
      <h1 className="detail-contest-title">{contestConfig.contest_name}</h1>

      {/* 时间信息 - 更加对齐 */}
      <div className="detail-time-info">
        <div>开始时间: {formatTime(contestConfig.start_time)}</div>
        <div>{getStatusBadge()}</div>
        <div>结束时间: {formatTime(contestConfig.end_time)}</div>
      </div>
    </>
  );
};

export default ContestHeader;
