package service

type TeamTrend struct {
	Place int `json:"place"` // 排名
	Time  int `json:"time"`  // 相对时间(ms)
}

func GetTeamTrend(path string, teamId string) ([]*TeamTrend, error) {
	// 获取队伍信息
	teamList, err := loadTeam(path)
	if err != nil {
		return nil, err
	}

	// 获取提交记录
	runList, err := loadRun(path)
	if err != nil {
		return nil, err
	}

	// 初始化所有队伍的状态
	type TeamState struct {
		solved  int // 解决题目数
		penalty int // 罚时
	}
	teamStates := make(map[string]*TeamState)
	problemStates := make(map[string]map[int]bool) // teamId -> problemId -> solved

	// 初始化每个队伍的状态
	for id := range teamList {
		teamStates[string(id)] = &TeamState{}
		problemStates[string(id)] = make(map[int]bool)
	}

	// 用于存储排名变化的结果
	var trends []*TeamTrend
	// 添加初始排名
	trends = append(trends, &TeamTrend{
		Place: 1,
		Time:  0,
	})

	// 遍历每个提交记录
	for _, run := range runList {
		curTeamId := string(run.TeamId)
		problemId := run.ProblemId

		// 如果题目已经解决，跳过
		if problemStates[curTeamId][problemId] {
			continue
		}

		// 如果是编译错误，跳过
		if run.Status == "COMPILATION_ERROR" {
			continue
		}

		state, ok := teamStates[curTeamId]
		if !ok {
			continue
		}

		if run.Status == "ACCEPTED" {
			// 更新队伍状态
			state.solved++
			state.penalty += run.Timestamp / 1000 / 60 // 转换为分钟
			problemStates[curTeamId][problemId] = true
		} else {
			// 错误提交加罚时
			state.penalty += 20
		}

		// 计算当前队伍的排名
		place := 1
		targetState, ok := teamStates[teamId]
		if !ok {
			continue
		}

		for tid, s := range teamStates {
			if tid == teamId {
				continue
			}
			// 排名规则：解题数量多的排前面，罚时少的排前面
			if s.solved > targetState.solved ||
				(s.solved == targetState.solved && s.penalty < targetState.penalty) {
				place++
			}
		}

		// 如果排名发生变化，记录新的趋势点
		if len(trends) == 0 || trends[len(trends)-1].Place != place {
			trends = append(trends, &TeamTrend{
				Place: place,
				Time:  run.Timestamp,
			})
		}
	}

	return trends, nil
}
