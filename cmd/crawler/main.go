package main

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"path/filepath"

	"github.com/lllllan02/scoreboardv2/cmd/crawler/helper"
	"github.com/lllllan02/scoreboardv2/config"
	"github.com/lllllan02/scoreboardv2/internal/model"
)

var (
	path = config.GetConfig().Data.Path
)

func main() {
	fmt.Println("开始爬取比赛列表...")
	fetchContestList()
}

func fetchContestList() {
	url := "https://board.xcpcio.com/data/index/contest_list.json"

	// 获取数据
	resp, err := http.Get(url)
	if err != nil {
		log.Fatal(err)
	}
	defer resp.Body.Close()

	// 读取响应体内容
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		log.Fatal(err)
	}

	// 解析JSON为通用数据结构
	var contestList model.ContestList
	if err := json.Unmarshal(body, &contestList); err != nil {
		log.Fatal(err)
	}

	helper.DownloadImage(contestList)

	// 格式化JSON为美观缩进格式
	prettyJSON, err := json.MarshalIndent(contestList, "", "  ")
	if err != nil {
		log.Fatal(err)
	}

	// 保存到本地
	filePath := filepath.Join(path, "contest_list.json")
	if err := os.MkdirAll(filepath.Dir(filePath), 0755); err != nil {
		log.Fatal(err)
	}

	if err := os.WriteFile(filePath, prettyJSON, 0644); err != nil {
		log.Fatal(err)
	}

	log.Printf("成功保存比赛列表到 %s", filePath)
}
