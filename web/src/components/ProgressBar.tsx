import React, { useRef, useCallback, useEffect } from "react";
import { Tooltip } from "antd";
import { ContestConfig } from "../types/contest";
import { formatDuration } from "../utils/timeUtils";
import "../styles/Contest.css";

interface ProgressBarProps {
  contestConfig: ContestConfig;
  sliderPosition: number;
  setSliderPosition: React.Dispatch<React.SetStateAction<number>>;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  contestConfig,
  sliderPosition,
  setSliderPosition,
}) => {
  const progressBarRef = useRef<HTMLDivElement>(null);

  // 处理鼠标移动
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!progressBarRef.current) return;

      const rect = progressBarRef.current.getBoundingClientRect();
      let percentage = ((e.clientX - rect.left) / rect.width) * 100;
      percentage = Math.max(0, Math.min(100, percentage)); // 确保在0-100之间

      setSliderPosition(percentage);
    },
    [setSliderPosition]
  );

  // 处理触摸移动
  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!progressBarRef.current) return;

      const rect = progressBarRef.current.getBoundingClientRect();
      let percentage = ((e.touches[0].clientX - rect.left) / rect.width) * 100;
      percentage = Math.max(0, Math.min(100, percentage)); // 确保在0-100之间

      setSliderPosition(percentage);
    },
    [setSliderPosition]
  );

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
    // 组件卸载时清理事件监听器
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", endDrag);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", endDrag);
    };
  }, [handleMouseMove, handleTouchMove, endDrag]);

  return (
    <>
      {/* 进度条 */}
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

      {/* 持续时间和图例 */}
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

        <div>剩余时间: 00:00:00</div>
      </div>
    </>
  );
};

export default ProgressBar;
