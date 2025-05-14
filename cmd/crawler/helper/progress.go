package helper

import (
	"fmt"
	"io"
	"os"

	"github.com/schollz/progressbar/v3"
)

// ProgressBar 进度条管理器
type ProgressBar struct {
	// 进度条实例
	bar *progressbar.ProgressBar
	// 当前处理的对象名称
	currentObject string
	// 任务描述
	taskDescription string
}

// NewProgressBar 创建一个新的进度条
func NewProgressBar(total int, description string) *ProgressBar {
	// 创建进度条管理器
	pb := &ProgressBar{taskDescription: description}

	// 创建新的进度条
	pb.bar = progressbar.NewOptions64(
		// 设置总任务数
		int64(total),
		// 启用颜色代码
		progressbar.OptionEnableColorCodes(true),
		// 不显示字节数
		progressbar.OptionShowBytes(false),
		// 设置宽度
		progressbar.OptionSetWidth(50),
		// 设置描述
		progressbar.OptionSetDescription(description),
		// 设置主题
		progressbar.OptionSetTheme(progressbar.Theme{
			Saucer:        "[green]=[reset]",
			SaucerHead:    "[green]>[reset]",
			SaucerPadding: " ",
			BarStart:      "[",
			BarEnd:        "]",
		}),
		progressbar.OptionOnCompletion(func() { fmt.Print("\n") }),
		// 设置自定义写入器来显示对象名称
		progressbar.OptionSetWriter(newCustomWriter(os.Stdout, pb)),
		// 显示计数
		progressbar.OptionShowCount(),
	)

	// 输出任务开始信息
	fmt.Printf("开始%s...\n", description)

	return pb
}

// 创建自定义Writer将对象名称放在进度条后面
func newCustomWriter(w io.Writer, pb *ProgressBar) io.Writer {
	return &customWriter{w: w, pb: pb}
}

type customWriter struct {
	w  io.Writer
	pb *ProgressBar
}

func (cw *customWriter) Write(p []byte) (n int, err error) {
	// 确保清除整行
	fmt.Fprint(cw.w, "\033[2K\r")

	if cw.pb != nil && cw.pb.currentObject != "" {
		return fmt.Fprintf(cw.w, "%s %s", string(p), cw.pb.currentObject)
	}
	return fmt.Fprint(cw.w, string(p))
}

// SetCurrentObject 设置当前处理的对象名称
func (pb *ProgressBar) SetCurrentObject(name string) {
	pb.currentObject = name

	// 强制刷新进度条，但不添加进度
	if pb.bar != nil {
		pb.bar.RenderBlank()
	}
}

// Add 增加进度
func (pb *ProgressBar) Add(n int) {
	if pb.bar != nil {
		pb.bar.Add(n)
	}
}

// Finish 完成进度条
func (pb *ProgressBar) Finish() {
	// 确保进度条显示100%完成
	if pb.bar != nil {
		pb.bar.Finish()
	}

	// 清除当前对象名称，使进度条显示更干净
	pb.currentObject = ""

	// 如果需要，可以再次渲染以确保显示最终状态
	if pb.bar != nil {
		pb.bar.RenderBlank()
	}

	// 在进度条下方输出完成信息
	fmt.Printf("%s完成！\n", pb.taskDescription)
}
