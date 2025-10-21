# go generate

用途：运行源代码中声明的生成指令。

约定：在源文件中写注释 `//go:generate <command>`。

示例：
- 源文件：`//go:generate stringer -type=Color`
- 运行：`go generate ./...`