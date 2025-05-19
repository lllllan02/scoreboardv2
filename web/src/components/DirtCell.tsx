/**
 * DirtCell 组件 - 脏数据单元格
 * 用于在排行榜中显示每个队伍的脏数据百分比
 * 脏数据值范围为 0-1，组件会将其转换为百分比显示
 */

import React from "react";
import "../styles/Contest.css";

/**
 * 组件属性接口定义
 * @interface DirtCellProps
 * @property {number} dirtValue - 脏数据值（0-1之间的小数）
 */
interface DirtCellProps {
  dirtValue: number;
}

/**
 * DirtCell 组件实现
 * 将脏数据值转换为百分比并显示
 * @param {DirtCellProps} props - 组件属性
 */
const DirtCell: React.FC<DirtCellProps> = ({ dirtValue }) => {
  // 将小数转换为百分比并四舍五入
  const dirtPercent = Math.round(dirtValue * 100);
  return `${dirtPercent}%`;
};

export default DirtCell;
