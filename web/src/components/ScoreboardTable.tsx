/**
 * ScoreboardTable 组件 - 比赛排行榜表格
 * 负责展示比赛的完整排名数据，包括队伍信息、解题情况和得分等
 */

import React from "react";
import { Table } from "antd";
import { ContestConfig } from "../types/contest";
import { Rank } from "../types/rank";
import useTableColumns from "./TableColumns";
import "../styles/Contest.css";

/**
 * 组件属性接口定义
 * @interface ScoreboardTableProps
 * @property {ContestConfig} contestConfig - 比赛配置信息
 * @property {Rank} rankData - 排名数据
 * @property {boolean} [loading] - 可选的加载状态
 * @property {{ schoolWidth: number; teamWidth: number } | null} [columnWidths] - 可选的列宽配置
 */
interface ScoreboardTableProps {
  contestConfig: ContestConfig;
  rankData: Rank;
  loading?: boolean;
  columnWidths?: { schoolWidth: number; teamWidth: number } | null;
}

/**
 * ScoreboardTable 组件实现
 * 使用 antd 的 Table 组件展示排行榜数据
 * @param {ScoreboardTableProps} props - 组件属性
 */
const ScoreboardTable: React.FC<ScoreboardTableProps> = ({
  contestConfig,
  rankData,
  columnWidths
}) => {
  // 获取表格列配置
  const columns = useTableColumns({ contestConfig, rankData, columnWidths });

  return (
    <div className="detail-scoreboard">
      <Table
        dataSource={rankData?.rows || []}
        columns={columns}
        rowKey="team_id"
        pagination={false}
        bordered={false}
        size="small"
        className="detail-scoreboard-table detail-scoreboard-table-fixed"
        tableLayout="fixed"
        scroll={{ x: true }}
        rowClassName={() => "compact-row"}
      />
    </div>
  );
};

export default ScoreboardTable;
