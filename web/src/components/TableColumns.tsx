/**
 * TableColumns 自定义Hook - 排行榜表格列配置
 * 用于生成排行榜表格的列配置，包括基础信息列、题目状态列和统计列
 * 支持动态配置题目数量和气球颜色
 */

import type { ColumnsType } from "antd/es/table";
import { ContestConfig } from "../types/contest";
import { Row, Rank } from "../types/rank";
import { getContrastColor } from "../utils/colorUtils";
import SchoolCell from "./SchoolCell";
import TeamCell from "./TeamCell";
import ProblemCell from "./ProblemCell";
import ProblemTitle from "./ProblemTitle";
import DirtTitle from "./DirtTitle";
import DirtCell from "./DirtCell";
import "../styles/Contest.css";

/**
 * Hook属性接口定义
 * @interface TableColumnsProps
 * @property {ContestConfig} contestConfig - 比赛配置信息
 * @property {Rank} rankData - 排名数据
 * @property {{ schoolWidth: number; teamWidth: number } | null} [columnWidths] - 可选的列宽配置
 */
interface TableColumnsProps {
  contestConfig: ContestConfig;
  rankData: Rank;
  columnWidths?: { schoolWidth: number; teamWidth: number } | null;
}

/**
 * 生成表格列配置的自定义Hook
 * @param {TableColumnsProps} props - Hook属性
 * @returns {ColumnsType<Row>} 返回antd Table组件的列配置数组
 */
const useTableColumns = ({
  contestConfig,
  rankData,
  columnWidths,
}: TableColumnsProps): ColumnsType<Row> => {
  if (!contestConfig || !rankData) return [];

  // 题目列的固定宽度设置
  const fixedProblemWidth = 45;

  /**
   * 基础列配置
   * 包括排名、学校、队伍名称、解题数和罚时
   */
  const columns: ColumnsType<Row> = [
    // 排名列
    {
      title: "Place",
      dataIndex: "place",
      key: "place",
      width: 55,
      className: "place-column",
    },
    // 学校列
    {
      title: "School",
      dataIndex: "organization",
      key: "organization",
      width: columnWidths?.schoolWidth || 150,
      render: (text: string, record: Row) => (
        <SchoolCell text={text} orgPlace={record.org_place} />
      ),
    },
    // 队伍名称列
    {
      title: "Team",
      dataIndex: "team",
      key: "team",
      width: columnWidths?.teamWidth || 140,
      render: (text: string, record: Row) => (
        <TeamCell 
          teamName={text} 
          isGirlTeam={record.girl} 
          isUnofficial={record.unofficial}
        />
      ),
    },
    // 解题数列
    {
      title: "Solved",
      dataIndex: "solved",
      key: "solved",
      width: 65,
    },
    // 罚时列
    {
      title: "Penalty",
      dataIndex: "penalty",
      key: "penalty",
      width: 70,
    },
  ];

  /**
   * 动态添加题目列
   * 根据比赛配置中的题目数量，生成对应数量的题目列
   * 每列包含题目标识（A-Z）和提交状态
   */
  if (contestConfig.problem_quantity && contestConfig.problem_id) {
    for (let i = 0; i < contestConfig.problem_quantity; i++) {
      // 使用字母A-Z标识题目
      const problemId = String.fromCharCode(65 + i);

      // 配置气球默认颜色
      let backgroundColor = "#1890ff";
      let color = "white";

      // 如果有气球颜色配置，使用配置的颜色
      if (contestConfig.balloon_color && contestConfig.balloon_color[i]) {
        const balloon = contestConfig.balloon_color[i];
        if (balloon.background_color) {
          backgroundColor = balloon.background_color;
          // 根据背景色自动计算对比度良好的文字颜色
          color = getContrastColor(balloon.background_color);
        }
      }

      columns.push({
        title: () => (
          <ProblemTitle
            problemId={problemId}
            accept={rankData.accepted[i]}
            backgroundColor={backgroundColor}
            color={color}
          />
        ),
        key: `problem-${i}`,
        width: fixedProblemWidth,
        className: `problem-column`,
        render: (record: Row) => {
          // 检查problems数组是否存在且长度足够
          if (!record.problems || record.problems.length <= i) {
            return <ProblemCell />;
          }
          return <ProblemCell problem={record.problems[i]} />;
        },
      });
    }
  }

  /**
   * 添加统计列（脏数据列）
   * 用于显示每个队伍的额外统计信息
   */
  columns.push({
    title: () => <DirtTitle />,
    key: "dirt",
    width: 45,
    className: "problem-column",
    render: (record: Row) => <DirtCell dirtValue={record.dirty} />,
  });

  return columns;
};

export default useTableColumns;
