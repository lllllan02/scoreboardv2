import React, { useRef, useEffect, useMemo } from "react";
import { Tooltip } from "antd";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import { ContestConfig } from "../types/contest";
import { formatTime } from "../utils/timeUtils";
import "../styles/Contest.css";

interface ProgressBarProps {
  contestConfig: ContestConfig;
  sliderPosition: number;
  setSliderPosition: React.Dispatch<React.SetStateAction<number>>;
  onTimeChange?: (relativeTimeMs: number) => void;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  contestConfig,
  sliderPosition,
  setSliderPosition,
  onTimeChange,
}) => {
  const initialRenderRef = useRef(true);
  
  // 计算相对时间（相对于比赛开始时间的毫秒数）
  const relativeTimeMs = useMemo(() => {
    if (!contestConfig) return 0;
    
    // 计算比赛总时长（秒）
    const contestDurationSec = (contestConfig.end_time || 0) - (contestConfig.start_time || 0);
    // 转为毫秒
    const contestDurationMs = contestDurationSec * 1000;
    
    // 根据滑块位置计算相对时间（毫秒）
    const timeOffsetMs = contestDurationMs * (sliderPosition / 100);
    
    // 返回相对时间（毫秒），向下取整
    return Math.floor(timeOffsetMs);
  }, [contestConfig, sliderPosition]);

  // 当相对时间变化时调用回调，但避免初始渲染时触发
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
  const formattedRelativeTime = useMemo(() => {
    // 将毫秒转换为秒
    const relativeTimeSec = Math.floor(relativeTimeMs / 1000);
    
    // 将秒数转换为时:分:秒格式
    const hours = Math.floor(relativeTimeSec / 3600);
    const minutes = Math.floor((relativeTimeSec % 3600) / 60);
    const seconds = relativeTimeSec % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, [relativeTimeMs]);

  // 计算剩余时间
  const remainingTime = useMemo(() => {
    if (!contestConfig) return "00:00:00";
    
    // 计算比赛总时长（秒）并转为毫秒
    const contestDurationMs = ((contestConfig.end_time || 0) - (contestConfig.start_time || 0)) * 1000;
    
    // 计算剩余时间（毫秒）
    const remainingMs = contestDurationMs - relativeTimeMs;
    if (remainingMs <= 0) return "00:00:00";
    
    // 转换为秒
    const remainingSec = Math.floor(remainingMs / 1000);
    
    // 将剩余秒数转换为时:分:秒格式
    const hours = Math.floor(remainingSec / 3600);
    const minutes = Math.floor((remainingSec % 3600) / 60);
    const seconds = remainingSec % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, [contestConfig, relativeTimeMs]);

  // 处理拖动中的值变化
  const handleChange = (newPosition: number | number[]) => {
    const position = Array.isArray(newPosition) ? newPosition[0] : newPosition;
    setSliderPosition(position);
  };

  // 处理拖动结束 - 保持这个函数以便将来需要添加特殊的结束处理逻辑
  const handleAfterChange = () => {
    // 可以在这里添加特殊的拖动结束处理逻辑
  };
  
  return (
    <>
      {/* 时间信息 */}
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

      {/* 使用rc-slider默认样式 */}
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
              backgroundColor: '#1890ff',
              height: 12,
              backgroundImage: 'linear-gradient(45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent)',
              backgroundSize: '24px 24px',
              borderRadius: 0,
            },
            rail: {
              backgroundColor: '#e9e9e9',
              height: 12,
              borderRadius: 0,
            },
            handle: {
              width: 4,
              height: 20,
              marginTop: -4,
              backgroundColor: '#1890ff',
              border: 'none',
              borderRadius: 0,
            }
          }}
        />
      </div>

      {/* 持续时间和图例 */}
      <div className="detail-duration-container">
        <div>
          比赛时间: {formattedRelativeTime}
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
