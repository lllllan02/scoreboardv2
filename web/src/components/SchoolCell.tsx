/**
 * SchoolCell 组件 - 学校信息单元格
 * 用于在排行榜中展示学校名称和学校排名
 * 支持显示/隐藏学校排名，并根据是否有排名自动调整样式
 */

import React from "react";
import "../styles/Contest.css";

/**
 * 组件属性接口定义
 * @interface SchoolCellProps
 * @property {string} text - 学校名称
 * @property {number} orgPlace - 学校排名，0表示不显示排名
 */
interface SchoolCellProps {
  text: string;
  orgPlace: number;
}

/**
 * SchoolCell 组件实现
 * @param {SchoolCellProps} props - 组件属性
 */
const SchoolCell: React.FC<SchoolCellProps> = ({ text, orgPlace }) => {
  return (
    <div className="school-column-container">
      {/* 当学校有排名时显示排名数字 */}
      {orgPlace > 0 && <div className="school-org-place">{orgPlace}</div>}
      {/* 学校名称，根据是否有排名添加不同的内边距样式 */}
      <div
        className={`school-name ${
          orgPlace > 0
            ? "school-name-with-padding"
            : "school-name-without-padding"
        }`}
        title={text} // 添加title属性以支持鼠标悬停显示完整名称
      >
        {text}
      </div>
    </div>
  );
};

export default SchoolCell;
