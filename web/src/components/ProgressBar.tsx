/**
 * ProgressBar 组件 - 比赛进度条
 * 用于展示和控制比赛进度，包括时间显示、进度控制和图例说明
 * 支持拖动进度条来查看比赛不同时间点的状态
 */

import React, { useRef, useEffect, useMemo } from "react";
import { Tooltip } from "antd";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import { ContestConfig } from "../types/contest";
import {
  formatTime,
  formatRelativeTime,
  formatContestRemainingTime,
  calculateRelativeTimeMs,
} from "../utils/timeUtils";
import "../styles/Contest.css";

/**
 * 组件属性接口定义
 * @interface ProgressBarProps
 * @property {ContestConfig} contestConfig - 比赛配置信息
 * @property {Function} [onTimeChange] - 时间变化时的回调函数
 */
interface ProgressBarProps {
  contestConfig: ContestConfig;
  onTimeChange?: (relativeTimeMs: number) => void;
}

/**
 * ProgressBar 组件实现
 * @param {ProgressBarProps} props - 组件属性
 */
const ProgressBar: React.FC<ProgressBarProps> = ({
  contestConfig,
  onTimeChange,
}) => {
  // 用于标记是否是首次渲染的引用
  const initialRenderRef = useRef(true);

  // 滑块位置
  const [sliderPosition, setSliderPosition] = React.useState(100);

  // 计算相对时间（相对于比赛开始时间的毫秒数）
  const relativeTimeMs = useMemo(
    () =>
      calculateRelativeTimeMs(
        contestConfig?.start_time,
        contestConfig?.end_time,
        sliderPosition
      ),
    [contestConfig, sliderPosition]
  );

  /**
   * 监听相对时间变化，触发回调
   * 使用 useEffect 避免初始渲染时触发回调
   */
  useEffect(() => {
    // 首次渲染时不触发onTimeChange，仅记录已完成首次渲染
    if (initialRenderRef.current) {
      initialRenderRef.current = false;
      return;
    }

    // 每次时间变化都触发回调
    if (onTimeChange) {
      onTimeChange(relativeTimeMs);
    }
  }, [relativeTimeMs, onTimeChange]);

  // 计算当前比赛时间（相对格式）
  const formattedRelativeTime = useMemo(
    () => formatRelativeTime(relativeTimeMs),
    [relativeTimeMs]
  );

  // 计算剩余时间
  const remainingTime = useMemo(() => {
    if (!contestConfig) return "00:00:00";

    // 计算比赛总时长（毫秒）
    const contestDurationMs =
      ((contestConfig.end_time || 0) - (contestConfig.start_time || 0)) * 1000;

    return formatContestRemainingTime(contestDurationMs, relativeTimeMs);
  }, [contestConfig, relativeTimeMs]);

  /**
   * 处理滑块值变化
   * @param {number | number[]} newPosition - 新的滑块位置
   */
  const handleChange = (newPosition: number | number[]) => {
    const position = Array.isArray(newPosition) ? newPosition[0] : newPosition;
    setSliderPosition(position);
  };

  /**
   * 处理滑块拖动结束
   * 预留函数以便将来需要添加特殊的结束处理逻辑
   */
  const handleAfterChange = () => {
    // 可以在这里添加特殊的拖动结束处理逻辑
  };

  return (
    <>
      {/* 比赛时间信息显示区域 */}
      <div className="detail-time-info">
        <div>开始时间: {formatTime(contestConfig.start_time)}</div>
        <div>
          <span className="detail-custom-status">
            <span className="detail-status-dot"></span>
            <span className="detail-status-text">FINISHED</span>
          </span>
        </div>
        <div>结束时间: {formatTime(contestConfig.end_time)}</div>
      </div>

      {/* 进度条控制区域 */}
      <div>
        <Slider
          value={sliderPosition}
          min={0}
          max={100}
          step={0.01}
          onChange={handleChange}
          onChangeComplete={handleAfterChange}
          styles={{
            track: {
              backgroundColor: "#1890ff",
              height: 12,
              backgroundImage:
                "linear-gradient(45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent)",
              backgroundSize: "24px 24px",
              borderRadius: 0,
            },
            rail: {
              backgroundColor: "#e9e9e9",
              height: 12,
              borderRadius: 0,
            },
            handle: {
              width: 4,
              height: 20,
              marginTop: -4,
              backgroundColor: "#1890ff",
              border: "none",
              borderRadius: 0,
            },
          }}
        />
      </div>

      {/* 比赛时间和图例说明区域 */}
      <div className="detail-duration-container">
        <div>比赛时间: {formattedRelativeTime}</div>

        {/* 奖项和提交状态图例说明 */}
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
            <div className="detail-legend-item detail-honorable">Honorable</div>
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

        <div>剩余时间: {remainingTime}</div>
      </div>
    </>
  );
};

export default ProgressBar;
