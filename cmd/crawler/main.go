package main

import (
	"fmt"
	"path/filepath"

	"github.com/lllllan02/scoreboardv2/cmd/crawler/helper"
	"github.com/lllllan02/scoreboardv2/config"
	"github.com/lllllan02/scoreboardv2/internal/model"
)

var (
	// 数据保存路径
	path = config.GetConfig().Data.Path
)

func main() {
	fmt.Println("开始爬取比赛列表...")
	contestList := fetchContestList()

	fetchContests(helper.Walk(contestList))
}

func fetchContestList() model.ContestList {
	url := "https://board.xcpcio.com/data/index/contest_list.json"

	// 解析JSON为通用数据结构
	var contestList model.ContestList
	if err := helper.Fetch(url, &contestList); err != nil {
		panic(err)
	}

	// 下载比赛 LOGO
	helper.DownloadLogo(contestList)

	// 清理空的比赛
	helper.Clean(contestList)

	// 保存比赛列表
	filePath := filepath.Join(path, "contest_list.json")
	helper.Save(filePath, contestList)

	fmt.Printf("成功保存比赛列表到 %s\n", filePath)

	return contestList
}

func fetchContests(contest []*model.Contest) {
	total := len(contest)

	contestBar := helper.NewProgressBar(total, "爬取比赛数据")

	for _, contest := range contest {
		contestBar.SetCurrentObject(contest.BoardLink)

		fetchConfig(contest.BoardLink)

		contestBar.Add(1)
	}
}

func fetchConfig(link string) {
	url := fmt.Sprintf("https://board.xcpcio.com/data%s/config.json", link)
	filePath := filepath.Join(path, link, "config.json")

	contest := model.Contest{
		BoardLink: link,
		Config:    model.ContestConfig{},
	}
	if err := helper.Fetch(url, &contest.Config); err != nil {
		fmt.Printf("\033[2K\r获取 %s config 失败: %s\n", link, err)
		return
	}

	// 下载比赛 LOGO
	helper.FetchLogo(&contest)

	// 保存比赛配置
	helper.Save(filePath, contest.Config)
}
