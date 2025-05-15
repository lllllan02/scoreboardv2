package service

import (
	"path/filepath"
	"sort"
	"strings"

	"github.com/lllllan02/scoreboardv2/internal/model"
	"github.com/lllllan02/scoreboardv2/pkg/errors"
	"github.com/lllllan02/scoreboardv2/pkg/files"
)

// GetContestList 获取比赛列表数据
func GetContestList(contestName string) ([]*model.Contest, error) {
	// 构建contest_list.json的完整路径
	filePath := filepath.Join(dataPath, "contest_list.json")

	// 加载比赛列表
	var contestList model.ContestList
	if err := files.Load(filePath, &contestList); err != nil {
		return nil, errors.ErrContestListNotFound
	}

	// 遍历比赛列表
	contests := contestList.Walk()

	// 如果 contestName 不为空，则过滤比赛列表
	if contestName != "" {
		filtered := make([]*model.Contest, 0, len(contests))
		for _, c := range contests {
			if strings.Contains(c.Config.ContestName, contestName) {
				filtered = append(filtered, c)
			}
		}
		contests = filtered
	}

	// 按比赛开始时间降序排序
	sort.Slice(contests, func(i, j int) bool {
		return contests[i].Config.StartTime > contests[j].Config.StartTime
	})

	return contests, nil
}
