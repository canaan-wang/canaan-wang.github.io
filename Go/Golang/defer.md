## defer
- 编译时将 defer 转换成 runtime.deferproc，defer 函数的末尾会调用 runtime.deferreturn
- 在运行过程中遇到 panic，会从 Goroutine 的链表依次取出 runtime._defer 结构体并执行；
- 遇到了 recover 会将 _panic.recovered 标记成 true 并返回 panic 的参数
- 如果没有遇到 recover 就会依次遍历所有的 runtime._defer，并在最后调用 runtime.fatalpanic 中止程序、打印 panic 的参数并返回错误码 2
### 使用规则
- 当defer被声明时，其参数就会被实时解析
- defer执行顺序为先进后出
- defer可以读取有名返回值，也就是可以改变有名返回参数的值