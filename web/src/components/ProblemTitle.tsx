/**
 * ProblemTitle 组件 - 题目标题
 * 用于在排行榜表头显示题目标识（A-Z）
 * 支持自定义背景色和文字颜色，用于区分不同题目
 */

import React from "react";
import "../styles/Contest.css";

/**
 * 组件属性接口定义
 * @interface ProblemTitleProps
 * @property {string} problemId - 题目标识（通常是A-Z的字母）
 * @property {string} [backgroundColor] - 可选的背景颜色，默认为 #1890ff
 * @property {string} [color] - 可选的文字颜色，默认为 white
 */
interface ProblemTitleProps {
  problemId: string;
  backgroundColor?: string;
  color?: string;
}

/**
 * ProblemTitle 组件实现
 * 渲染一个带有背景色的题目标识
 * @param {ProblemTitleProps} props - 组件属性
 */
const ProblemTitle: React.FC<ProblemTitleProps> = ({
  problemId,
  backgroundColor = "#1890ff",
  color = "white",
}) => {
  return (
    <div
      className="problem-title problem-title-content"
      style={{ backgroundColor, color }}
    >
      {problemId}
    </div>
  );
};

export default ProblemTitle;
