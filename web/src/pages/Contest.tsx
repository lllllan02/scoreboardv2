import React, { useEffect, useState } from "react";
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [contestConfig, setContestConfig] = useState<ContestConfig | null>(
    null
  );
  const [rankData, setRankData] = useState<Rank | null>(null);
  const [sliderPosition, setSliderPosition] = useState(100); // 滑块位置，百分比

  // 使用 useLocation 获取完整路径
  const location = useLocation();

  // 获取有效路径
  const apiPath = location.pathname;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // 获取比赛配置
        const config = await getContestConfig(apiPath);
        setContestConfig(config);

        // 获取排行榜数据
        const rank = await getContestRank(apiPath);
        setRankData(rank);
      } catch (err) {
        console.error("获取数据失败:", err);
        setError("获取数据失败，请检查路径是否正确");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [apiPath]);

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
        />
      </div>

      {/* 榜单内容 */}
      <ScoreboardTable 
        contestConfig={contestConfig} 
        rankData={rankData} 
      />
    </div>
  );
};

export default Contest;
