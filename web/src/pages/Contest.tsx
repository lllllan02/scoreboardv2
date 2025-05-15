import React, { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useLocation, Link } from "react-router-dom";
import { getContestConfig } from "../api/contestApi";
import { ContestConfig } from "../types/contest";
import { Spin, Tooltip } from "antd";
import { CloseCircleOutlined, HomeOutlined } from "@ant-design/icons";
import "../styles/Contest.css";
import { formatTime, formatDuration } from "../utils/timeUtils";

const Contest: React.FC = () => {
  // 状态管理
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [contestConfig, setContestConfig] = useState<ContestConfig | null>(
    null
  );
  const [sliderPosition, setSliderPosition] = useState(100); // 滑块位置，百分比

  // 引用DOM元素
  const progressBarRef = useRef<HTMLDivElement>(null);

  // 使用 useLocation 获取完整路径
  const location = useLocation();

  // 获取有效路径
  const apiPath = location.pathname;

  // 处理鼠标移动
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!progressBarRef.current) return;

    const rect = progressBarRef.current.getBoundingClientRect();
    let percentage = ((e.clientX - rect.left) / rect.width) * 100;
    percentage = Math.max(0, Math.min(100, percentage)); // 确保在0-100之间

    setSliderPosition(percentage);
  }, []);

  // 处理触摸移动
  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!progressBarRef.current) return;

    const rect = progressBarRef.current.getBoundingClientRect();
    let percentage = ((e.touches[0].clientX - rect.left) / rect.width) * 100;
    percentage = Math.max(0, Math.min(100, percentage)); // 确保在0-100之间

    setSliderPosition(percentage);
  }, []);

  // 拖动开始
  const startDrag = useCallback(() => {
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", endDrag);
    document.addEventListener("touchmove", handleTouchMove);
    document.addEventListener("touchend", endDrag);
  }, [handleMouseMove, handleTouchMove]);

  // 拖动结束
  const endDrag = useCallback(() => {
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", endDrag);
    document.removeEventListener("touchmove", handleTouchMove);
    document.removeEventListener("touchend", endDrag);
  }, [handleMouseMove, handleTouchMove]);

  useEffect(() => {
    const fetchContestConfig = async () => {
      try {
        setLoading(true);
        setError(null);

        const config = await getContestConfig(apiPath);
        setContestConfig(config);
      } catch (err) {
        console.error("获取比赛配置失败:", err);
        setError("获取比赛配置失败，请检查路径是否正确");
      } finally {
        setLoading(false);
      }
    };

    fetchContestConfig();

    // 组件卸载时清理事件监听器
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", endDrag);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", endDrag);
    };
  }, [apiPath, handleMouseMove, handleTouchMove, endDrag]);

  // 获取状态标签 - 对于历史比赛，固定显示已完成
  const getStatusBadge = () => {
    return (
      <span className="detail-custom-status">
        <span className="detail-status-dot"></span>
        <span className="detail-status-text">FINISHED</span>
      </span>
    );
  };

  const [bannerError, setBannerError] = useState(false);
  
  // 处理banner路径
  const bannerPath = useMemo(() => {
    // 检查路径是否存在
    if (!contestConfig?.banner?.path) return null;
    
    const path = contestConfig.banner.path;
    
    // 如果是完整URL，直接返回
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }
    
    // 如果是相对路径，添加前缀
    // 注意：这里的路径前缀需要根据实际情况调整
    if (path.startsWith('/')) {
      return path; // 已经是以/开头的绝对路径
    }
    
    // 其他情况，添加/前缀
    return `/${path}`;
  }, [contestConfig]);
  
  console.log("Banner路径:", bannerPath);
  console.log("Banner加载错误状态:", bannerError);

  if (loading) {
    return (
      <div className="detail-loading-spinner">
        <Spin size="large" tip="加载中..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="detail-error-message">
        <CloseCircleOutlined className="detail-error-icon" />
        {error}
      </div>
    );
  }

  if (!contestConfig) {
    return (
      <div className="detail-error-message">
        <CloseCircleOutlined className="detail-error-icon" />
        比赛配置不存在
      </div>
    );
  }

  return (
    <div className="detail-main-container">
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
            console.error("横幅图片加载失败:", bannerPath);
            setBannerError(true);
          }}
        />
      )}

      {/* 标题居中，增加下方间距 */}
      <h1 className="detail-contest-title">{contestConfig.contest_name}</h1>

      {/* 进度条和时间信息区域，使用统一容器 */}
      <div className="detail-time-container">
        {/* 时间信息 - 更加对齐 */}
        <div className="detail-time-info">
          <div>开始时间: {formatTime(contestConfig.start_time)}</div>
          <div>{getStatusBadge()}</div>
          <div>结束时间: {formatTime(contestConfig.end_time)}</div>
        </div>

        {/* 进度条 - 增加高度并添加条纹效果，加入滑块 */}
        <div
          className="detail-progress-bar detail-progress-bar-custom"
          ref={progressBarRef}
        >
          <div
            className="detail-progress-fill detail-progress-striped"
            style={{ width: `${sliderPosition}%` }}
          ></div>

          {/* 可拖动滑块 */}
          <div
            className="detail-progress-slider"
            style={{ left: `${sliderPosition}%` }}
            onMouseDown={startDrag}
            onTouchStart={startDrag}
          >
            <div className="detail-slider-handle"></div>
          </div>
        </div>

        {/* 持续时间和图例 - 更精确地对齐，贴近进度条 */}
        <div className="detail-duration-container">
          <div>
            当前时间:{" "}
            {formatDuration(contestConfig.start_time, contestConfig.end_time)}
          </div>

          <div className="detail-problem-legend">
            <Tooltip title="金牌">
              <div className="detail-legend-item detail-gold">Gold</div>
            </Tooltip>
            <Tooltip title="银牌">
              <div className="detail-legend-item detail-silver">Silver</div>
            </Tooltip>
            <Tooltip title="铜牌">
              <div className="detail-legend-item detail-bronze">Bronze</div>
            </Tooltip>
            <Tooltip title="优胜奖">
              <div className="detail-legend-item detail-honorable">
                Honorable
              </div>
            </Tooltip>
            <Tooltip title="首个解出">
              <div className="detail-legend-item detail-first-to-solve">
                First to solve problem
              </div>
            </Tooltip>
            <Tooltip title="已解决">
              <div className="detail-legend-item detail-solved">
                Solved problem
              </div>
            </Tooltip>
            <Tooltip title="尝试但未解决">
              <div className="detail-legend-item detail-attempted">
                Attempted problem
              </div>
            </Tooltip>
            <Tooltip title="等待评判或封榜">
              <div className="detail-legend-item detail-pending">
                Pending judgement/Frozen
              </div>
            </Tooltip>
          </div>

          <div>剩余时间: 00:00:00</div>
        </div>
      </div>

      {/* 榜单内容 */}
      <div className="detail-content-placeholder">
        <p>榜单内容将在此处显示</p>
      </div>
    </div>
  );
};

export default Contest;
