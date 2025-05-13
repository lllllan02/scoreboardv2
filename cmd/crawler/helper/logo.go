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
	ccpcLogo []byte

	//go:embed icpc.png
	icpcLogo []byte
)

func DownloadLogo(contestList model.ContestList) {
	path := config.GetConfig().Data.Path

	// 计算总任务数量
	totalTasks := countTasks(contestList)

	// 创建进度条
	progressBar := NewProgressBar(totalTasks, "下载比赛 LOGO")

	campPath := filepath.Join(path, "camp")
	walkOrg(campPath, contestList.Camp, progressBar)

	provincialContestPath := filepath.Join(path, "provincial-contest")
	walkYear(provincialContestPath, contestList.ProvincialContest, progressBar)

	ccpcPath := filepath.Join(path, "ccpc")
	walkYear(ccpcPath, contestList.CCPC, progressBar)

	icpcPath := filepath.Join(path, "icpc")
	walkYear(icpcPath, contestList.ICPC, progressBar)

	// 完成进度条
	progressBar.Complete()
}

// 计算总任务数量
func countTasks(contestList model.ContestList) int {
	count := 0

	// 计算 Camp 中的任务数量
	for _, yearGroup := range contestList.Camp {
		for _, contestGroup := range yearGroup {
			count += len(contestGroup)
		}
	}

	// 计算 ProvincialContest 中的任务数量
	for _, contestGroup := range contestList.ProvincialContest {
		count += len(contestGroup)
	}

	// 计算 CCPC 中的任务数量
	for _, contestGroup := range contestList.CCPC {
		count += len(contestGroup)
	}

	// 计算 ICPC 中的任务数量
	for _, contestGroup := range contestList.ICPC {
		count += len(contestGroup)
	}

	return count
}

func walkOrg(path string, org model.OrganizationGroup, progressBar *ProgressBar) {
	for org, yearGroup := range org {
		path := filepath.Join(path, org)
		walkYear(path, yearGroup, progressBar)
	}
}

func walkYear(path string, year model.YearGroup, progressBar *ProgressBar) {
	for year, contestGroup := range year {
		path := filepath.Join(path, year)
		walkGroup(path, contestGroup, progressBar)
	}
}

func walkGroup(path string, group model.ContestGroup, progressBar *ProgressBar) {
	for name, contest := range group {
		// 设置当前处理的对象名称
		progressBar.SetCurrentObject(path)

		path := filepath.Join(path, name, "logo.png")
		contest.Config.Logo.Path = path

		// 如果图片是 base64，则保存到本地
		if contest.Config.Logo.Base64 != "" {
			saveBase64Image(path, contest.Config.Logo.Base64)
		}

		switch present := strings.ToLower(contest.Config.Logo.Preset); present {
		case "":
			saveImage(path, ccpcLogo)
		case "ccpc":
			saveImage(path, ccpcLogo)
		case "icpc":
			saveImage(path, icpcLogo)

		default:
			url := fmt.Sprintf("https://board.xcpcio.com/logos/%s.png", present)
			fetchImage(url, path)
		}

		contest.Config.Logo.Preset = ""
		contest.Config.Logo.Base64 = ""

		progressBar.Add(1)
	}
}

func saveBase64Image(path, base64Str string) error {
	// 移除 base64 编码前缀 (如 "data:image/png;base64,")
	if i := strings.Index(base64Str, ","); i > 0 {
		base64Str = base64Str[i+1:]
	}

	// 解码 base64 字符串
	imageData, err := base64.StdEncoding.DecodeString(base64Str)
	if err != nil {
		log.Printf("base64 解码失败: %v", err)
		return err
	}

	return saveImage(path, imageData)
}

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

	time.Sleep(time.Millisecond * 10)

	return nil
}
