## 包 package
- 导入包
- 调用函数时省略包名
- 替换别名
- 导入包但仅执行其 init 函数
```go
import(
	"net/http"
	import( . "fmt" ) 
    f "fmt"
	_ "github.com/go-sql-driver/mysql"
)
```
## 初始化
- 按定义顺序先初始化 import 引用的外部包，再初始化本包
- 包内初始化顺序
	- 初始化当前包的 变量、常量
	- 执行当前包的 init 函数
	- 同一个 go 文件中多个 init 函数，按照定义顺序依次执行

## Go mod
- 初始化：go mod init

## go.mod 文件
- require语句指定的依赖项模块
- replace语句可以替换依赖项模块
- exclude语句可以忽略依赖项模块

## go mod 开启
- go 1.15 后默认开启 go mod，以前需设置一个环境变量