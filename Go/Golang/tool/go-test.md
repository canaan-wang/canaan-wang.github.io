# go test

用途：运行单元测试、基准测试、模糊测试。

常用参数：
- `-run <regex>` 选择性运行匹配的测试函数。
- `-bench <regex>` 运行匹配的基准测试（如 `-bench .`）。
- `-benchmem` 显示内存分配统计。
- `-count N` 指定重复次数（可配合 `-cpu`）。
- `-race` 启用数据竞争检测。
- `-fuzz <regex>` 启用模糊测试；`-fuzztime` 指定持续时间。

示例：
- 功能测试：`go test ./... -run TestLogin`
- 基准测试：`go test -bench . -benchmem ./pkg/...`
- 模糊测试：`go test -fuzz FuzzParse -fuzztime=30s ./...`