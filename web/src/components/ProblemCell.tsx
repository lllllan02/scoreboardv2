/**
 * ProblemCell 组件 - 题目状态单元格
 * 用于在排行榜中展示单个题目的提交状态
 * 包括已解决、尝试未解决、等待评判和封榜等多种状态的显示
 */

import React from "react";
import { Problem } from "../types/rank";
import "../styles/Contest.css";

/**
 * 组件属性接口定义
 * @interface ProblemCellProps
 * @property {Problem} [problem] - 可选的题目信息对象
 */
interface ProblemCellProps {
  problem?: Problem;
}

/**
 * ProblemCell 组件实现
 * 根据题目状态显示不同的样式和内容
 * @param {ProblemCellProps} props - 组件属性
 */
const ProblemCell: React.FC<ProblemCellProps> = ({ problem }) => {
  // 如果问题不存在，返回空单元格
  if (!problem) {
    return <div className="problem-cell"></div>;
  }

  // 准备显示内容：符号和时间信息
  let symbol = "";
  // 时间信息格式：提交次数/时间戳
  let timeInfo =
    problem.submitted > 0 ? `${problem.submitted}/${problem.timestamp}` : "";

  if (problem.solved) {
    // 已解决状态：显示加号，如果是首个解出还会有特殊样式
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
    // 尝试未解决状态：显示减号
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
    // 等待评判或封榜状态：显示问号
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

  // 未提交状态：返回空白单元格
  return <div className="problem-cell"></div>;
};

export default ProblemCell;
