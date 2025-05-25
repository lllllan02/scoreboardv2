import React, { useEffect, useState, useCallback, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getContestConfig } from "../api/contestApi";
import { getContestRank } from "../api/rankApi";
import { getContestSubmissions } from "../api/submission";
import { ContestConfig } from "../types/contest";
import { Rank } from "../types/rank";
import { Submission, Participant } from "../types/submission";
import { CloseCircleOutlined } from "@ant-design/icons";
import { Spin, message } from "antd";
import InfiniteScroll from "react-infinite-scroll-component";
import "../styles/Contest.css";
import ContestHeader from "../components/ContestHeader";
import ProgressBar from "../components/ProgressBar";
import ScoreboardTable from "../components/ScoreboardTable";
import GroupFilter from "../components/GroupFilter";
import SubmissionList from "../components/SubmissionList";
import StatsPanel from "../components/StatsPanel";
import ExportPanel from "../components/ExportPanel";

// 每次加载的队伍数量
const ITEMS_PER_PAGE = 50;

// 计算最大列宽的函数
const calculateMaxColumnWidths = (rankData: Rank) => {
  let maxSchoolWidth = 150; // 默认最小宽度
  let maxTeamWidth = 140; // 默认最小宽度

  // 遍历所有数据计算最大宽度
  rankData.rows.forEach((row) => {
    // 使用 canvas 计算文本宽度
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (context) {
      context.font =
        '14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial';

      // 计算学校名称宽度
      // 学校名称的总宽度 = 文本宽度 + 学校排名宽度(25px) + 左右padding(16px) + 安全边距(10px)
      const schoolTextWidth = context.measureText(row.organization).width;
      const schoolWidth = schoolTextWidth + (row.org_place > 0 ? 25 : 0) + 16 + 10;
      maxSchoolWidth = Math.max(maxSchoolWidth, schoolWidth);

      // 计算队伍名称宽度
      // 队伍名称的总宽度 = 文本宽度 + 女队图标宽度(24px) + 非正式队伍图标宽度(24px) + 图标间距(8px) + 左右padding(16px) + 安全边距(10px)
      const teamTextWidth = context.measureText(row.team).width;
      const teamWidth = teamTextWidth + (row.girl ? 32 : 0) + (row.unofficial ? 32 : 0) + 8 + 16 + 10;
      maxTeamWidth = Math.max(maxTeamWidth, teamWidth);
    }
  });

  return {
    schoolWidth: Math.ceil(maxSchoolWidth),
    teamWidth: Math.ceil(maxTeamWidth),
  };
};

const Contest: React.FC = () => {
  // 状态管理
  const [error, setError] = useState<string | null>(null);
  const [contestConfig, setContestConfig] = useState<ContestConfig | null>(
    null
  );
  const [rankData, setRankData] = useState<Rank | null>(null);
  const [visibleRows, setVisibleRows] = useState<Rank["rows"]>([]);
  const [hasMore, setHasMore] = useState(true);
  const initialLoadCompleted = useRef(false); // 跟踪初始加载是否已完成
  const [isLoading, setIsLoading] = useState(true);
  const [columnWidths, setColumnWidths] = useState<{
    schoolWidth: number;
    teamWidth: number;
  } | null>(null);

  // 使用 useLocation 和 useNavigate 获取和更新 URL
  const location = useLocation();
  const navigate = useNavigate();

  // 从 URL 参数中获取初始值
  const searchParams = new URLSearchParams(location.search);
  const [selectedGroup, setSelectedGroup] = useState(
    searchParams.get("group") || "all"
  );
  const [selectedAction, setSelectedAction] = useState(
    searchParams.get("action") || "rank"
  );
  const [relativeTimeMs, setRelativeTimeMs] = useState<number | null>(
    searchParams.get("t") ? parseInt(searchParams.get("t")!) : null
  );

  // 获取有效路径（移除查询参数）
  const apiPath = location.pathname;

  // 更新 URL 参数的函数
  const updateUrlParams = useCallback(
    (group: string, action: string, time?: number) => {
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
      const newUrl = `${location.pathname}${
        params.toString() ? `?${params.toString()}` : ""
      }`;
      navigate(newUrl, { replace: true });
    },
    [location.pathname, navigate]
  );

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

        // 计算最大列宽（仅在首次加载时）
        if (!columnWidths) {
          const widths = calculateMaxColumnWidths(rank);
          setColumnWidths(widths);
        }

        // 初始只加载部分数据
        setHasMore(rank.rows.length > ITEMS_PER_PAGE);
        setVisibleRows(rank.rows.slice(0, ITEMS_PER_PAGE));
      } catch (err) {
        console.error("获取排行榜数据失败:", err);
        setError("获取排行榜数据失败");
      }
    },
    [apiPath, columnWidths]
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
  const [submissionFilters, setSubmissionFilters] = useState<{
    school?: string;
    team?: string;
    language?: string;
    status?: string;
  }>({});
  const [submissionFilterOptions, setSubmissionFilterOptions] = useState<{
    schools: string[];
    participants: Participant[];
    languages: string[];
    statuses: string[];
  }>({
    schools: [],
    participants: [],
    languages: [],
    statuses: [],
  });

  // 获取提交列表数据
  const fetchSubmissionData = useCallback(
    async (
      selectedGroup?: string,
      relativeTimeMs?: number | null,
      page: number = 1,
      size: number = 50,
      filters: typeof submissionFilters = {}
    ) => {
      try {
        setSubmissionsLoading(true);
        const response = await getContestSubmissions(
          apiPath,
          selectedGroup,
          relativeTimeMs || undefined,
          page,
          size,
          filters
        );

        setSubmissions(response.data.data);
        setSubmissionTotal(response.data.total);
        // 更新筛选选项
        setSubmissionFilterOptions({
          schools: response.data.schools,
          participants: response.data.participants,
          languages: response.data.language,
          statuses: response.data.status,
        });
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
        // 使用当前的筛选条件
        fetchSubmissionData(group, time, page, pageSize, submissionFilters);
      } else if (action === "rank") {
        fetchRankData(group, time);
      }
    },
    [fetchRankData, fetchSubmissionData, pageSize, submissionFilters]
  );

  // 处理筛选变化
  const handleSubmissionFilterChange = useCallback(
    (filters: typeof submissionFilters) => {
      const newFilters = { ...submissionFilters, ...filters };
      // 如果新的筛选值是 undefined，则从筛选条件中移除该字段
      Object.keys(filters).forEach(key => {
        if (filters[key as keyof typeof filters] === undefined) {
          delete newFilters[key as keyof typeof filters];
        }
      });
      setSubmissionFilters(newFilters);
      fetchSubmissionData(
        selectedGroup,
        relativeTimeMs ?? undefined,
        1,
        pageSize,
        newFilters
      );
    },
    [
      fetchSubmissionData,
      selectedGroup,
      relativeTimeMs,
      pageSize,
      submissionFilters,
    ]
  );

  // 修改初始化逻辑，添加加载状态控制
  useEffect(() => {
    if (!initialLoadCompleted.current) {
      const fetchInitialData = async () => {
        try {
          setIsLoading(true);
          console.log("执行初始数据加载...");
          setError(null);

          // 首先获取初始配置
          const config = await fetchConfigData();
          if (!config) {
            setError("获取比赛配置失败");
            return;
          }

          // 计算初始时间
          let initialTimeMs: number;
          const urlTimeParam = searchParams.get("t");

          if (!urlTimeParam) {
            // 如果 URL 中没有时间参数，使用比赛结束时间
            const contestDurationSec =
              (config.end_time || 0) - (config.start_time || 0);
            initialTimeMs = contestDurationSec * 1000;
          } else {
            initialTimeMs = parseInt(urlTimeParam);
          }

          // 设置时间状态
          setRelativeTimeMs(initialTimeMs);

          // 只在没有 URL 时间参数的情况下更新 URL，避免重复更新
          if (!urlTimeParam) {
            updateUrlParams(selectedGroup, selectedAction, initialTimeMs);
          }

          // 根据当前的 action 一次性获取所需数据
          if (selectedAction === "submit") {
            await fetchSubmissionData(
              selectedGroup,
              initialTimeMs,
              1,
              pageSize
            );
          } else {
            await fetchRankData(selectedGroup, initialTimeMs);
          }

          // 标记初始加载已完成
          initialLoadCompleted.current = true;
        } catch (err) {
          console.error("获取数据失败:", err);
          setError("获取数据失败，请检查路径是否正确");
        } finally {
          setIsLoading(false);
        }
      };

      fetchInitialData();
    }
  }, []);

  // 处理时间变化的防抖
  const debouncedTimeChange = useCallback(
    (newRelativeTimeMs: number) => {
      if (relativeTimeMs === newRelativeTimeMs) {
        return;
      }

      console.log("时间变化，更新数据:", newRelativeTimeMs);
      setRelativeTimeMs(newRelativeTimeMs);

      // 更新 URL 参数
      updateUrlParams(selectedGroup, selectedAction, newRelativeTimeMs);

      // 检查是否初始加载已完成再更新数据
      if (initialLoadCompleted.current) {
        // 使用 setTimeout 进行简单的防抖
        const timeoutId = setTimeout(() => {
          fetchData(selectedGroup, selectedAction, newRelativeTimeMs);
        }, 300); // 300ms 的防抖延迟

        return () => clearTimeout(timeoutId);
      }
    },
    [fetchData, relativeTimeMs, selectedGroup, selectedAction, updateUrlParams]
  );

  // 更新 handleTimeChange 使用防抖版本
  const handleTimeChange = useCallback(
    (newRelativeTimeMs: number) => {
      debouncedTimeChange(newRelativeTimeMs);
    },
    [debouncedTimeChange]
  );

  // 处理分组和动作变化
  const handleGroupChange = useCallback(
    (values: { group: string; action: string }) => {
      console.log("handleGroupChange called with:", values);
      setSelectedGroup(values.group);
      setSelectedAction(values.action);

      // 更新 URL 参数
      updateUrlParams(values.group, values.action, relativeTimeMs || undefined);

      // 如果是提交列表，重置分页状态和筛选条件
      if (values.action === "submit") {
        setCurrentPage(1);
        // 重置筛选条件
        setSubmissionFilters({});
        // 使用空的筛选条件获取数据
        fetchSubmissionData(values.group, relativeTimeMs ?? undefined, 1, pageSize, {});
      } else if (values.action === "rank") {
        fetchRankData(values.group, relativeTimeMs ?? undefined);
      }
    },
    [fetchSubmissionData, fetchRankData, relativeTimeMs, pageSize, updateUrlParams]
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

  // 加载更多数据
  const loadMoreData = useCallback(() => {
    if (!hasMore || !rankData) return;

    const currentLength = visibleRows.length;
    const nextItems = rankData.rows.slice(
      currentLength,
      currentLength + ITEMS_PER_PAGE
    );

    setVisibleRows((prev) => [...prev, ...nextItems]);
    setHasMore(currentLength + ITEMS_PER_PAGE < rankData.rows.length);
  }, [hasMore, rankData, visibleRows.length]);

  // 处理导出操作
  const handleExport = (type: string) => {
    console.log('Export type:', type);
    // TODO: 实现具体的导出功能
    message.info(`正在导出 ${type} 格式文件...`);
  };

  // 处理复制到剪贴板
  const handleCopy = () => {
    // TODO: 实现复制到剪贴板功能
    message.success('已复制到剪贴板');
  };

  if (error) {
    return (
      <div className="detail-error-message">
        <CloseCircleOutlined className="detail-error-icon" />
        {error}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="detail-loading-container">
        <Spin size="large" tip="加载中..." />
      </div>
    );
  }

  if (!contestConfig || (selectedAction !== "submit" && !rankData)) {
    return (
      <div className="detail-loading-container">
        <Spin size="large" tip="加载中..." />
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
          initialTimeMs={relativeTimeMs ?? undefined}
        />
      </div>

      {/* 添加分组筛选器 */}
      <GroupFilter
        contestConfig={contestConfig}
        onChange={handleGroupChange}
        initialGroup={selectedGroup}
        initialAction={selectedAction}
      />

      {/* 根据选择的动作显示不同的内容 */}
      {selectedAction === "submit" ? (
        <SubmissionList
          contestConfig={contestConfig}
          submissions={submissions}
          loading={submissionsLoading}
          total={submissionTotal}
          currentPage={currentPage}
          pageSize={pageSize}
          schools={submissionFilterOptions.schools}
          participants={submissionFilterOptions.participants}
          languages={submissionFilterOptions.languages}
          statuses={submissionFilterOptions.statuses}
          currentFilters={submissionFilters}
          onPageChange={handleSubmissionPageChange}
          onFilterChange={handleSubmissionFilterChange}
        />
      ) : selectedAction === "stats" ? (
        <StatsPanel 
          contestConfig={contestConfig} 
          selectedGroup={selectedGroup}
          relativeTimeMs={relativeTimeMs}
        />
      ) : selectedAction === "export" ? (
        <ExportPanel onExport={handleExport} onCopy={handleCopy} />
      ) : (
        <div className="detail-scoreboard">
          <InfiniteScroll
            dataLength={visibleRows.length}
            next={loadMoreData}
            hasMore={hasMore}
            loader={
              <div className="loading-more-container">
                <Spin size="small">
                  <div style={{ padding: "10px", textAlign: "center" }}>
                    加载更多...
                  </div>
                </Spin>
              </div>
            }
            endMessage={<div className="end-message">已经到底啦 ~</div>}
            style={{ overflow: "visible" }}
          >
            <ScoreboardTable
              contestConfig={contestConfig}
              rankData={{
                ...rankData!,
                rows: visibleRows,
              }}
              columnWidths={columnWidths}
            />
          </InfiniteScroll>
        </div>
      )}
    </div>
  );
};

export default Contest;
