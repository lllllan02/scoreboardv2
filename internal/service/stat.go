package service

import (
	"sort"

	"github.com/lllllan02/scoreboardv2/internal/model"
)

const (
	StatusAccepted = "accepted"
	StatusRejected = "rejected"

	// 热力图时间段数量
	TimeSlotCount = 50 // 将比赛时间划分为50个时间段
)

// HeatmapItem 表示一个时间点的提交情况
type HeatmapItem struct {
	Timestamp int    `json:"timestamp"` // 时间戳（相对时间，毫秒）
	Status    string `json:"status"`    // 提交状态：accepted/rejected
	Count     int    `json:"count"`     // 提交次数
}

// ProblemHeatmap 表示一个题目的提交热力图
type ProblemHeatmap struct {
	ProblemID   string        `json:"problem_id"`  // 题目ID (A, B, C...)
	Submissions []HeatmapItem `json:"submissions"` // 提交记录
}

// ContestHeatmap 表示整个比赛的提交热力图
type ContestHeatmap struct {
	Total    ProblemHeatmap   `json:"total"`    // 总体提交热力图
	Problems []ProblemHeatmap `json:"problems"` // 每个题目的提交热力图
}

// ContestStat 比赛统计数据
type ContestStat struct {
	// 题目数量
	ProblemCount int `json:"problem_count"`
	// 队伍数量
	TeamCount int `json:"team_count"`
	// 提交数量
	RunCount int `json:"run_count"`
	// 通过数量
	AcceptedCount int `json:"accepted_count"`
	// 不通过数量
	RejectedCount int `json:"rejected_count"`
	// 通过率
	AcceptedRate float64 `json:"accepted_rate"`
	// 比赛提交热力图
	ContestHeatmap ContestHeatmap `json:"contest_heatmap"`
}

// GetContestStat 返回比赛统计数据
func GetContestStat(path string, group string, t int) (result *ContestStat, err error) {
	// 加载比赛配置
	config, err := loadConfig(path)
	if err != nil {
		return nil, err
	}

	// 初始化统计数据
	result = &ContestStat{
		ProblemCount: config.ProblemQuantity,
		ContestHeatmap: ContestHeatmap{
			Problems: make([]ProblemHeatmap, config.ProblemQuantity),
		},
	}

	// 初始化每个题目的热力图
	for i := 0; i < config.ProblemQuantity; i++ {
		result.ContestHeatmap.Problems[i] = ProblemHeatmap{
			ProblemID:   string(rune('A' + i)),
			Submissions: make([]HeatmapItem, 0),
		}
	}

	// 加载队伍列表
	teamList, err := loadTeam(path)
	if err != nil {
		return nil, err
	}
	teams := make(map[string]model.Team)
	for _, team := range teamList {
		if groupFilter(team, group) {
			result.TeamCount++
			teams[string(team.TeamId)] = team
		}
	}

	// 加载提交列表
	runList, err := loadRun(path)
	if err != nil {
		return nil, err
	}

	// 计算时间段长度
	timeSlotDuration := t / TimeSlotCount // 每个时间段的长度（毫秒）
	if timeSlotDuration < 1 {
		timeSlotDuration = 1 // 确保至少为1毫秒
	}

	// 创建时间段到提交次数的映射
	totalSubmissions := make(map[int]map[string]int)
	problemSubmissions := make([]map[int]map[string]int, config.ProblemQuantity)

	// 初始化提交统计映射
	for i := 0; i < config.ProblemQuantity; i++ {
		problemSubmissions[i] = make(map[int]map[string]int)
	}

	// 统计提交数据
	for _, run := range runList {
		// 检查提交时间是否在比赛时间内
		if run.Timestamp > t {
			continue
		}

		// 检查队伍是否在队伍列表中
		if _, ok := teams[string(run.TeamId)]; !ok {
			continue
		}

		result.RunCount++

		// 计算时间段
		timeSlot := (run.Timestamp / timeSlotDuration) * timeSlotDuration

		// 更新总体提交统计
		if totalSubmissions[timeSlot] == nil {
			totalSubmissions[timeSlot] = make(map[string]int)
		}

		status := StatusRejected
		if run.Status == "ACCEPTED" {
			status = StatusAccepted
			result.AcceptedCount++
		} else {
			result.RejectedCount++
		}
		totalSubmissions[timeSlot][status]++

		// 更新题目提交统计
		if problemSubmissions[run.ProblemId][timeSlot] == nil {
			problemSubmissions[run.ProblemId][timeSlot] = make(map[string]int)
		}
		problemSubmissions[run.ProblemId][timeSlot][status]++
	}

	// 生成总体热力图数据
	totalHeatmap := make([]HeatmapItem, 0)
	for slot := 0; slot < TimeSlotCount; slot++ {
		timeSlot := slot * timeSlotDuration
		acceptedCount := 0
		rejectedCount := 0

		if counts, ok := totalSubmissions[timeSlot]; ok {
			acceptedCount = counts[StatusAccepted]
			rejectedCount = counts[StatusRejected]
		}

		totalHeatmap = append(totalHeatmap, HeatmapItem{
			Timestamp: timeSlot,
			Status:    StatusAccepted,
			Count:     acceptedCount,
		})
		totalHeatmap = append(totalHeatmap, HeatmapItem{
			Timestamp: timeSlot,
			Status:    StatusRejected,
			Count:     rejectedCount,
		})
	}

	// 按时间戳排序
	sort.Slice(totalHeatmap, func(i, j int) bool {
		return totalHeatmap[i].Timestamp < totalHeatmap[j].Timestamp
	})

	result.ContestHeatmap.Total = ProblemHeatmap{
		ProblemID:   "total",
		Submissions: totalHeatmap,
	}

	// 生成每个题目的热力图数据
	for problemId := 0; problemId < config.ProblemQuantity; problemId++ {
		submissions := make([]HeatmapItem, 0)

		for slot := 0; slot < TimeSlotCount; slot++ {
			timeSlot := slot * timeSlotDuration
			acceptedCount := 0
			rejectedCount := 0

			if counts, ok := problemSubmissions[problemId][timeSlot]; ok {
				acceptedCount = counts[StatusAccepted]
				rejectedCount = counts[StatusRejected]
			}

			submissions = append(submissions, HeatmapItem{
				Timestamp: timeSlot,
				Status:    StatusAccepted,
				Count:     acceptedCount,
			})
			submissions = append(submissions, HeatmapItem{
				Timestamp: timeSlot,
				Status:    StatusRejected,
				Count:     rejectedCount,
			})
		}

		// 按时间戳排序
		sort.Slice(submissions, func(i, j int) bool {
			return submissions[i].Timestamp < submissions[j].Timestamp
		})

		result.ContestHeatmap.Problems[problemId].Submissions = submissions
	}

	// 计算通过率
	if result.RunCount > 0 {
		result.AcceptedRate = float64(result.AcceptedCount) / float64(result.RunCount)
	}

	return result, nil
}
