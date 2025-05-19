import React, { useEffect, useState, useCallback, useRef } from "react";
import { useLocation } from "react-router-dom";
import { getContestConfig } from "../api/contestApi";
import { getContestRank } from "../api/rankApi";
import { ContestConfig } from "../types/contest";
import { Rank } from "../types/rank";
import { CloseCircleOutlined } from "@ant-design/icons";
import "../styles/Contest.css";
import ContestHeader from "../components/ContestHeader";
import ProgressBar from "../components/ProgressBar";
import ScoreboardTable from "../components/ScoreboardTable";
import GroupFilter from "../components/GroupFilter";

const Contest: React.FC = () => {
  // 状态管理
  const [error, setError] = useState<string | null>(null);
  const [contestConfig, setContestConfig] = useState<ContestConfig | null>(
    null
  );
  const [rankData, setRankData] = useState<Rank | null>(null);
  const [sliderPosition, setSliderPosition] = useState(100); // 滑块位置，百分比
  const [filteredRankData, setFilteredRankData] = useState<Rank | null>(null);
  const initialLoadCompleted = useRef(false); // 跟踪初始加载是否已完成

  const [selectedGroup, setSelectedGroup] = useState("all");
  const [relativeTimeMs, setRelativeTimeMs] = useState<number | null>(null);
  // const [selectedAction, setSelectedAction] = useState("rank");

  // 使用 useLocation 获取完整路径
  const location = useLocation();

  // 获取有效路径
  const apiPath = location.pathname;

  // 获取排行榜数据
  const fetchRankData = useCallback(
    async (selectedGroup?: string, relativeTimeMs?: number) => {
      try {
        // 获取排行榜数据，传递相对时间（毫秒）和分组
        const rank = await getContestRank(
          apiPath,
          relativeTimeMs ?? undefined,
          selectedGroup
        );
        setRankData(rank);
        setFilteredRankData(rank); // 由于后端已经过滤，直接使用返回的数据
      } catch (err) {
        console.error("获取排行榜数据失败:", err);
        setError("获取排行榜数据失败");
      } finally {
      }
    },
    [apiPath, selectedGroup] // 添加 selectedGroup 作为依赖
  );

  // 获取配置数据（也传递时间参数）
  const fetchConfigData = useCallback(
    async (relativeTimeMilliseconds?: number) => {
      try {
        // 获取比赛配置，传递相对时间
        const config = await getContestConfig(
          apiPath,
          relativeTimeMilliseconds
        );
        setContestConfig(config);
        return config;
      } catch (err) {
        console.error("获取比赛配置失败:", err);
        setError("获取比赛配置失败");
        return null;
      }
    },
    [apiPath]
  );

  // 初始加载配置和数据 - 仅执行一次
  useEffect(() => {
    // 确保只在初次渲染时执行一次
    if (!initialLoadCompleted.current) {
      const fetchData = async () => {
        try {
          console.log("执行初始数据加载...");
          setError(null);

          // 首先获取初始配置（不带时间参数）
          const config = await fetchConfigData();

          if (config) {
            // 如果配置加载成功，计算比赛结束时的相对时间（毫秒）
            const contestDurationSec =
              (config.end_time || 0) - (config.start_time || 0);
            const endTimeMs = contestDurationSec * 1000;

            // 设置初始时间为比赛结束时间（100%）
            setRelativeTimeMs(endTimeMs);

            // 获取比赛结束时的排行榜数据
            await fetchRankData(selectedGroup, endTimeMs);
          }

          // 标记初始加载已完成
          initialLoadCompleted.current = true;
        } catch (err) {
          console.error("获取数据失败:", err);
          setError("获取数据失败，请检查路径是否正确");
        } finally {
        }
      };

      fetchData();
    }
  }, [apiPath, fetchRankData, fetchConfigData]);

  // 处理相对时间变化 - 但避免初始加载时重复触发
  const handleTimeChange = useCallback(
    (newRelativeTimeMs: number) => {
      // 避免与初始值相同时重复触发
      if (relativeTimeMs === newRelativeTimeMs) {
        return;
      }

      console.log("时间变化，更新数据:", newRelativeTimeMs);
      setRelativeTimeMs(newRelativeTimeMs);

      // 检查是否初始加载已完成再更新数据
      if (initialLoadCompleted.current) {
        // 直接获取新的排行榜数据，不设置 loading 状态
        fetchRankData(selectedGroup, newRelativeTimeMs);
      }
    },
    [fetchRankData, relativeTimeMs]
  );

  // 处理分组和动作变化
  const handleGroupChange = useCallback(
    (values: { group: string; action: string }) => {
      console.log("handleGroupChange called with:", values);
      setSelectedGroup(values.group);
      // setSelectedAction(values.action);

      // 根据选择的动作执行不同的操作
      switch (values.action) {
        case "rank":
          // 重新获取数据，让后端处理分组
          if (relativeTimeMs !== null) {
            console.log("Fetching rank data with:", values.group, relativeTimeMs);
            fetchRankData(values.group, relativeTimeMs);
          } else {
            console.log("relativeTimeMs is null");
          }
          break;
        case "scroll":
          // TODO: 处理滚榜逻辑
          console.log("滚榜功能待实现");
          break;
        case "export":
          // TODO: 处理导出逻辑
          console.log("导出功能待实现");
          break;
        case "stats":
          // TODO: 处理统计逻辑
          console.log("统计功能待实现");
          break;
        case "submit":
          // TODO: 处理提交逻辑
          console.log("提交功能待实现");
          break;
        default:
          break;
      }
    },
    [fetchRankData, relativeTimeMs] // 添加依赖
  );

  if (error && !rankData) {
    return (
      <div className="detail-error-message">
        <CloseCircleOutlined className="detail-error-icon" />
        {error}
      </div>
    );
  }

  if (!contestConfig || !rankData) {
    return (
      <div className="detail-error-message">
        <CloseCircleOutlined className="detail-error-icon" />
        比赛配置或排行榜数据不存在
      </div>
    );
  }

  return (
    <div className="detail-main-container">
      <ContestHeader contestConfig={contestConfig} />

      {/* 进度条和时间信息区域，使用统一容器 */}
      <div className="detail-time-container">
        <ProgressBar
          contestConfig={contestConfig}
          sliderPosition={sliderPosition}
          setSliderPosition={setSliderPosition}
          onTimeChange={handleTimeChange}
        />
      </div>

      {/* 添加分组筛选器 */}
      <GroupFilter contestConfig={contestConfig} onChange={handleGroupChange} />

      {/* 使用过滤后的榜单数据 */}
      <ScoreboardTable
        contestConfig={contestConfig}
        rankData={filteredRankData || rankData}
      />
    </div>
  );
};

export default Contest;
