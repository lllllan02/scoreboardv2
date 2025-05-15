package service

import (
	"math"
	"strings"

	"github.com/lllllan02/scoreboardv2/internal/model"
)

func GetContestConfig(path string) (*model.ContestConfig, error) {
	config, err := loadConfig(path)
	if err != nil {
		return nil, err
	}

	// 如果奖牌类型不为空，则根据队伍数量计算奖牌数量
	if strings.ToLower(config.Medal.Type) != "" {
		team, err := loadTeam(path)
		if err != nil {
			return nil, err
		}

		total := 0
		for _, team := range team {
			if team.Official {
				total++
			}
		}

		config.Medal.Official.Gold = int(math.Ceil(float64(total) * 0.1))
		config.Medal.Official.Silver = int(math.Ceil(float64(total) * 0.2))
		config.Medal.Official.Bronze = int(math.Ceil(float64(total) * 0.3))
	}

	return config, nil
}
