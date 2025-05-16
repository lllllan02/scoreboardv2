import React, { useRef, useCallback, useEffect, useMemo, useState } from "react";
import { Tooltip } from "antd";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import { ContestConfig } from "../types/contest";
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
  const [isDragging, setIsDragging] = useState(false);
  
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

  // 当相对时间变化时调用回调，但避免初始渲染和拖动过程中触发
  useEffect(() => {
    // 首次渲染时不触发onTimeChange，仅记录已完成首次渲染
    if (initialRenderRef.current) {
      initialRenderRef.current = false;
      return;
    }
    
    // 只在拖动结束后或点击进度条时才触发回调
    if (onTimeChange && !isDragging) {
      onTimeChange(relativeTimeMs);
    }
  }, [relativeTimeMs, onTimeChange, isDragging]);

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
    setSliderPosition(Array.isArray(newPosition) ? newPosition[0] : newPosition);
    setIsDragging(true);
  };

  // 处理拖动结束
  const handleAfterChange = (newPosition: number | number[]) => {
    setIsDragging(false);
    if (onTimeChange && contestConfig) {
      const contestDurationSec = (contestConfig.end_time || 0) - (contestConfig.start_time || 0);
      const contestDurationMs = contestDurationSec * 1000;
      const finalValue = Array.isArray(newPosition) ? newPosition[0] : newPosition;
      const finalTimeMs = Math.floor(contestDurationMs * (finalValue / 100));
      onTimeChange(finalTimeMs);
    }
  };
  
  // 处理拖动开始
  const handleBeforeChange = () => {
    setIsDragging(true);
    document.body.classList.add('dragging-active');
  };

  return (
    <>
      {/* 使用rc-slider替换自定义进度条 */}
      <div className="detail-progress-bar-container">
        <Slider
          value={sliderPosition}
          min={0}
          max={100}
          step={0.01}
          onChange={handleChange}
          onBeforeChange={handleBeforeChange}
          onAfterChange={handleAfterChange}
          trackStyle={{ backgroundColor: '#4caf50', height: 10 }}
          railStyle={{ backgroundColor: '#e0e0e0', height: 10 }}
          handleStyle={{
            borderColor: '#2e7d32',
            height: 20,
            width: 20,
            marginTop: -5,
            backgroundColor: '#2e7d32',
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
