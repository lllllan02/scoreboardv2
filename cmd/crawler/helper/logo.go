package helper

import (
	_ "embed"
	"encoding/base64"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/lllllan02/scoreboardv2/config"
	"github.com/lllllan02/scoreboardv2/internal/model"
)

var (
	//go:embed ccpc.png
	ccpcLogo []byte // 嵌入 CCPC 比赛的默认 logo

	//go:embed icpc.png
	icpcLogo []byte // 嵌入 ICPC 比赛的默认 logo

	logobar *ProgressBar // 下载 logo 时显示的进度条
)

// DownloadLogo 下载所有比赛的logo文件
func DownloadLogo(contestList model.ContestList) {
	path := config.GetConfig().Data.Path

	// 计算总任务数量
	totalTasks := countTasks(contestList)

	// 创建进度条
	logobar = NewProgressBar(totalTasks, "下载比赛 LOGO")

	// 处理各种不同类型的比赛
	{
		campPath := filepath.Join(path, "camp")
		walkOrg(campPath, contestList.Camp)

		provincialContestPath := filepath.Join(path, "provincial-contest")
		walkYear(provincialContestPath, contestList.ProvincialContest)

		ccpcPath := filepath.Join(path, "ccpc")
		walkYear(ccpcPath, contestList.CCPC)

		icpcPath := filepath.Join(path, "icpc")
		walkYear(icpcPath, contestList.ICPC)
	}

	// 完成进度条
	logobar.Finish()
}

// countTasks 计算需要处理的logo总数
func countTasks(contestList model.ContestList) int {
	count := 0

	// 计算各类比赛的logo数量并累加
	for _, yearGroup := range contestList.Camp {
		for _, contestGroup := range yearGroup {
			count += len(contestGroup)
		}
	}

	for _, contestGroup := range contestList.ProvincialContest {
		count += len(contestGroup)
	}

	for _, contestGroup := range contestList.CCPC {
		count += len(contestGroup)
	}

	for _, contestGroup := range contestList.ICPC {
		count += len(contestGroup)
	}

	return count
}

// walkOrg 遍历组织结构，处理每个组织下的比赛
func walkOrg(path string, org model.OrganizationGroup) {
	for org, yearGroup := range org {
		path := filepath.Join(path, org)
		walkYear(path, yearGroup)
	}
}

// walkYear 遍历年份，处理每年的比赛
func walkYear(path string, year model.YearGroup) {
	for year, contestGroup := range year {
		path := filepath.Join(path, year)
		walkGroup(path, contestGroup)
	}
}

// walkGroup 遍历比赛组，下载和保存每个比赛的 logo
func walkGroup(path string, group model.ContestGroup) {
	for name, contest := range group {
		// 设置当前处理的对象名称，用于进度条显示
		logobar.SetCurrentObject(path)

		path := filepath.Join(path, name, "logo.png")
		contest.Config.Logo.Path = path

		// 处理 Base64 编码的 logo
		if contest.Config.Logo.Base64 != "" {
			saveBase64Image(path, contest.Config.Logo.Base64)
		}

		// 根据预设类型选择 logo
		switch present := strings.ToLower(contest.Config.Logo.Preset); present {
		case "":
			// 不做任何处理
		case "ccpc":
			saveImage(path, ccpcLogo) // 使用 CCPC logo
		case "icpc":
			saveImage(path, icpcLogo) // 使用 ICPC logo
		default:
			// 从远程 URL 获取 logo
			url := fmt.Sprintf("https://board.xcpcio.com/logos/%s.png", present)
			fetchImage(url, path)
		}

		// 清除已处理的logo配置
		contest.Config.Logo.Preset = ""
		contest.Config.Logo.Base64 = ""

		logobar.Add(1) // 更新进度条
	}
}

// saveBase64Image 将Base64编码的图片保存到文件
func saveBase64Image(path, base64Str string) error {
	// 移除Base64编码前缀（如 "data:image/png;base64,"）
	if i := strings.Index(base64Str, ","); i > 0 {
		base64Str = base64Str[i+1:]
	}

	// 解码Base64字符串
	imageData, err := base64.StdEncoding.DecodeString(base64Str)
	if err != nil {
		log.Printf("base64 解码失败: %v", err)
		return err
	}

	return saveImage(path, imageData)
}

// fetchImage 从URL获取图片并保存
func fetchImage(url, path string) error {
	resp, err := http.Get(url)
	if err != nil {
		log.Printf("获取图片失败: %v", err)
		return err
	}
	defer resp.Body.Close()

	imageData, err := io.ReadAll(resp.Body)
	if err != nil {
		log.Printf("读取图片失败: %v", err)
		return err
	}

	return saveImage(path, imageData)
}

// saveImage 将图片数据保存到指定路径
func saveImage(path string, imageData []byte) error {
	// 确保目录存在
	dir := filepath.Dir(path)
	if err := os.MkdirAll(dir, 0755); err != nil {
		log.Printf("创建目录 %s 失败: %v", dir, err)
		return err
	}

	// 写入文件
	if err := os.WriteFile(path, imageData, 0644); err != nil {
		log.Printf("写入文件 %s 失败: %v", path, err)
		return err
	}

	time.Sleep(time.Millisecond * 10) // 短暂延迟，防止 IO 过载

	return nil
}
