package service

import (
	"slices"
	"sort"

	"github.com/lllllan02/scoreboardv2/internal/model"
)

const (
	// 所有队伍
	GroupAll = "all"
	// 女队
	GroupGirl = "girl"
	// 正式队伍
	GroupOfficial = "official"
	// 非正式队伍
	GroupUnofficial = "unofficial"
	// 本科队伍
	GroupUndergraduate = "undergraduate"
	// 高职队伍
	GroupVocational = "vocational"
)

type Rank struct {
	Rows        []*Row    `json:"rows"`         // 队伍列表
	Submitted   []int     `json:"submitted"`    // 提交次数
	Attempted   []int     `json:"attempted"`    // 尝试次数
	Accepted    []int     `json:"accepted"`     // 解决次数
	Dirt        []int     `json:"dirt"`         // 错误次数
	Dirty       []float64 `json:"dirty"`        // 错误率
	FirstSolved []int     `json:"first_solved"` // 第一个解决时间
	LastSolved  []int     `json:"last_solved"`  // 最后一个解决时间
}

type Row struct {
	TeamId       string    `json:"team_id"`      // 队伍 id
	Team         string    `json:"team"`         // 队伍名称
	Organization string    `json:"organization"` // 队伍组织
	Girl         bool      `json:"girl"`         // 是否是女队
	Place        int       `json:"place"`        // 排名
	OrgPlace     int       `json:"org_place"`    // 组织排名
	Solved       int       `json:"solved"`       // 解决题目数
	Penalty      int       `json:"penalty"`      // 罚时
	Dirty        float64   `json:"dirty"`        // 错误率
	Problems     []Problem `json:"problems"`     // 题目列表
}

type Problem struct {
	FirstSolved bool `json:"first_solved"` // 是否是第一个解决
	Solved      bool `json:"solved"`       // 是否解决
	Attempted   bool `json:"attempted"`    // 是否尝试
	Pending     bool `json:"pending"`      // 正在评测
	Frozen      bool `json:"frozen"`       // 是否冻结
	Submitted   int  `json:"submitted"`    // 提交次数
	Penalty     int  `json:"penalty"`      // 罚时(分钟)
	Timestamp   int  `json:"timestamp"`    // 通过时间(分钟)
	Dirt        int  `json:"dirt"`         // 错误次数(前提是已经解决)
}

func GetContestRank(path string, group string, t int) (*Rank, error) {
	// 获取比赛配置
	config, err := loadConfig(path)
	if err != nil {
		return nil, err
	}

	// 获取队伍信息
	teamList, err := loadTeam(path)
	if err != nil {
		return nil, err
	}

	// 队伍 id 映射
	rows := make(map[string]*Row)        // team_id -> row
	teams := make(map[string]model.Team) // team_id -> team
	for _, team := range teamList {
		teamId := string(team.TeamId)
		teams[teamId] = team
	}

	// 获取提交记录
	runList, err := loadRun(path)
	if err != nil {
		return nil, err
	}

	// 创建排行榜结构
	rank := &Rank{
		Rows:        make([]*Row, 0, len(teamList)),
		Submitted:   make([]int, config.ProblemQuantity),
		Attempted:   make([]int, config.ProblemQuantity),
		Accepted:    make([]int, config.ProblemQuantity),
		Dirt:        make([]int, config.ProblemQuantity),
		Dirty:       make([]float64, config.ProblemQuantity),
		FirstSolved: make([]int, config.ProblemQuantity),
		LastSolved:  make([]int, config.ProblemQuantity),
	}

	for i := 0; i < config.ProblemQuantity; i++ {
		rank.FirstSolved[i] = -1
	}

	// 遍历提交记录
	for _, run := range runList {
		teamId := string(run.TeamId)         // 队伍 id
		problemIndex := run.ProblemId        // 题目索引
		penalty := run.Timestamp / 1000 / 60 // 罚时

		// 提交时间大于目标时间，则跳过
		if run.Timestamp > t {
			continue
		}

		// 如果筛选组别不符合，则跳过
		team := teams[teamId]
		if !groupFilter(team, group) {
			continue
		}

		// 如果队伍不存在，则跳过
		if _, ok := rows[teamId]; !ok {
			rows[teamId] = &Row{
				TeamId:       teamId,
				Team:         string(team.Name),
				Organization: string(team.Organization),
				Girl:         bool(team.Girl),
				Problems:     make([]Problem, config.ProblemQuantity),
			}
		}
		row := rows[teamId]

		// 如果题目已经解决，则跳过
		if row.Problems[problemIndex].Solved {
			continue
		}

		// 如果编译错误，则跳过
		if run.Status == "COMPILATION_ERROR" {
			continue
		}

		if run.Status == "ACCEPTED" {
			// 题目统计
			row.Problems[problemIndex].Solved = true                               // 设置为已解决
			row.Problems[problemIndex].Penalty += penalty                          // 通过的提交加当前时间
			row.Problems[problemIndex].Dirt = row.Problems[problemIndex].Submitted // 累计通过题目的错误次数

			// 队伍统计
			row.Solved++                                      // 解决题目数加一
			row.Penalty += row.Problems[problemIndex].Penalty // 累计通过题目的罚时

			// 排行榜统计
			rank.LastSolved[problemIndex] = penalty // 设置为最后一个解决
			if rank.FirstSolved[problemIndex] == -1 {
				rank.FirstSolved[problemIndex] = penalty      // 设置为第一个解决
				row.Problems[problemIndex].FirstSolved = true // 设置为第一个解决
			}
		} else {
			row.Problems[problemIndex].Penalty += 20 // 错误的提交算 20 分钟罚时
		}

		row.Problems[problemIndex].Timestamp = penalty // 设置通过时间
		row.Problems[problemIndex].Attempted = true    // 设置为尝试过
		row.Problems[problemIndex].Submitted++         // 提交次数加一
	}

	// 将队伍信息添加到排行榜
	for _, row := range rows {
		rank.Rows = append(rank.Rows, row)

		var dirt, submitted int
		for index, problem := range row.Problems {
			rank.Submitted[index] += problem.Submitted // 累计提交次数
			if problem.Solved {
				rank.Accepted[index]++                     // 通过的题目累计解决次数
				rank.Attempted[index] += problem.Submitted // 通过的题目累计尝试次数
				rank.Dirt[index] += problem.Dirt           // 通过的题目累计错误次数

				// 累计错误次数和提交次数
				dirt += problem.Dirt
				submitted += problem.Submitted

				// 计算错误率
				rank.Dirty[index] = float64(rank.Dirt[index]) / float64(rank.Attempted[index]) // 计算题目错误率
			}
		}
		if submitted > 0 {
			row.Dirty = float64(dirt) / float64(submitted) // 计算队伍错误率
		}
	}

	// 按照解决题目数和罚时排序
	sort.Slice(rank.Rows, func(i, j int) bool {
		if rank.Rows[i].Solved != rank.Rows[j].Solved {
			return rank.Rows[i].Solved > rank.Rows[j].Solved
		}
		return rank.Rows[i].Penalty < rank.Rows[j].Penalty
	})

	// 计算排名
	place := 1
	orgPlace := make(map[string]int)
	for i, row := range rank.Rows {
		row.Place = i + 1

		if orgPlace[row.Organization] == 0 {
			row.OrgPlace, place = place, place+1
			orgPlace[row.Organization] = row.OrgPlace
		}
	}

	return rank, nil
}

// groupFilter 根据组别过滤队伍
func groupFilter(team model.Team, group string) bool {
	switch group {
	case GroupGirl:
		return bool(team.Girl)
	case GroupOfficial:
		return bool(team.Official) || slices.Contains(team.Group, group)
	case GroupUnofficial:
		return bool(team.Unofficial) || slices.Contains(team.Group, group)
	case GroupUndergraduate:
		return bool(team.Undergraduate) || slices.Contains(team.Group, group)
	case GroupVocational:
		return bool(team.Vocational) || slices.Contains(team.Group, group)
	default:
		return true
	}
}
