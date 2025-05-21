package service

import (
	"fmt"
	"sort"

	"github.com/lllllan02/scoreboardv2/internal/model"
	"github.com/lllllan02/scoreboardv2/pkg/paginate"
)

type ContestRunQuery struct {
	Group    string `form:"group"`
	School   string `form:"school"`
	TeamId   string `form:"team_id"`
	Status   string `form:"status"`
	Language string `form:"language"`
	Time     int    `form:"t"`
	Page     int    `form:"page"`
	PageSize int    `form:"page_size"`
}

type ContestRun struct {
	Total        int            `json:"total"`        // 提交记录总数
	Data         []*Run         `json:"data"`         // 提交记录
	Schools      []string       `json:"schools"`      // 学校列表
	Participants []*Participant `json:"participants"` // 参赛队伍
}

type Run struct {
	Id           string `json:"id"`           // 提交 id
	TeamId       string `json:"team_id"`      // 队伍 id
	ProblemId    string `json:"problem_id"`   // 题目 id
	Team         string `json:"team"`         // 队伍名称
	Organization string `json:"organization"` // 队伍组织
	Girl         bool   `json:"girl"`         // 是否是女队
	Unofficial   bool   `json:"unofficial"`   // 是否是非正式队伍
	Language     string `json:"language"`     // 语言
	Status       string `json:"status"`       // 状态
	Timestamp    int    `json:"timestamp"`    // 提交时间(相对时间，单位：毫秒)
}

type Participant struct {
	TeamId string `json:"team_id"` // 队伍 id
	Team   string `json:"team"`    // 队伍名称
}

// GetContestRun 返回比赛提交数据
func GetContestRun(path string, query ContestRunQuery) (result *ContestRun, err error) {
	result = &ContestRun{
		Total:        0,
		Data:         make([]*Run, 0),
		Schools:      make([]string, 0),
		Participants: make([]*Participant, 0),
	}

	// 加载学校列表和参赛队伍
	teamList, err := loadTeam(path)
	if err != nil {
		return nil, err
	}

	schools := make(map[string]struct{})
	teams := make(map[string]model.Team)
	for _, team := range teamList {
		schools[string(team.Organization)] = struct{}{}
		teams[string(team.TeamId)] = team
		result.Participants = append(result.Participants, &Participant{
			TeamId: string(team.TeamId),
			Team:   string(team.Name),
		})
	}

	// 将学校列表转换为切片并排序
	for school := range schools {
		result.Schools = append(result.Schools, school)
	}
	sort.Strings(result.Schools)

	// 加载提交记录
	runList, err := loadRun(path)
	if err != nil {
		return nil, err
	}

	for _, run := range runList {
		teamId := string(run.TeamId)
		team := teams[teamId]

		// 如果筛选时间不符合，则跳过
		if run.Timestamp > query.Time {
			continue
		}

		// 如果筛选组别不符合，则跳过
		if !groupFilter(team, query.Group) {
			continue
		}

		// 如果筛选学校不符合，则跳过
		if !schoolFilter(team, query.School) {
			continue
		}

		// 如果筛选队伍不符合，则跳过
		if !teamFilter(team, query.TeamId) {
			continue
		}

		// 如果筛选语言不符合，则跳过
		if !languageFilter(run, query.Language) {
			continue
		}

		// 如果筛选状态不符合，则跳过
		if !statusFilter(run, query.Status) {
			continue
		}

		result.Data = append(result.Data, &Run{
			Id:           run.SubmissionId,
			TeamId:       teamId,
			ProblemId:    fmt.Sprintf("%c", run.ProblemId+65), // 转换为 A, B, C, D, E, F, G, H, I, J
			Team:         string(team.Name),
			Organization: string(team.Organization),
			Girl:         bool(team.Girl),
			Unofficial:   team.IsUnofficial(),
			Language:     run.Language,
			Status:       run.Status,
			Timestamp:    run.Timestamp,
		})
	}

	// 时间倒序
	sort.Slice(result.Data, func(i, j int) bool {
		return result.Data[i].Timestamp > result.Data[j].Timestamp
	})

	// 分页
	result.Total = len(result.Data)
	start, end := paginate.Paginate(query.Page, query.PageSize, result.Total)
	result.Data = result.Data[start:end]

	return result, nil
}

func schoolFilter(team model.Team, school string) bool {
	if school == "" {
		return true
	}

	return team.Organization == school
}

func teamFilter(team model.Team, teamId string) bool {
	if teamId == "" {
		return true
	}

	return string(team.TeamId) == teamId
}

func languageFilter(run model.Run, language string) bool {
	if language == "" {
		return true
	}

	return run.Language == language
}

func statusFilter(run model.Run, status string) bool {
	if status == "" {
		return true
	}

	return run.Status == status
}
