## Go 工作空间（GOPATH）
- 包含 bin、pkg、src 三个子目录，不可以和 go 的安装目录相同
- bin：存储二进制可执行文件，可将该目录放入 PATH 环境变量中
- pkg：存储本地代码 install 后除 main pkg 外的代码     包及依赖的外部三方包
- src：golang 项目代码