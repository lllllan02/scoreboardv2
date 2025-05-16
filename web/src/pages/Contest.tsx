import React, {
  useEffect,
  useState,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { useLocation, Link } from "react-router-dom";
import { getContestConfig } from "../api/contestApi";
import { getContestRank } from "../api/rankApi";
import { ContestConfig } from "../types/contest";
import { Rank, Row, Problem } from "../types/rank";
import { Spin, Tooltip, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { CloseCircleOutlined, HomeOutlined } from "@ant-design/icons";
import "../styles/Contest.css";
import { formatTime, formatDuration } from "../utils/timeUtils";
import { getContrastColor } from "../utils/colorUtils";

const Contest: React.FC = () => {
  // 状态管理
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [contestConfig, setContestConfig] = useState<ContestConfig | null>(
    null
  );
  const [rankData, setRankData] = useState<Rank | null>(null);
  const [sliderPosition, setSliderPosition] = useState(100); // 滑块位置，百分比

  // 引用DOM元素
  const progressBarRef = useRef<HTMLDivElement>(null);

  // 使用 useLocation 获取完整路径
  const location = useLocation();

  // 获取有效路径
  const apiPath = location.pathname;

  // 处理鼠标移动
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!progressBarRef.current) return;

    const rect = progressBarRef.current.getBoundingClientRect();
    let percentage = ((e.clientX - rect.left) / rect.width) * 100;
    percentage = Math.max(0, Math.min(100, percentage)); // 确保在0-100之间

    setSliderPosition(percentage);
  }, []);

  // 处理触摸移动
  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!progressBarRef.current) return;

    const rect = progressBarRef.current.getBoundingClientRect();
    let percentage = ((e.touches[0].clientX - rect.left) / rect.width) * 100;
    percentage = Math.max(0, Math.min(100, percentage)); // 确保在0-100之间

    setSliderPosition(percentage);
  }, []);

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

    // 组件卸载时清理事件监听器
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", endDrag);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", endDrag);
    };
  }, [apiPath, handleMouseMove, handleTouchMove, endDrag]);

  // 获取状态标签 - 对于历史比赛，固定显示已完成
  const getStatusBadge = () => {
    return (
      <span className="detail-custom-status">
        <span className="detail-status-dot"></span>
        <span className="detail-status-text">FINISHED</span>
      </span>
    );
  };

  const [bannerError, setBannerError] = useState(false);

  // 处理banner路径
  const bannerPath = useMemo(() => {
    // 检查路径是否存在
    if (!contestConfig?.banner?.path) return null;

    const path = contestConfig.banner.path;

    // 如果是完整URL，直接返回
    if (path.startsWith("http://") || path.startsWith("https://")) {
      return path;
    }

    // 如果是相对路径，添加前缀
    // 注意：这里的路径前缀需要根据实际情况调整
    if (path.startsWith("/")) {
      return path; // 已经是以/开头的绝对路径
    }

    // 其他情况，添加/前缀
    return `/${path}`;
  }, [contestConfig]);

  // 渲染题目单元格
  const renderProblemCell = (problem: Problem | undefined) => {
    // 如果问题不存在，返回空单元格
    if (!problem) {
      return <div className="problem-cell"></div>;
    }

    // 准备显示内容
    let symbol = "";
    let timeInfo =
      problem.timestamp > 0 ? `${problem.submitted}/${problem.timestamp}` : "";

    if (problem.solved) {
      // 已解决，添加加号标记
      symbol = "+";

      return (
        <div className="problem-cell">
          <div
            className={`content-solved ${
              problem.first_solved ? "content-first-to-solve" : ""
            }`}
          >
            <div className="cell-content">
              <div className="content-top">{symbol}</div>
              {timeInfo && <div className="content-bottom">{timeInfo}</div>}
            </div>
          </div>
        </div>
      );
    } else if (problem.attempted) {
      // 尝试但未解决，添加减号标记
      symbol = "-";

      return (
        <div className="problem-cell">
          <div className="content-attempted">
            <div className="cell-content">
              <div className="content-top">{symbol}</div>
              {timeInfo && <div className="content-bottom">{timeInfo}</div>}
            </div>
          </div>
        </div>
      );
    } else if (problem.pending || problem.frozen) {
      // 等待评判或处于冻结状态，显示问号
      symbol = "?";

      return (
        <div className="problem-cell">
          <div className="content-pending">
            <div className="cell-content">
              <div className="content-top">{symbol}</div>
              {timeInfo && <div className="content-bottom">{timeInfo}</div>}
            </div>
          </div>
        </div>
      );
    }

    // 没有提交，返回空白单元格
    return <div className="problem-cell"></div>;
  };

  // 构建表格列
  const getColumns = (): ColumnsType<Row> => {
    if (!contestConfig || !rankData) return [];

    const columns: ColumnsType<Row> = [
      {
        title: "Place",
        dataIndex: "place",
        key: "place",
        width: 55,
        className: "place-column",
      },
      {
        title: "School",
        dataIndex: "organization",
        key: "organization",
        width: 150,
        render: (text: string, record: Row) => (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              position: "relative",
              width: "100%",
              overflow: "hidden",
            }}
          >
            {record.org_place > 0 && (
              <div
                style={{
                  fontSize: "12px",
                  color: "#000",
                  position: "absolute",
                  left: "8px",
                  minWidth: "20px",
                }}
              >
                {record.org_place}
              </div>
            )}
            <div 
              style={{ 
                width: "100%", 
                textAlign: "center", 
                paddingLeft: record.org_place > 0 ? "25px" : "0",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap"
              }}
              title={text}
            >
              {text}
            </div>
          </div>
        ),
      },
      {
        title: "Team",
        dataIndex: "team",
        key: "team",
        width: 140,
      },
      {
        title: "Solved",
        dataIndex: "solved",
        key: "solved",
        width: 65,
      },
      {
        title: "Penalty",
        dataIndex: "penalty",
        key: "penalty",
        width: 70,
      },
    ];

    // 使用精确的固定宽度而不是相对单位
    const fixedProblemWidth = 45; // 增加宽度

    if (contestConfig.problem_quantity && contestConfig.problem_id) {
      for (let i = 0; i < contestConfig.problem_quantity; i++) {
        // 使用字母A-Z标识题目，与图片保持一致
        const problemId = String.fromCharCode(65 + i);

        // 获取气球颜色设置
        const balloonStyle: React.CSSProperties = {};
        if (contestConfig.balloon_color && contestConfig.balloon_color[i]) {
          const balloon = contestConfig.balloon_color[i];
          if (balloon.background_color) {
            balloonStyle.backgroundColor = balloon.background_color;
            // 根据背景颜色亮度自动设置文字颜色
            balloonStyle.color = getContrastColor(balloon.background_color);
          }
        } else {
          // 默认颜色
          balloonStyle.backgroundColor = "#1890ff";
          balloonStyle.color = "white";
        }

        columns.push({
          title: () => (
            <div
              className="problem-title"
              style={{
                ...balloonStyle,
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "4px 0",
                fontSize: "14px", // 增加字体大小
              }}
            >
              {problemId}
            </div>
          ),
          key: `problem-${i}`,
          width: fixedProblemWidth,
          className: `problem-column`,
          render: (record: Row) => {
            // 检查problems数组是否存在且长度足够
            if (!record.problems || record.problems.length <= i) {
              return <div className="problem-cell"></div>;
            }
            return renderProblemCell(record.problems[i]);
          },
        });
      }
    }

    // 添加统计列
    columns.push({
      title: () => (
        <div
          className="problem-title"
          style={{
            backgroundColor: "#f0ead2", // 使用与基础列相同的浅黄色背景
            color: "#000",
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "4px 0",
            fontSize: "14px", // 增加字体大小
          }}
        >
          Dirt
        </div>
      ),
      key: "dirt",
      width: 45, // 增加宽度
      className: "problem-column",
      render: (record: Row) => {
        const dirtPercent = Math.round(record.dirty * 100);
        return `${dirtPercent}%`;
      },
    });

    return columns;
  };

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
      {/* 返回首页按钮 */}
      <Link to="/" className="detail-home-button">
        <HomeOutlined />
        <span>返回首页</span>
      </Link>

      {/* 显示比赛横幅 */}
      {bannerPath && !bannerError && (
        <img
          src={bannerPath}
          alt={`${contestConfig.contest_name} 横幅`}
          className="detail-contest-banner"
          onError={() => {
            setBannerError(true);
          }}
        />
      )}

      {/* 标题居中，增加下方间距 */}
      <h1 className="detail-contest-title">{contestConfig.contest_name}</h1>

      {/* 进度条和时间信息区域，使用统一容器 */}
      <div className="detail-time-container">
        {/* 时间信息 - 更加对齐 */}
        <div className="detail-time-info">
          <div>开始时间: {formatTime(contestConfig.start_time)}</div>
          <div>{getStatusBadge()}</div>
          <div>结束时间: {formatTime(contestConfig.end_time)}</div>
        </div>

        {/* 进度条 - 增加高度并添加条纹效果，加入滑块 */}
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

        {/* 持续时间和图例 - 更精确地对齐，贴近进度条 */}
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
              <div className="detail-legend-item detail-honorable">
                Honorable
              </div>
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
      </div>

      {/* 榜单内容 */}
      <div className="detail-scoreboard">
        <Table
          dataSource={rankData?.rows || []}
          columns={getColumns()}
          rowKey="team_id"
          pagination={false}
          bordered={false}
          size="small"
          className="detail-scoreboard-table"
          tableLayout="fixed"
          style={{ width: "auto", tableLayout: "fixed" }}
          scroll={{ x: true }}
          rowClassName={() => "compact-row"}
        />
      </div>
    </div>
  );
};

export default Contest;
