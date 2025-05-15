package helper

import (
	_ "embed"
	"encoding/base64"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"github.com/lllllan02/scoreboardv2/config"
	"github.com/lllllan02/scoreboardv2/internal/model"
)

var (
	//go:embed ccpc.png
	ccpcLogo []byte // 嵌入 CCPC 比赛的默认 logo

	//go:embed icpc.png
	icpcLogo []byte // 嵌入 ICPC 比赛的默认 logo

	// 下载 logo 时显示的进度条
	logobar *ProgressBar

	// 比赛列表路径
	path = config.GetConfig().Data.Path
)

// DownloadLogo 下载所有比赛的logo文件
func DownloadLogo(contestList model.ContestList) {
	// 计算总任务数量
	totalTasks := countTasks(contestList)

	// 创建进度条
	logobar = NewProgressBar(totalTasks, "下载比赛 LOGO")

	// 处理各种不同类型的比赛
	for _, contest := range contestList.Walk() {
		// 设置当前处理的对象名称，用于进度条显示
		logobar.SetCurrentObject(contest.BoardLink)
		// 下载比赛 LOGO
		FetchLogo(contest)
		// 更新进度条
		logobar.Add(1)
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

func FetchLogo(contest *model.Contest) {
	path := filepath.Join(path, contest.BoardLink, "logo.png")

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

	// 更新比赛配置
	contest.Config.Logo.Path = path
	contest.Config.Logo.Preset = ""
	contest.Config.Logo.Base64 = ""
}

// FetchBanner 下载比赛的横幅文件
func FetchBanner(contest *model.Contest) {
	if contest.Config.Banner.Url == "" {
		return
	}

	path := filepath.Join(path, contest.BoardLink, "banner.png")
	url := fmt.Sprintf("https://board.xcpcio.com/%s", filepath.Join("data", contest.BoardLink, contest.Config.Banner.Url))

	fetchImage(url, path)

	contest.Config.Banner.Path = path
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
		fmt.Printf("base64 解码失败: %v", err)
		return err
	}

	return saveImage(path, imageData)
}

// fetchImage 从URL获取图片并保存
func fetchImage(url, path string) error {
	resp, err := http.Get(url)
	if err != nil {
		fmt.Printf("获取图片失败: %v", err)
		return err
	}
	defer resp.Body.Close()

	imageData, err := io.ReadAll(resp.Body)
	if err != nil {
		fmt.Printf("读取图片失败: %v", err)
		return err
	}

	return saveImage(path, imageData)
}

// saveImage 将图片数据保存到指定路径
func saveImage(path string, imageData []byte) error {
	// 确保目录存在
	dir := filepath.Dir(path)
	if err := os.MkdirAll(dir, 0755); err != nil {
		fmt.Printf("创建目录 %s 失败: %v", dir, err)
		return err
	}

	// 写入文件
	if err := os.WriteFile(path, imageData, 0644); err != nil {
		fmt.Printf("写入文件 %s 失败: %v", path, err)
		return err
	}

	return nil
}
