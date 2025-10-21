# go tool pprof

用途：性能剖析（CPU/内存/阻塞/协程），结合 `net/http/pprof` 或生成的 `*.pprof` 文件。

常用用法：
- 在线服务：`go tool pprof http://localhost:6060/debug/pprof/profile?seconds=30`
- 离线文件：`go tool pprof cpu.pprof`
- 交互命令：`top`、`list <func>`、`web`（需 Graphviz）、`svg`、`png`。

采集：
- 引入 `import _ "net/http/pprof"` 并在服务上开启 `:6060` 监听。