package service

import (
	"fmt"
	"math"
	"path/filepath"
	"strings"

	"github.com/lllllan02/scoreboardv2/internal/model"
	"github.com/lllllan02/scoreboardv2/pkg/files"
)

func GetContestConfig(path string) (*model.ContestConfig, error) {
	filePath := filepath.Join(dataPath, path, "config.json")

	var config model.ContestConfig
	if err := files.Load(filePath, &config); err != nil {
		return nil, err
	}

	// 如果奖牌类型不为空，则根据队伍数量计算奖牌数量
	if strings.ToLower(config.Medal.Type) != "" {
		var team model.TeamList
		if err := files.Load(filepath.Join(dataPath, path, "team.json"), &team); err != nil {
			return nil, err
		}

		total := 0
		for _, team := range team {
			if team.Official {
				total++
			}
		}
		fmt.Printf("total: %v\n", total)

		config.Medal.Official.Gold = int(math.Ceil(float64(total) * 0.1))
		config.Medal.Official.Silver = int(math.Ceil(float64(total) * 0.2))
		config.Medal.Official.Bronze = int(math.Ceil(float64(total) * 0.3))
	}

	return &config, nil
}
