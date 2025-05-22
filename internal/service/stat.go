package service

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

	// 提交热力图
	RunHeatmap RunHeatmap `json:"run_heatmap"`
	// 题目提交热力图
	ProblemRunHeatmap []*RunHeatmap `json:"problem_run_heatmap"`
	// 题目提交数量
	ProblemRunCount []int `json:"problem_run_count"`
	// 题目通过数量
	ProblemAcceptedCount []int `json:"problem_accepted_count"`
	// 题目不通过数量
	ProblemRejectedCount []int `json:"problem_rejected_count"`
	// 通过题数队伍统计
	AcceptedTeamCount []int `json:"accepted_team_count"`
}

type RunHeatmap struct {
	Accepted []*RunHeatmapItem `json:"accepted"`
	Rejected []*RunHeatmapItem `json:"rejected"`
}

type RunHeatmapItem struct {
	Timestamp int `json:"timestamp"` // 时间戳
	Count     int `json:"count"`     // 数量
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
		ProblemCount:         config.ProblemQuantity,
		ProblemRunHeatmap:    make([]*RunHeatmap, config.ProblemQuantity),
		ProblemRunCount:      make([]int, config.ProblemQuantity), // 初始化题目提交数量数组
		ProblemAcceptedCount: make([]int, config.ProblemQuantity),
		ProblemRejectedCount: make([]int, config.ProblemQuantity),
		AcceptedTeamCount:    make([]int, config.ProblemQuantity+1),
		RunHeatmap:           RunHeatmap{}, // 初始化总体热力图
	}

	// 初始化每个题目的热力图
	for i := 0; i < config.ProblemQuantity; i++ {
		result.ProblemRunHeatmap[i] = &RunHeatmap{
			Accepted: make([]*RunHeatmapItem, 0),
			Rejected: make([]*RunHeatmapItem, 0),
		}
	}

	// 加载队伍列表
	teamList, err := loadTeam(path)
	if err != nil {
		return nil, err
	}
	for _, team := range teamList {
		if groupFilter(team, group) {
			result.TeamCount++
		}
	}

	// 加载提交列表
	runList, err := loadRun(path)
	if err != nil {
		return nil, err
	}

	teamAccepted := make(map[string]map[int]bool)

	// 创建时间戳到提交次数的映射
	totalAcceptedMap := make(map[int]int)
	totalRejectedMap := make(map[int]int)
	problemAcceptedMap := make([]map[int]int, config.ProblemQuantity)
	problemRejectedMap := make([]map[int]int, config.ProblemQuantity)

	for i := 0; i < config.ProblemQuantity; i++ {
		problemAcceptedMap[i] = make(map[int]int)
		problemRejectedMap[i] = make(map[int]int)
	}

	for _, run := range runList {
		if run.Timestamp > t {
			continue
		}

		result.RunCount++
		result.ProblemRunCount[run.ProblemId]++

		// 更新热力图数据
		if run.Status == "ACCEPTED" {
			result.AcceptedCount++
			result.ProblemAcceptedCount[run.ProblemId]++
			totalAcceptedMap[run.Timestamp]++
			problemAcceptedMap[run.ProblemId][run.Timestamp]++

			teamid := string(run.TeamId)
			if _, ok := teamAccepted[teamid]; !ok {
				teamAccepted[teamid] = make(map[int]bool)
			}
			teamAccepted[teamid][run.ProblemId] = true
		} else {
			result.RejectedCount++
			result.ProblemRejectedCount[run.ProblemId]++
			totalRejectedMap[run.Timestamp]++
			problemRejectedMap[run.ProblemId][run.Timestamp]++
		}
	}

	// 构建总体热力图
	for timestamp, count := range totalAcceptedMap {
		result.RunHeatmap.Accepted = append(result.RunHeatmap.Accepted, &RunHeatmapItem{
			Timestamp: timestamp,
			Count:     count,
		})
	}
	for timestamp, count := range totalRejectedMap {
		result.RunHeatmap.Rejected = append(result.RunHeatmap.Rejected, &RunHeatmapItem{
			Timestamp: timestamp,
			Count:     count,
		})
	}

	// 构建每个题目的热力图
	for i := 0; i < config.ProblemQuantity; i++ {
		for timestamp, count := range problemAcceptedMap[i] {
			result.ProblemRunHeatmap[i].Accepted = append(result.ProblemRunHeatmap[i].Accepted, &RunHeatmapItem{
				Timestamp: timestamp,
				Count:     count,
			})
		}
		for timestamp, count := range problemRejectedMap[i] {
			result.ProblemRunHeatmap[i].Rejected = append(result.ProblemRunHeatmap[i].Rejected, &RunHeatmapItem{
				Timestamp: timestamp,
				Count:     count,
			})
		}
	}

	if result.RunCount > 0 {
		result.AcceptedRate = float64(result.AcceptedCount) / float64(result.RunCount)
	}
	result.AcceptedTeamCount[0] = result.TeamCount
	for _, team := range teamAccepted {
		result.AcceptedTeamCount[0]--
		result.AcceptedTeamCount[len(team)]++
	}

	return result, nil
}
