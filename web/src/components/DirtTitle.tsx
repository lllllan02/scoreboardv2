/**
 * DirtTitle 组件 - 脏数据列标题
 * 用于在排行榜表头显示脏数据列的标题
 * 脏数据用于表示队伍提交中的异常或特殊情况的比例
 */

import React from "react";
import "../styles/Contest.css";

/**
 * DirtTitle 组件实现
 * 渲染固定的 "Dirt" 标题文本
 */
const DirtTitle: React.FC = () => {
  return <div className="problem-title dirt-column-title">Dirt</div>;
};

export default DirtTitle;
