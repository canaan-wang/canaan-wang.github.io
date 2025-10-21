# go build

用途：构建包或模块，生成可执行或归档（`.a`）。

常用参数：
- `-o <file>` 指定输出文件名。
- `-v` 显示被编译的包。
- `-race` 启用数据竞争检测（部分平台）。
- `-tags <tags>` 指定构建标签。
- 交叉编译：设置 `GOOS`、`GOARCH`。

示例：
- `go build ./cmd/app`
- `GOOS=linux GOARCH=amd64 go build -o bin/app-linux ./cmd/app`