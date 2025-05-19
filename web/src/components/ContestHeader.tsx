/**
 * ContestHeader 组件 - 比赛详情页头部
 * 负责展示比赛的横幅图片、标题和返回首页按钮
 */

import React, { useState } from "react";
import { Link } from "react-router-dom";
import { HomeOutlined } from "@ant-design/icons";
import { ContestConfig } from "../types/contest";
import "../styles/Contest.css";

/**
 * 组件属性接口定义
 * @interface ContestHeaderProps
 * @property {ContestConfig} contestConfig - 比赛配置信息对象
 */
interface ContestHeaderProps {
  contestConfig: ContestConfig;
}

/**
 * ContestHeader 组件实现
 * @param {ContestHeaderProps} props - 组件属性
 */
const ContestHeader: React.FC<ContestHeaderProps> = ({ contestConfig }) => {
  // 横幅图片加载错误状态管理
  const [bannerError, setBannerError] = useState(false);

  /**
   * 处理横幅图片路径
   * @returns {string | null} 返回处理后的横幅图片路径，如果不存在则返回 null
   */
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

  // 获取处理后的横幅图片路径
  const bannerPath = getBannerPath();

  return (
    <>
      {/* 返回首页按钮 */}
      <Link to="/" className="detail-home-button">
        <HomeOutlined />
        <span>返回首页</span>
      </Link>

      {/* 显示比赛横幅图片 */}
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

      {/* 比赛标题 */}
      <h1 className="detail-contest-title">{contestConfig.contest_name}</h1>
    </>
  );
};

export default ContestHeader;
