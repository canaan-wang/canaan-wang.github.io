# go work

用途：多模块工作区，统一开发与构建。

子命令：
- `go work init [dirs]` 初始化并添加模块路径。
- `go work use <dir>` 添加或移除模块路径（配合 `-r`）。
- `go work edit` 编辑 `go.work`。

示例：
- `go work init ./moduleA ./moduleB`
- `go work use ./moduleC`