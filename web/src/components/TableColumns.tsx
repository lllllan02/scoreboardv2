import type { ColumnsType } from "antd/es/table";
import { ContestConfig } from "../types/contest";
import { Row, Rank } from "../types/rank";
import { getContrastColor } from "../utils/colorUtils";
import SchoolCell from "./SchoolCell";
import ProblemCell from "./ProblemCell";
import ProblemTitle from "./ProblemTitle";
import DirtTitle from "./DirtTitle";
import DirtCell from "./DirtCell";
import "../styles/Contest.css";

interface TableColumnsProps {
  contestConfig: ContestConfig;
  rankData: Rank;
}

const useTableColumns = ({
  contestConfig,
  rankData,
}: TableColumnsProps): ColumnsType<Row> => {
  if (!contestConfig || !rankData) return [];

  // 基础列
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
        <SchoolCell text={text} orgPlace={record.org_place} />
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
  const fixedProblemWidth = 45;

  // 添加题目列
  if (contestConfig.problem_quantity && contestConfig.problem_id) {
    for (let i = 0; i < contestConfig.problem_quantity; i++) {
      // 使用字母A-Z标识题目
      const problemId = String.fromCharCode(65 + i);

      // 获取气球颜色设置
      let backgroundColor = "#1890ff";
      let color = "white";

      if (contestConfig.balloon_color && contestConfig.balloon_color[i]) {
        const balloon = contestConfig.balloon_color[i];
        if (balloon.background_color) {
          backgroundColor = balloon.background_color;
          color = getContrastColor(balloon.background_color);
        }
      }

      columns.push({
        title: () => (
          <ProblemTitle
            problemId={problemId}
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

  // 添加统计列
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
