# reflect

## 概览
- 运行时类型与值检查/操作：`reflect.Type`、`reflect.Value`。

## 常用用法
```go
t := reflect.TypeOf(obj)
v := reflect.ValueOf(obj)

// 读取与设置字段
f := v.Elem().FieldByName("Name")
if f.CanSet() { f.SetString("new") }

// 读取标签
tf, _ := t.Elem().FieldByName("ID")
fmt.Println(tf.Tag.Get("json"))

// 调用方法
m := v.MethodByName("Do")
m.Call([]reflect.Value{reflect.ValueOf(123)})
```

## 技术原理
- 类型元数据由编译器与运行时维护；值操作需区分指针/可设置性。
- 反射开销较大，涉及动态分派、逃逸与接口转换成本。

## 最佳实践
- 能用范型/接口就不要用反射；保持类型安全与性能。
- 注意 `Value` 可设置性与零值；处理失败时返回明确错误。