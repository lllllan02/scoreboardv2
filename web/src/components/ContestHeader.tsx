import React, { useState } from "react";
import { Link } from "react-router-dom";
import { HomeOutlined } from "@ant-design/icons";
import { ContestConfig } from "../types/contest";
import "../styles/Contest.css";

interface ContestHeaderProps {
  contestConfig: ContestConfig;
}

const ContestHeader: React.FC<ContestHeaderProps> = ({ contestConfig }) => {
  const [bannerError, setBannerError] = useState(false);

  // 处理 banner 路径
  const getBannerPath = () => {
    // 检查路径是否存在
    if (!contestConfig?.banner?.path) return null;

    const path = contestConfig.banner.path;

    // 如果是完整 URL，直接返回
    if (path.startsWith("http://") || path.startsWith("https://")) {
      return path;
    }

    // 如果是相对路径，添加前缀
    if (path.startsWith("/")) {
      return path; // 已经是以 / 开头的绝对路径
    }

    // 其他情况，添加 / 前缀
    return `/${path}`;
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

      {/* 标题 */}
      <h1 className="detail-contest-title">{contestConfig.contest_name}</h1>
    </>
  );
};

export default ContestHeader;
