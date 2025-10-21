# go mod

用途：模块与依赖管理。

子命令：
- `go mod init <module>` 初始化模块。
- `go mod tidy` 整理依赖（添加缺失、移除未用）。
- `go mod vendor` 生成 `vendor/` 依赖副本。
- `go mod download` 预下载依赖到缓存。
- `go mod edit` 编辑 `go.mod`（高级用法）。

示例：
- `go mod init github.com/user/project`
- `go mod tidy`