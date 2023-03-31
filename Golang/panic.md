## panic
- 用来表示非常严重的不可恢复的异常错误
- 编译时期将 panic 转为 runtime.gopanic
- 在当前协程有效，只会触发当前协程的 recover

## recover
- 用于从 panic 或 错误场景中恢复，配合 defer 使用，在 panic 场景下会返回 err
- 编译时期将 recover 转为 runtime.gorecover
- 在包内部，总是应该从异常中 recover：不允许显式的超出包范围的 panic()