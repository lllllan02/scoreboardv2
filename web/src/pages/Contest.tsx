import React, { useEffect, useState, useCallback, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getContestConfig } from "../api/contestApi";
import { getContestRank } from "../api/rankApi";
import { getContestSubmissions } from "../api/contestApi";
import { ContestConfig } from "../types/contest";
import { Rank } from "../types/rank";
import { Submission } from "../types/submission";
import { CloseCircleOutlined } from "@ant-design/icons";
import "../styles/Contest.css";
import ContestHeader from "../components/ContestHeader";
import ProgressBar from "../components/ProgressBar";
import ScoreboardTable from "../components/ScoreboardTable";
import GroupFilter from "../components/GroupFilter";
import SubmissionList from "../components/SubmissionList";

const Contest: React.FC = () => {
  // 状态管理
  const [error, setError] = useState<string | null>(null);
  const [contestConfig, setContestConfig] = useState<ContestConfig | null>(
    null
  );
  const [rankData, setRankData] = useState<Rank | null>(null);
  const [filteredRankData, setFilteredRankData] = useState<Rank | null>(null);
  const initialLoadCompleted = useRef(false); // 跟踪初始加载是否已完成

  // 使用 useLocation 和 useNavigate 获取和更新 URL
  const location = useLocation();
  const navigate = useNavigate();

  // 从 URL 参数中获取初始值
  const searchParams = new URLSearchParams(location.search);
  const [selectedGroup, setSelectedGroup] = useState(searchParams.get("group") || "all");
  const [selectedAction, setSelectedAction] = useState(searchParams.get("action") || "rank");
  const [relativeTimeMs, setRelativeTimeMs] = useState<number | null>(
    searchParams.get("t") ? parseInt(searchParams.get("t")!) : null
  );

  // 获取有效路径（移除查询参数）
  const apiPath = location.pathname;

  // 更新 URL 参数的函数
  const updateUrlParams = useCallback((group: string, action: string, time?: number) => {
    const params = new URLSearchParams();
    if (group && group !== "all") {
      params.set("group", group);
    }
    if (action && action !== "rank") {
      params.set("action", action);
    }
    if (time) {
      params.set("t", time.toString());
    }
    
    // 构建新的 URL，保持路径不变，只更新参数
    const newUrl = `${location.pathname}${params.toString() ? `?${params.toString()}` : ""}`;
    navigate(newUrl, { replace: true });
  }, [location.pathname, navigate]);

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
    [apiPath]
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

  // 修改提交列表状态
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [submissionsLoading, setSubmissionsLoading] = useState<boolean>(false);
  const [submissionTotal, setSubmissionTotal] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(50);

  // 获取提交列表数据
  const fetchSubmissionData = useCallback(
    async (selectedGroup?: string, relativeTimeMs?: number, page: number = 1, size: number = 50) => {
      try {
        setSubmissionsLoading(true);
        const response = await getContestSubmissions(
          apiPath,
          selectedGroup,
          relativeTimeMs,
          page,
          size
        );
        setSubmissions(response.data.data);
        setSubmissionTotal(response.data.total);
      } catch (err) {
        console.error("获取提交列表失败:", err);
        setError("获取提交列表失败");
      } finally {
        setSubmissionsLoading(false);
      }
    },
    [apiPath]
  );

  // 处理数据获取的通用函数
  const fetchData = useCallback(
    (group: string, action: string, time: number | null, page: number = 1) => {
      if (time === null) {
        console.log("relativeTimeMs is null");
        return;
      }

      console.log(`Fetching ${action} data with:`, { group, time, page });
      if (action === "submit") {
        fetchSubmissionData(group, time, page, pageSize);
      } else if (action === "rank") {
        fetchRankData(group, time);
      }
    },
    [fetchRankData, fetchSubmissionData, pageSize]
  );

  // 处理相对时间变化 - 但避免初始加载时重复触发
  const handleTimeChange = useCallback(
    (newRelativeTimeMs: number) => {
      // 避免与初始值相同时重复触发
      if (relativeTimeMs === newRelativeTimeMs) {
        return;
      }

      console.log("时间变化，更新数据:", newRelativeTimeMs);
      setRelativeTimeMs(newRelativeTimeMs);
      
      // 更新 URL 参数
      updateUrlParams(selectedGroup, selectedAction, newRelativeTimeMs);

      // 检查是否初始加载已完成再更新数据
      if (initialLoadCompleted.current) {
        fetchData(selectedGroup, selectedAction, newRelativeTimeMs);
      }
    },
    [fetchData, relativeTimeMs, selectedGroup, selectedAction, updateUrlParams]
  );

  // 处理分组和动作变化
  const handleGroupChange = useCallback(
    (values: { group: string; action: string }) => {
      console.log("handleGroupChange called with:", values);
      setSelectedGroup(values.group);
      setSelectedAction(values.action);
      
      // 更新 URL 参数
      updateUrlParams(values.group, values.action, relativeTimeMs ?? undefined);

      // 如果是提交列表，重置分页状态
      if (values.action === "submit") {
        setCurrentPage(1);
      }

      // 只有 rank 和 submit 需要获取数据
      if (["rank", "submit"].includes(values.action)) {
        fetchData(values.group, values.action, relativeTimeMs, 1);
      }
    },
    [fetchData, relativeTimeMs, updateUrlParams]
  );

  // 处理分页变化
  const handleSubmissionPageChange = useCallback(
    (page: number, size: number) => {
      setCurrentPage(page);
      setPageSize(size);
      fetchData(selectedGroup, "submit", relativeTimeMs, page);
    },
    [selectedGroup, relativeTimeMs, fetchData]
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
            // 如果 URL 中没有时间参数，使用比赛结束时间
            if (!searchParams.get("t")) {
              // 如果配置加载成功，计算比赛结束时的相对时间（毫秒）
              const contestDurationSec =
                (config.end_time || 0) - (config.start_time || 0);
              const endTimeMs = contestDurationSec * 1000;

              // 设置初始时间为比赛结束时间（100%）
              setRelativeTimeMs(endTimeMs);
              updateUrlParams(selectedGroup, selectedAction, endTimeMs);

              // 根据当前的 action 获取对应数据
              if (selectedAction === "submit") {
                await fetchSubmissionData(selectedGroup, endTimeMs, 1, pageSize);
              } else {
                await fetchRankData(selectedGroup, endTimeMs);
              }
            } else {
              // 使用 URL 中的时间参数
              const timeMs = parseInt(searchParams.get("t")!);
              if (selectedAction === "submit") {
                await fetchSubmissionData(selectedGroup, timeMs, 1, pageSize);
              } else {
                await fetchRankData(selectedGroup, timeMs);
              }
            }
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
  }, [apiPath, fetchRankData, fetchConfigData, searchParams, selectedGroup, selectedAction, updateUrlParams, fetchSubmissionData, pageSize]);

  if (error) {
    return (
      <div className="detail-error-message">
        <CloseCircleOutlined className="detail-error-icon" />
        {error}
      </div>
    );
  }

  if (!contestConfig || (selectedAction !== "submit" && !rankData)) {
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
          onTimeChange={handleTimeChange}
        />
      </div>

      {/* 添加分组筛选器 */}
      <GroupFilter 
        contestConfig={contestConfig} 
        onChange={handleGroupChange}
        initialGroup={selectedGroup}
        initialAction={selectedAction}
      />

      {selectedAction === "submit" ? (
        <SubmissionList
          contestConfig={contestConfig}
          submissions={submissions}
          loading={submissionsLoading}
          total={submissionTotal}
          currentPage={currentPage}
          pageSize={pageSize}
          onPageChange={handleSubmissionPageChange}
        />
      ) : (
        <ScoreboardTable
          contestConfig={contestConfig}
          rankData={rankData!}
        />
      )}
    </div>
  );
};

export default Contest;
