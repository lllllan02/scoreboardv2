/**
 * ProblemTitle 组件 - 题目标题
 * 用于在排行榜表头显示题目标识（A-Z）和提交次数
 * 支持自定义背景色和文字颜色，用于区分不同题目
 */

import React from "react";
import "../styles/Contest.css";

/**
 * 组件属性接口定义
 * @interface ProblemTitleProps
 * @property {string} problemId - 题目标识（通常是A-Z的字母）
 * @property {number} accept - 提交次数
 * @property {string} [backgroundColor] - 可选的背景颜色，默认为 #1890ff
 * @property {string} [color] - 可选的文字颜色，默认为 white
 */
interface ProblemTitleProps {
  problemId: string;
  accept: number;
  backgroundColor?: string;
  color?: string;
}

/**
 * ProblemTitle 组件实现
 * 渲染一个带有背景色的题目标识和提交次数
 * @param {ProblemTitleProps} props - 组件属性
 */
const ProblemTitle: React.FC<ProblemTitleProps> = ({
  problemId,
  accept,
  backgroundColor = "#1890ff",
  color = "white",
}) => {
  return (
    <div className="problem-title">
      <div className="problem-title-content" style={{ backgroundColor, color }}>
        <div className="problem-id">{problemId}</div>
        <div className="problem-accept">{accept}</div>
      </div>
    </div>
  );
};

export default ProblemTitle;
