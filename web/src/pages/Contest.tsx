import React, { useEffect, useState, useCallback, useRef } from "react";
import { useLocation } from "react-router-dom";
import { getContestConfig } from "../api/contestApi";
import { getContestRank } from "../api/rankApi";
import { ContestConfig } from "../types/contest";
import { Rank } from "../types/rank";
import { Spin } from "antd";
import { CloseCircleOutlined } from "@ant-design/icons";
import "../styles/Contest.css";
import ContestHeader from "../components/ContestHeader";
import ProgressBar from "../components/ProgressBar";
import ScoreboardTable from "../components/ScoreboardTable";

const Contest: React.FC = () => {
  // 状态管理
  const [initialLoading, setInitialLoading] = useState(true);
  const [loading, setLoading] = useState(false); // 更新数据时的加载状态
  const [error, setError] = useState<string | null>(null);
  const [contestConfig, setContestConfig] = useState<ContestConfig | null>(null);
  const [rankData, setRankData] = useState<Rank | null>(null);
  const [sliderPosition, setSliderPosition] = useState(100); // 滑块位置，百分比
  const [relativeTimeMs, setRelativeTimeMs] = useState<number | null>(null);
  const initialLoadCompleted = useRef(false); // 跟踪初始加载是否已完成
  
  // 使用 useLocation 获取完整路径
  const location = useLocation();

  // 获取有效路径
  const apiPath = location.pathname;

  // 获取排行榜数据
  const fetchRankData = useCallback(async (relativeTimeMilliseconds?: number, isInitialLoad = false) => {
    try {
      if (isInitialLoad) {
        setInitialLoading(true);
      } else {
        // 只有在初始加载时才显示加载状态
        setLoading(false);
      }
      
      // 获取排行榜数据，传递相对时间（毫秒）
      const rank = await getContestRank(apiPath, relativeTimeMilliseconds);
      setRankData(rank);
    } catch (err) {
      console.error("获取排行榜数据失败:", err);
      setError("获取排行榜数据失败");
    } finally {
      setInitialLoading(false);
      setLoading(false);
    }
  }, [apiPath]);

  // 获取配置数据（也传递时间参数）
  const fetchConfigData = useCallback(async (relativeTimeMilliseconds?: number) => {
    try {
      // 获取比赛配置，传递相对时间
      const config = await getContestConfig(apiPath, relativeTimeMilliseconds);
      setContestConfig(config);
      return config;
    } catch (err) {
      console.error("获取比赛配置失败:", err);
      setError("获取比赛配置失败");
      return null;
    }
  }, [apiPath]);

  // 初始加载配置和数据 - 仅执行一次
  useEffect(() => {
    // 确保只在初次渲染时执行一次
    if (!initialLoadCompleted.current) {
      const fetchData = async () => {
        try {
          console.log("执行初始数据加载...");
          setInitialLoading(true);
          setError(null);

          // 首先获取初始配置（不带时间参数）
          const config = await fetchConfigData();
          
          if (config) {
            // 如果配置加载成功，计算比赛结束时的相对时间（毫秒）
            const contestDurationSec = (config.end_time || 0) - (config.start_time || 0);
            const endTimeMs = contestDurationSec * 1000;
            
            // 设置初始时间为比赛结束时间（100%）
            setRelativeTimeMs(endTimeMs);
            
            // 获取比赛结束时的排行榜数据
            await fetchRankData(endTimeMs, true);
          }

          // 标记初始加载已完成
          initialLoadCompleted.current = true;
        } catch (err) {
          console.error("获取数据失败:", err);
          setError("获取数据失败，请检查路径是否正确");
        } finally {
          setInitialLoading(false);
        }
      };

      fetchData();
    }
  }, [apiPath, fetchRankData, fetchConfigData]);

  // 处理相对时间变化 - 但避免初始加载时重复触发
  const handleTimeChange = useCallback((newRelativeTimeMs: number) => {
    // 避免与初始值相同时重复触发
    if (relativeTimeMs === newRelativeTimeMs) {
      return;
    }
    
    console.log("时间变化，更新数据:", newRelativeTimeMs);
    setRelativeTimeMs(newRelativeTimeMs);
    
    // 检查是否初始加载已完成再更新数据
    if (initialLoadCompleted.current) {
      // 直接获取新的排行榜数据，不设置 loading 状态
      fetchRankData(newRelativeTimeMs, false);
      
      // 同时更新配置数据（以获取可能的时间点特定配置）
      fetchConfigData(newRelativeTimeMs);
    }
  }, [fetchRankData, fetchConfigData, relativeTimeMs]);

  if (initialLoading && !rankData) {
    return (
      <div className="detail-loading-spinner">
        <Spin size="large" tip="加载中..." />
      </div>
    );
  }

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

      {/* 榜单内容 */}
      <ScoreboardTable 
        contestConfig={contestConfig} 
        rankData={rankData} 
        loading={loading}
      />
    </div>
  );
};

export default Contest;
