package handler

import (
	"bytes"
	"encoding/csv"
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/lllllan02/scoreboardv2/internal/service"
	"github.com/lllllan02/scoreboardv2/pkg/errors"
	"github.com/spf13/cast"
	"github.com/xuri/excelize/v2"
)

// ExportFormat 定义导出格式
type ExportFormat string

const (
	FormatJSON  ExportFormat = "json"
	FormatCSV   ExportFormat = "csv"
	FormatExcel ExportFormat = "excel"
)

// ExportContestRank 导出比赛排名数据
func ExportContestRank(c *gin.Context) {
	// 获取请求参数
	path := c.Param("path")
	t := cast.ToInt(c.Query("t"))
	group := c.Query("group")
	format := ExportFormat(c.Query("format"))

	// 获取排名数据
	rank, err := service.GetContestRank(path, group, t)
	if err != nil {
		errors.SendError(c, err)
		return
	}

	// 获取比赛配置
	config, err := service.GetContestConfig(path)
	if err != nil {
		errors.SendError(c, err)
		return
	}

	// 根据格式导出数据
	switch format {
	case FormatJSON:
		exportJSON(c, rank, config.ContestName)
	case FormatCSV:
		exportCSV(c, rank, config.ContestName)
	case FormatExcel:
		exportExcel(c, rank, config.ContestName)
	default:
		errors.SendError(c, errors.NewBadRequest("不支持的导出格式"))
	}
}

// exportJSON 导出 JSON 格式
func exportJSON(c *gin.Context, rank *service.Rank, contestName string) {
	// 将数据转换为 JSON
	jsonData, err := json.MarshalIndent(rank, "", "  ")
	if err != nil {
		errors.SendError(c, errors.NewInternalError("JSON 转换失败", err))
		return
	}

	// 设置响应头
	filename := fmt.Sprintf("%s-%s.json", contestName, time.Now().Format("20060102150405"))
	c.Header("Content-Type", "application/json")
	c.Header("Content-Disposition", fmt.Sprintf(`attachment; filename*=UTF-8''%s`, url.PathEscape(filename)))
	c.Data(http.StatusOK, "application/json", jsonData)
}

// exportCSV 导出 CSV 格式
func exportCSV(c *gin.Context, rank *service.Rank, contestName string) {
	buf := new(bytes.Buffer)
	// 添加 UTF-8 BOM，以便 Excel 正确识别中文
	buf.WriteString("\xEF\xBB\xBF")
	writer := csv.NewWriter(buf)

	// 写入 CSV 头
	headers := []string{"排名", "学校", "队伍", "解题数", "罚时"}
	for i := 0; i < len(rank.Rows[0].Problems); i++ {
		headers = append(headers, string(rune('A'+i)))
	}
	if err := writer.Write(headers); err != nil {
		errors.SendError(c, errors.NewInternalError("写入 CSV 头失败", err))
		return
	}

	// 写入数据行
	for _, row := range rank.Rows {
		record := []string{
			strconv.Itoa(row.Place),
			row.Organization,
			row.Team,
			strconv.Itoa(row.Solved),
			strconv.Itoa(row.Penalty), // 直接使用原始罚时，与 Excel 保持一致
		}

		// 添加每道题的状态
		for _, problem := range row.Problems {
			status := ""
			if problem.Solved {
				status = fmt.Sprintf("+%d/%d", problem.Submitted, problem.Timestamp)
			} else if problem.Submitted > 0 {
				status = fmt.Sprintf("-%d", problem.Submitted)
			}
			record = append(record, status)
		}

		if err := writer.Write(record); err != nil {
			errors.SendError(c, errors.NewInternalError("写入 CSV 数据失败", err))
			return
		}
	}

	writer.Flush()
	if err := writer.Error(); err != nil {
		errors.SendError(c, errors.NewInternalError("CSV 写入失败", err))
		return
	}

	// 设置响应头
	filename := fmt.Sprintf("%s-%s.csv", contestName, time.Now().Format("20060102150405"))
	c.Header("Content-Type", "text/csv; charset=utf-8")
	c.Header("Content-Disposition", fmt.Sprintf(`attachment; filename*=UTF-8''%s`, url.PathEscape(filename)))
	c.Data(http.StatusOK, "text/csv; charset=utf-8", buf.Bytes())
}

// exportExcel 导出 Excel 格式
func exportExcel(c *gin.Context, rank *service.Rank, contestName string) {
	// 创建新的 Excel 文件
	f := excelize.NewFile()
	defer f.Close()

	// 创建一个工作表
	sheetName := "排名"
	index, err := f.NewSheet(sheetName)
	if err != nil {
		errors.SendError(c, errors.NewInternalError("创建 Excel 工作表失败", err))
		return
	}
	f.SetActiveSheet(index)

	// 设置表头样式
	headerStyle, err := f.NewStyle(&excelize.Style{
		Font: &excelize.Font{
			Bold:   true,
			Size:   12,
			Family: "微软雅黑",
		},
		Fill: excelize.Fill{
			Type:    "pattern",
			Color:   []string{"#C6EFCE"},
			Pattern: 1,
		},
		Alignment: &excelize.Alignment{
			Horizontal: "center",
			Vertical:   "center",
		},
		Border: []excelize.Border{
			{Type: "left", Color: "#000000", Style: 1},
			{Type: "top", Color: "#000000", Style: 1},
			{Type: "right", Color: "#000000", Style: 1},
			{Type: "bottom", Color: "#000000", Style: 1},
		},
	})
	if err != nil {
		errors.SendError(c, errors.NewInternalError("创建 Excel 样式失败", err))
		return
	}

	// 设置单元格样式
	cellStyle, err := f.NewStyle(&excelize.Style{
		Font: &excelize.Font{
			Size:   11,
			Family: "微软雅黑",
		},
		Alignment: &excelize.Alignment{
			Horizontal: "center",
			Vertical:   "center",
		},
		Border: []excelize.Border{
			{Type: "left", Color: "#000000", Style: 1},
			{Type: "top", Color: "#000000", Style: 1},
			{Type: "right", Color: "#000000", Style: 1},
			{Type: "bottom", Color: "#000000", Style: 1},
		},
	})
	if err != nil {
		errors.SendError(c, errors.NewInternalError("创建 Excel 样式失败", err))
		return
	}

	// 写入表头
	headers := []string{"排名", "学校", "队伍", "解题数", "罚时"}
	for i := 0; i < len(rank.Rows[0].Problems); i++ {
		headers = append(headers, string(rune('A'+i)))
	}
	for i, header := range headers {
		cell := fmt.Sprintf("%c%d", rune('A'+i), 1)
		f.SetCellValue(sheetName, cell, header)
		f.SetCellStyle(sheetName, cell, cell, headerStyle)
	}

	// 设置列宽
	f.SetColWidth(sheetName, "A", "A", 8)  // 排名
	f.SetColWidth(sheetName, "B", "B", 30) // 学校
	f.SetColWidth(sheetName, "C", "C", 30) // 队伍
	f.SetColWidth(sheetName, "D", "D", 10) // 解题数
	f.SetColWidth(sheetName, "E", "E", 10) // 罚时
	// 设置题目列的宽度
	lastCol := rune('E' + len(rank.Rows[0].Problems))
	f.SetColWidth(sheetName, "F", string(lastCol), 12)

	// 写入数据行
	for i, row := range rank.Rows {
		rowNum := i + 2 // 从第2行开始写入数据
		// 基本信息
		f.SetCellValue(sheetName, fmt.Sprintf("A%d", rowNum), row.Place)
		f.SetCellValue(sheetName, fmt.Sprintf("B%d", rowNum), row.Organization)
		f.SetCellValue(sheetName, fmt.Sprintf("C%d", rowNum), row.Team)
		f.SetCellValue(sheetName, fmt.Sprintf("D%d", rowNum), row.Solved)
		f.SetCellValue(sheetName, fmt.Sprintf("E%d", rowNum), row.Penalty)

		// 题目状态
		for j, problem := range row.Problems {
			cell := fmt.Sprintf("%c%d", rune('F'+j), rowNum)
			if problem.Solved {
				f.SetCellValue(sheetName, cell, fmt.Sprintf("+%d/%d", problem.Submitted, problem.Timestamp))
			} else if problem.Submitted > 0 {
				f.SetCellValue(sheetName, cell, fmt.Sprintf("-%d", problem.Submitted))
			}
		}

		// 设置整行样式
		for j := 0; j < len(headers); j++ {
			cell := fmt.Sprintf("%c%d", rune('A'+j), rowNum)
			f.SetCellStyle(sheetName, cell, cell, cellStyle)
		}
	}

	// 冻结首行
	f.SetPanes(sheetName, &excelize.Panes{
		Freeze:      true,
		Split:       false,
		XSplit:      0,
		YSplit:      1,
		TopLeftCell: "A2",
		ActivePane:  "bottomLeft",
	})

	// 将文件写入缓冲区
	buffer, err := f.WriteToBuffer()
	if err != nil {
		errors.SendError(c, errors.NewInternalError("生成 Excel 文件失败", err))
		return
	}

	// 设置响应头
	filename := fmt.Sprintf("%s-%s.xlsx", contestName, time.Now().Format("20060102150405"))
	c.Header("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
	c.Header("Content-Disposition", fmt.Sprintf(`attachment; filename*=UTF-8''%s`, url.PathEscape(filename)))
	c.Data(http.StatusOK, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", buffer.Bytes())
}
