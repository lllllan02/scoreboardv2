import React, { useRef, useCallback, useEffect, useMemo, useState } from "react";
import { Tooltip } from "antd";
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
  const progressBarRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const initialRenderRef = useRef(true);
  const [currentDragPosition, setCurrentDragPosition] = useState(sliderPosition);
  
  // 节流拖动更新的时间戳
  const lastDragUpdate = useRef(0);
  // 存储最后一次拖动位置
  const lastPosition = useRef(sliderPosition);
  // 跟踪requestAnimationFrame的ID
  const animationFrameId = useRef<number | null>(null);

  // 同步外部的sliderPosition到内部状态
  useEffect(() => {
    if (!isDragging) {
      setCurrentDragPosition(sliderPosition);
      lastPosition.current = sliderPosition;
      
      // 直接更新DOM以提高性能
      updatePositionDOM(sliderPosition);
    }
  }, [sliderPosition, isDragging]);

  // 直接更新DOM元素位置，避免React渲染循环
  const updatePositionDOM = useCallback((position: number) => {
    if (fillRef.current) {
      fillRef.current.style.width = `${position}%`;
    }
    if (sliderRef.current) {
      sliderRef.current.style.left = `${position}%`;
    }
  }, []);

  // 使用requestAnimationFrame优化拖动更新
  const updateDragPosition = useCallback((position: number) => {
    // 存储最新位置
    lastPosition.current = position;
    
    // 如果已经有动画帧请求，不再重复请求
    if (animationFrameId.current !== null) return;
    
    // 请求动画帧更新DOM
    animationFrameId.current = requestAnimationFrame(() => {
      // 更新DOM元素位置
      updatePositionDOM(lastPosition.current);
      // 更新状态（低频率）
      const now = Date.now();
      if (now - lastDragUpdate.current > 50) { // 每50ms才更新React状态
        setCurrentDragPosition(lastPosition.current);
        lastDragUpdate.current = now;
      }
      animationFrameId.current = null;
    });
  }, [updatePositionDOM]);

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

  // 处理鼠标移动 - 高性能版本
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!progressBarRef.current || !isDragging) return;

      // 阻止默认行为，防止文本选择等
      e.preventDefault();

      const rect = progressBarRef.current.getBoundingClientRect();
      let percentage = ((e.clientX - rect.left) / rect.width) * 100;
      percentage = Math.max(0, Math.min(100, percentage)); // 确保在0-100之间

      // 使用优化的方法更新位置
      updateDragPosition(percentage);
    },
    [isDragging, updateDragPosition]
  );

  // 处理触摸移动 - 高性能版本
  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!progressBarRef.current || !isDragging) return;

      // 阻止默认行为，防止页面滚动等
      e.preventDefault();

      const rect = progressBarRef.current.getBoundingClientRect();
      let percentage = ((e.touches[0].clientX - rect.left) / rect.width) * 100;
      percentage = Math.max(0, Math.min(100, percentage)); // 确保在0-100之间

      // 使用优化的方法更新位置
      updateDragPosition(percentage);
    },
    [isDragging, updateDragPosition]
  );

  // 拖动开始
  const startDrag = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    // 对于鼠标事件，阻止默认行为和文本选择
    if ('button' in e && e.button === 0) {
      e.preventDefault();
    }
    
    setIsDragging(true);
    document.addEventListener("mousemove", handleMouseMove, { passive: false });
    document.addEventListener("mouseup", endDrag);
    document.addEventListener("touchmove", handleTouchMove, { passive: false });
    document.addEventListener("touchend", endDrag);
    
    // 添加拖动状态类
    document.body.classList.add('dragging-active');
  }, [handleMouseMove, handleTouchMove]);

  // 拖动结束
  const endDrag = useCallback(() => {
    setIsDragging(false);
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", endDrag);
    document.removeEventListener("touchmove", handleTouchMove);
    document.removeEventListener("touchend", endDrag);
    
    // 移除拖动状态类
    document.body.classList.remove('dragging-active');
    
    // 取消任何待处理的动画帧请求
    if (animationFrameId.current !== null) {
      cancelAnimationFrame(animationFrameId.current);
      animationFrameId.current = null;
    }
    
    // 确保状态与最后位置同步
    setCurrentDragPosition(lastPosition.current);
    
    // 拖动结束时更新最终位置并触发数据更新
    setSliderPosition(lastPosition.current);
    
    // 拖动结束时确保触发数据更新
    if (onTimeChange && contestConfig) {
      // 计算结束时的相对时间
      const contestDurationSec = (contestConfig.end_time || 0) - (contestConfig.start_time || 0);
      const contestDurationMs = contestDurationSec * 1000;
      const finalTimeMs = Math.floor(contestDurationMs * (lastPosition.current / 100));
      onTimeChange(finalTimeMs);
    }
  }, [handleMouseMove, handleTouchMove, onTimeChange, contestConfig, setSliderPosition]);

  // 点击进度条直接跳转
  const handleBarClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!progressBarRef.current) return;
      
      const rect = progressBarRef.current.getBoundingClientRect();
      let percentage = ((e.clientX - rect.left) / rect.width) * 100;
      percentage = Math.max(0, Math.min(100, percentage)); // 确保在0-100之间

      // 更新状态
      lastPosition.current = percentage;
      setCurrentDragPosition(percentage); 
      setSliderPosition(percentage);
      // 直接更新DOM
      updatePositionDOM(percentage);
    },
    [setSliderPosition, updatePositionDOM]
  );

  // 清理函数
  useEffect(() => {
    return () => {
      // 组件卸载时清理事件监听器
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", endDrag);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", endDrag);
      document.body.classList.remove('dragging-active');
      
      // 取消任何待处理的动画帧请求
      if (animationFrameId.current !== null) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [handleMouseMove, handleTouchMove, endDrag]);

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

  return (
    <>
      {/* 进度条 */}
      <div
        className="detail-progress-bar detail-progress-bar-custom"
        ref={progressBarRef}
        onClick={handleBarClick}
      >
        <div
          className="detail-progress-fill detail-progress-striped"
          style={{ width: `${currentDragPosition}%` }}
          ref={fillRef}
        ></div>

        {/* 可拖动滑块 */}
        <div
          className="detail-progress-slider"
          style={{ left: `${currentDragPosition}%` }}
          ref={sliderRef}
          onMouseDown={startDrag}
          onTouchStart={startDrag}
        >
          <div className="detail-slider-handle"></div>
        </div>
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
      
      {/* 加载指示器 */}
      {isDragging && (
        <div className="detail-time-loading-indicator">数据加载中...</div>
      )}
    </>
  );
};

export default ProgressBar;
