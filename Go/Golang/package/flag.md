# flag

## 概览
- 命令行参数解析，支持基本类型与自定义类型。

## 常用用法
```go
name := flag.String("name", "", "user name")
age := flag.Int("age", 0, "user age")
flag.Parse()
fmt.Println(*name, *age)

// 自定义类型实现 flag.Value
type Level int
func (l *Level) String() string { return fmt.Sprint(int(*l)) }
func (l *Level) Set(s string) error { v, err := strconv.Atoi(s); if err != nil {return err}; *l = Level(v); return nil }
var lvl Level
flag.Var(&lvl, "level", "log level")
```

## 技术原理
- 基于 `os.Args` 解析短/长选项；支持默认值与使用说明。
- 解析后返回指针（或通过 `flag.Var` 绑定自定义值）。

## 最佳实践
- 提供 `-h`/`-help` 用法提示；避免重复 `flag.Parse()`。
- 复杂 CLI 推荐使用 Cobra 等专用库。