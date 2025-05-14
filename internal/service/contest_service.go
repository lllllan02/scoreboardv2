package service

import (
	"encoding/json"
	"os"
	"path/filepath"
	"sort"
	"strings"

	"github.com/lllllan02/scoreboardv2/config"
	"github.com/lllllan02/scoreboardv2/internal/model"
	"github.com/lllllan02/scoreboardv2/pkg/errors"
)

// 数据目录路径
var dataPath = config.GetConfig().Data.Path

// GetContestList 获取比赛列表数据
func GetContestList(contestName string) ([]*model.Contest, error) {
	// 构建contest_list.json的完整路径
	filePath := filepath.Join(dataPath, "contest_list.json")

	// 检查文件是否存在
	if _, err := os.Stat(filePath); os.IsNotExist(err) {
		return nil, errors.ErrContestListNotFound
	}

	// 读取文件内容
	fileData, err := os.ReadFile(filePath)
	if err != nil {
		return nil, errors.NewInternalError("读取比赛列表数据失败", err)
	}

	// 解析JSON数据
	var contestList model.ContestList
	if err := json.Unmarshal(fileData, &contestList); err != nil {
		return nil, errors.NewInternalError("解析比赛列表数据失败", err)
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
