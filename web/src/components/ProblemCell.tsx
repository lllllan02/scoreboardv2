import React from "react";
import { Problem } from "../types/rank";
import "../styles/Contest.css";

interface ProblemCellProps {
  problem?: Problem;
}

const ProblemCell: React.FC<ProblemCellProps> = ({ problem }) => {
  // 如果问题不存在，返回空单元格
  if (!problem) {
    return <div className="problem-cell"></div>;
  }

  // 准备显示内容
  let symbol = "";
  let timeInfo =
    problem.submitted > 0 ? `${problem.submitted}/${problem.timestamp}` : "";

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

export default ProblemCell;
