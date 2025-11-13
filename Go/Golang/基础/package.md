## 一、Package 基础认知

### 1.1 什么是Package？

Go语言的代码组织单元，用于：
1. 拆分复杂程序，实现模块化（高内聚、低耦合）
2. 管理命名空间，避免变量/函数命名冲突
3. 控制代码访问权限（通过标识符首字母大小写）

### 1.2 核心特性

- **单包单目录**：一个目录下所有.go文件必须属于同一个package（目录名建议与包名一致，特殊场景如main包可不同）

- **main包特殊**：唯一可执行的包，必须包含main()函数作为入口

- **导入路径**：基于GOPATH/GOROOT或Go Modules的路径标识，如"encoding/json"

## 二、核心机制

### 2.1 包的声明与导入

#### 2.1.1 声明语法

```go

// 非可执行包（库包），包名建议与目录名一致
package utils

// 可执行包（必须包含main函数）
package main

func main() {
    // 程序入口逻辑
}
```

#### 2.1.2 导入语法

```go

// 1. 标准导入
import "fmt"
import "encoding/json"

// 2. 分组导入（推荐，更简洁）
import (
    "fmt"
    "encoding/json"
)

// 3. 别名导入（解决命名冲突或简化调用）
import jsonpkg "encoding/json"

// 4. 匿名导入（仅执行包初始化函数，不使用其API）
import _ "github.com/lib/pq"
```

### 2.2 访问权限控制

Go无关键字修饰权限，通过**标识符首字母大小写**控制：

|标识符格式|权限范围|示例|
|---|---|---|
|首字母大写|跨包可访问（公有权限）|func Add()、var Name string|
|首字母小写|仅包内可访问（私有权限）|func add()、var name string|
### 2.3 包的初始化

#### 2.3.1 初始化顺序

1. 依赖包先于当前包初始化（递归初始化）

2. 包内所有全局变量先初始化（按声明顺序）

3. 执行包内init()函数（可多个，按声明顺序执行）

4. **main包特殊**：作为程序入口，所有依赖包初始化完成后才初始化main包，最后执行main()

#### 2.3.2 init()函数特性

```go

// 无参数、无返回值，不可显式调用
func init() {
    // 初始化逻辑：配置加载、资源注册、校验等
    fmt.Println("包初始化")
}
```

> init()函数常用于数据库驱动注册、配置初始化等场景，匿名导入包时会执行其init()

## 三、Go Modules 时代的包管理

### 3.1 核心概念

- **模块（Module）**：包含多个相关package的集合，通过go.mod文件标识

- **模块路径**：go.mod中第一行声明的路径，作为包的导入前缀，如"example.com/myproject"

- **依赖版本**：记录在go.sum中，确保构建一致性

### 3.2 常用命令

```bash

# 初始化模块（生成go.mod）
go mod init 模块路径

# 下载依赖并更新go.sum
go mod download

# 整理依赖（移除未使用的依赖）
go mod tidy

# 将依赖复制到项目vendor目录
go mod vendor

# 查看依赖详情
go mod why 包路径
go mod graph
```

## 四、实践规范

### 4.1 包命名规范

- 使用**小写字母**，不包含下划线、大写字母或特殊字符

- 简洁且有意义，如"utils"、"db"、"logger"，避免模糊命名如"common"、"tools"

- 避免与标准库包名冲突（如不命名为"fmt"、"json"）

### 4.2 目录结构规范（以Web项目为例）

```text

example.com/myweb/
├── go.mod        # 模块声明
├── go.sum        # 依赖校验
├── main.go       # main包，程序入口
├── api/          # 接口定义包（如HTTP接口）
├── service/      # 业务逻辑包
├── model/        # 数据模型包（如数据库实体）
├── db/           # 数据库操作包
├── utils/        # 工具函数包
└── config/       # 配置管理包
```

### 4.3 导入规范

- 导入分组顺序：标准库包 → 第三方包 → 本地项目包，组间空一行

- 不使用的导入必须删除，避免冗余

- 除非命名冲突，否则不滥用别名（保持代码可读性）

```go

import (
    // 标准库
    "fmt"
    "net/http"

    // 第三方包
    "github.com/gin-gonic/gin"

    // 本地包（基于模块路径）
    "example.com/myweb/service"
    "example.com/myweb/utils"
)
```

### 4.4 其他注意事项

- 一个包专注单一职责，避免过大的"万能包"

- 私有函数/变量在包内复用，公有权限仅暴露必要API

- 通过注释说明包的功能（包注释放在package声明前）

```go

//  utils包提供常用的工具函数，包括字符串处理、时间转换等
//  适用场景：全项目通用的辅助逻辑
package utils
```

## 五、常见问题自查

1. Q：导入包时提示"cannot find module providing package xxx"？
A：1. 检查导入路径是否正确；2. 执行go mod tidy下载依赖；3. 确认模块路径与go.mod一致

2. Q：跨包调用函数提示"undefined: xxx"？
A：检查目标函数首字母是否大写（公有权限）

3. Q：init()函数未执行？
A：1. 确认包已被导入（非匿名导入需使用API，匿名导入用_）；2. 检查初始化顺序是否符合预期

4. Q：不同包有同名函数如何处理？
A：可以直接用「包名.函数名」调用；