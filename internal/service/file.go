package service

import (
	"path/filepath"
	"sort"

	"github.com/lllllan02/scoreboardv2/config"
	"github.com/lllllan02/scoreboardv2/internal/model"
	"github.com/lllllan02/scoreboardv2/pkg/errors"
	"github.com/lllllan02/scoreboardv2/pkg/files"
)

// 数据目录路径
var dataPath = config.GetConfig().Data.Path

// loadConfig 加载比赛配置
func loadConfig(path string) (*model.ContestConfig, error) {
	filePath := filepath.Join(dataPath, path, "config.json")

	var config model.ContestConfig
	if err := files.Load(filePath, &config); err != nil {
		return nil, errors.ErrContestConfigNotFound
	}

	return &config, nil
}

// loadTeam 加载队伍数据
func loadTeam(path string) (model.TeamList, error) {
	filePath := filepath.Join(dataPath, path, "team.json")

	var team model.TeamList
	if err := files.Load(filePath, &team); err != nil {
		return nil, errors.ErrContestTeamNotFound
	}

	return team, nil
}

// loadRun 加载运行数据
func loadRun(path string) (model.RunList, error) {
	filePath := filepath.Join(dataPath, path, "run.json")

	var run model.RunList
	if err := files.Load(filePath, &run); err != nil {
		return nil, errors.ErrContestRunNotFound
	}

	// 将运行数据按时间排序
	sort.Slice(run, func(i, j int) bool {
		return run[i].Timestamp < run[j].Timestamp
	})

	return run, nil
}
