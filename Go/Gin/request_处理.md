##  ShouldBind 绑定 request body 数据至结构体
- 在 JSON、XML、MsgBack、ProtoBuf 等仅能调用一次该方法
- Query、Form、FormPost、FormMultipart 等等可以多次调用

```go
type formA struct {
  Foo string `json:"foo" xml:"foo" binding:"required"`
}

type formB struct {
  Bar string `json:"bar" xml:"bar" binding:"required"`
}

func SomeHandler(c *gin.Context) {
  objA := formA{}
  objB := formB{}
  // c.ShouldBind 使用了 c.Request.Body，不可重用。
  if errA := c.ShouldBind(&objA); errA == nil {
    c.String(http.StatusOK, `the body should be formA`)
  // 因为现在 c.Request.Body 是 EOF，所以这里会报错。
  } else {
    ...
  }
}
```

## ShouldBindBodyWith 绑定 request body 数据至结构体
- 在绑定之前将 body 存储到上下文中，会对性能造成轻微影响
- 可以多次调用

```go
func SomeHandler(c *gin.Context) {
  objA := formA{}
  objB := formB{}
  // 读取 c.Request.Body 并将结果存入上下文。
  if errA := c.ShouldBindBodyWith(&objA, binding.JSON); errA == nil {
    c.String(http.StatusOK, `the body should be formA`)
  // 这时, 复用存储在上下文中的 body。
  } else if errB := c.ShouldBindBodyWith(&objB, binding.JSON); errB == nil {
    c.String(http.StatusOK, `the body should be formB JSON`)
  // 可以接受其他格式
  } else if errB2 := c.ShouldBindBodyWith(&objB, binding.XML); errB2 == nil {
    c.String(http.StatusOK, `the body should be formB XML`)
  } else {
    ...
  }
}
```

## Bind 绑定表单数据至结构体
```go
type StructA struct {
    FieldA string `form:"field_a"`
}

type StructB struct {
    NestedStruct StructA
    FieldB string `form:"field_b"`
}

type StructC struct {
    NestedStructPointer *StructA
    FieldC string `form:"field_c"`
}

type StructD struct {
    NestedAnonyStruct struct {
        FieldX string `form:"field_x"`
    }
    FieldD string `form:"field_d"`
}

func GetDataD(c *gin.Context) {
    var b StructD
    c.Bind(&b)
    c.JSON(200, gin.H{
        "x": b.NestedAnonyStruct,
        "d": b.FieldD,
    })
}
```
- 不支持以下格式的结构体
```go
type StructX struct {
    X struct {} `form:"name_x"` // 有 form
}

type StructY struct {
    Y StructX `form:"name_y"` // 有 form
}

type StructZ struct {
    Z *StructZ `form:"name_z"` // 有 form
}
```

## 绑定 HTML 复选框
```go
type myForm struct {
    Colors []string `form:"colors[]"`
}
```