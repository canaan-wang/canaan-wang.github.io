# Golang

## Go 工作空间（GOPATH）
- 包含 bin、pkg、src 三个子目录，不可以和 go 的安装目录相同
- bin：存储二进制可执行文件，可将该目录放入 PATH 环境变量中
- pkg：存储本地代码 install 后除 main pkg 外的代码     包及依赖的外部三方包
- src：golang 项目代码

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

## 类型
bool
- 只可以使用 true、false 常量，无法使用 0、1，赋值时无隐式转换
byte
- underlying type 为 uint8
- 用于处理 ASCII 字符
complex64
- 32 位实数、虚数
complex128
- 64 位实数、虚数
```go
var c1 complex64 = 5 + 10i
```
float32
- 精度：小数点后 6 位
float64
- 精度：小数点后 15 位
int、int8、int16、int32、int64
- int 基于操作系统类型决定长度
rune
- underlying type 为 int32
- 用于处理 Unicode 字符
string
- 底层是一个结构体
uint、uint8、uint16、uint32、uint64
- uint 基于操作系统类型决定长度
uintptr
- 无符号整数，用于存放指针
- 基于操作系统类型决定长度
string
- 定义字符串，使用反引号，字符串内容不进行转义
- 使用双引号定义
- 字符获取：可以通过类似 slice 的下标方式获取
- 字符获取：获取具体某个字符的地址非法

## 运算符
### 自增、自减运算符


## 变量
### 变量声明方式
- var 声明的变量是被初始化过后的(内存已分配)，初始化值为该类型的零值
- := 简式声明仅可以在函数内使用
- & 初始化结构体时，背后调用了 new
#### 变量类型
- 全局变量：仅可使用 var 进行声明
- 局部变量
### 空白标识符 _
- 用于抛弃值，本身是一个只写变量
- 用于函数返回中不需要的返回值以及 package 引入时仅需要使用其 init() 初始化时。

### 变量作用域
- 局部变量：函数、代码块内部定义的变量为局部变量。作用域仅在函数、代码块内
- 全局变量：函数外定义的变量为全局变量，本包内所有函数均可使用。导出后，其它包也可以使用
- 不同层级的代码块同一变量名可声明多次，运行时选择同一层级代码块中的变量
- 同一层级的代码块不可以对同一变量名声明多次

## 常量
- const name type = value， 常量的 type 可不填写，在代码执行过程中由上下文决策其类型
- 值仅能为布尔、数值、字符串
- 多个常量定义时，如果未设定值，则使用前一个常量的值
### golang 预定义的常量
- TRUE、FALSE
iota
- Golang 中定义的特殊常量，在 const 出现时被置 0，后每次出现 iota 即 + 1
```go
const (
    a = iota // 0
    b = iota // 1
    c = iota // 2
)
```

## 指针（unsafe 包）
### Go 指针限制
- Go 指针不能进行数学运算
- 不同类型的指针不能相互转换
- 不同类型的指针不能进行等值计算
- 不同类型的指针变量不能相互赋值
### unsafe 包使用
- 任何类型的指针和 unsafe.Pointer 可以相互转换。
- uintptr 类型和 unsafe.Pointer 可以相互转换。
- pointer 不能直接进行数学运算，但可以把它转换成 uintptr，对 uintptr 类型进行数学运算，再转换成 pointer 类型。
- unsafe 包中 pointer uintptr 用来计算变量内存地址，非常危险，将内存地址转为变量相应类型的指针可直接修改其值。
- 同一个包内的私有成员变量，使用 unsafe.Offsetof 可获取其偏移量
- 不同包内的私有成员变量，使用 unsafe.Sizeof() 获取成员大小，进而计算内存地址
```go
func main() {
    p := Programmer{"stefno", 18, "go"}
    fmt.Println(p)
    lang := (*string)(unsafe.Pointer(uintptr(unsafe.Pointer(&p)) + unsafe.Sizeof(int(0)) + unsafe.Sizeof(string(""))))
    *lang = "Golang"
    fmt.Println(p)
}
```


## 可见行原则 
- 全局变量、常量、结构体、函数如果需要在包外使用，将首字母大写即可导出。

## 循环
- 可使用标签配合 break、continue 使用
### for
### range
- for range 时 val 为 for 对象中 val 的副本，修改其副本不会影响到原实例，如果是指针则会影响原实例所指向的实例
- 遍历切片时追加的元素不会增加循环的执行次数
- 数组和切片
    对于所有的 range 循环，Go 语言都会在编译期将原切片或者数组赋值给一个新变量，在赋值的过程中就发生了拷贝，通过 len 预先获取的长度，所以 循环次数不会发生改变
    清除数组或者切片中的数据，Go 语言会直接使用 runtime.memclrNoHeapPointers 或者 runtime.memclrHasPointers 清除目标数组内存空间中的全部数据，并在执行完成后更新遍历数组的索引
    for range 会被转化为一个 for 循环，如果关心索引、返回值的情况，则会在 for 循环前定义对应的索引和返回值变量，并在循环体能更新索引值和返回值变量（赋值，会发生拷贝）
- 字符串
    逻辑基本与数据切片相同，但是会把字节转化为 rune 类型
- map
    随机选择一个 bucket 及其 cell 开始遍历，按照数组顺序循环结束。
- channel
    转化为 for 循环，for 前定义变量，变量的定义在 for 的第三个表达式。

## 判断
### switch
- 无需写 break， case 执行结束默认 break
- fallthrough 本分支执行结束后继续执行 next 分支

## 内置函数
- 内置函数不可作为参数传入函数
- 内建函数无具体实现代码，由编译器在编译时期动态转化为 runtime 包的具体代码调用以及汇编代码
### append
- 用于切片追加元素，Golang 编译后执行实际执行为: runtime.growslice -> runtime.convTslice
### cap
- 用于获取 slice 的具体容量
### len
- 获取 slice 当前使用长度
### close
- 用于关闭 channel
### complex
- 从浮点实部和虚部构造复数值
### copy
- 切片深拷贝，copy 数量为 len(src) len(dst) 的最小值
- copy函数还接受可分配给[] byte类型的目标参数，其中source参数为字符串类型。 此种情况将字符串中的字节复制到字节切片中。
### delete
- 删除 map 中的元素
real
- 获取复数的实数部分
### imag
- 获取复数的虚数部分
### make
- 仅用于 Go 中 slice、map、channel 三种数据结构的内存分配及初始化，均返回其对应的类型
### new
- 可以为 Go 中所有类型分配内存，并返回该类型的指针，类型值为其零值，如果为结构体，结构体内所有字段值均为其对应类型的零值
### panic
- 用来表示非常严重的不可恢复的异常错误
- 编译时期将 panic 转为 runtime.gopanic
- 在当前协程有效，只会触发当前协程的 recover
### recover
- 用于从 panic 或 错误场景中恢复，配合 defer 使用，在 panic 场景下会返回 err
- 编译时期将 recover 转为 runtime.gorecover
- 在包内部，总是应该从异常中 recover：不允许显式的超出包范围的 panic()

## slice
### 模型
- 包含一个底层数组指针、slice 当前长度、容量的结构体
### nil 切片
- 可以使用 append 函数为其追加元素，在 append 时会创建一个 slice，并向其追加元素后返回
### 通过 make 创建
- make 函数返回的为 slice 结构体非指针，所以 slice 在 append 或者函数参数传递时都需要被复制一遍。
### slice 元素追加
- slice 为结构体，故 append 返回的 slice 为一个新的结构体，Go 编译器不允许 append 的返回值不被使用
## slice 自动扩容
- 在 append 追加元素时，slice 本身 cap 不足情况下会发生自动扩容，创建 slice 在所需容量可知的情况下，尽可能设置 cap
- slice 扩容后，原数组相关的 slice 并不受到影响
- 扩容规律：
- 所需 cap 大于 slice cap 的两倍时，new slice cap 等于所需 cap
- 小于 2 倍，且原 slice 元素 len 小于 1024 时，new slice cap 为原 slice cap 的两倍
- 小于 2 倍，且原 slice 元素 len 大于等于 1024 时，new slice cap 为 原 slice cap 不断做 1.25 扩容直到大于所需 cap 时的结果
- 扩容值得到后，还需要做内存对齐，最后 slice 的 new cap 为内存对齐后的 cap，相近于计算后的扩容值

## map
### 模型
- Go 中的 map 采用哈希查找表实现，并通过链表解决 hash 冲突，链表中的每个元素是一个 bucket，每个 bucket 可存储 8 个元素
### key
- Go 中除 slice、map、functions 外的所有类型均可以作为 key
- float 作为 key 时会通过 Float64frombits 先转化为一个 uint64 后塞入 map，可能会因为精度的问题发生一些异常逻辑，慎用。
- key 遍历是无序的遍历时会选择一个随机的 bucket 以及其随机的一个 cell 开始遍历
### value
- 任何类型都可以作为 value
### 线程安全
- map 非线程安全，异常操作会发生 panic
### put
- 对 Key 做哈希得到 hash 值，拿到哈希值的后 B 位，得到 bucket 的下标 2 的 B 次方。在 bucekt 链表中找到一个空闲位置，判断该 key 在此链表中是否存在，不存在则放入该空闲位置，存在则覆盖原位置
- 扩容场景下：计算 hash 值的 后 B 位，确定新 bucket 位置，确保新 bucekt 对应的 old bucket 已迁移结束，再 put 到新 bucket 中。
### get
- 对 Key 做哈希得到 hash 值，拿到哈希值的后 B 位，得到 bucket 的下标 2 的 B 次方，遍历 bucekt 链表查找 tophash（高 8 位） 相同的元素，并进行 key 对比，均相同后返回该值。
- 扩容场景下：回到 old bucket 中进行查询
### map 遍历
- 非扩容状态：随机 bucket、随机 cell 开始遍历，遍历整个哈希表
- 扩容状态：哈希表中未迁移的 bucket 回到 old bucket 中遍历，仅选择会落入该 bucket 的 kv。
### map 扩容
#### 扩容触发条件
- 装载因子：map 内元素数量除以 2 的 B 次方。（每个 bucket 内元素的平均值），超过 6.5 时进行扩容
- overflow bucket 过多：B 小于 16 时，overflow bucket 数量大于等于 2 的 B 次方则发生扩容，B 大于等于 16 时，overflow bucket 数量大于等于 2 的 15 次方就发生扩容
    - bucket 过多条件是对装载因子条件的补充，用于解决 bucket 空置率高的问题，也仅会在 bucekt 空置率高的情况下触发
    - 触发场景：map 被不断的 put、del，但是一直未触发 装载因子扩容条件，overflow bucket 空置率高，会触发该条件
    - overflow bucket，bucket 链表除首节点后续的 bucket
#### 扩容逻辑
- 内存分配：老 bucket 挂载到 oldBucket，分配新 bucket 空间，如果因为装载因子导致的扩容则 B + 1，否则仍为 B。
- overflow bucket 过多导致的扩容，仅为内存整理，数组不翻倍
- bucekt 迁移：为避免因数据迁移导致的 map 使用阻塞，故采用渐进式迁移，在 map put、del 操作时执行 bucekt 迁移操作代码，一次仅迁移一个 bucekt 链表
### 注：
- map 的 KV 不允许取地址（扩容后会发生地址转变）
- map 可以边遍历、边进行写操作吗：理论上可以，但是不建议。

## channel
### 模型：
- channel 由一个循环数组、两个 goroutine 队列以及一个 mutex 构成
- 循环数组为 channel 的数据 buffer，如果 make 时设定 buffer 为 0，则不创建循环数组
- 两个 goroutine 列表为 channel 的 senders、receivers，用于 goroutine 阻塞时的收录
- 锁（mutex）用于实现 sender、receiver 的原子性操作
### 资源泄漏
- channel buffer 一直处于空 or 满的状态会导致资源泄漏，GC 不会回收该 channel，因为有 goroutine 引用
### close
- close 后的 channel 不可以 send data to channel，否则会导致 panic
- close 后的 channel 可以 receive data，当第二个返回值 ok 为 false 时，表示 channel 数据已 receive 完毕，channel 已关闭
- channel 被 close 多次会导致 panic
### channel 优雅关闭
- N个 sender、一个 receiver：添加一个信号传递的 channel，由 receiver 侧关闭该 channel，sender 侧停止输入数据（会发生数据未消费的情况）
- N 个 sender、N 个 receiver：添加一个收集停止信号的 channel1、一个用于传递停止信号的 channel2，channel1 接受到 数据后关闭 channel2，senders 接受到 channel2 的无效数据后停止 send
### channel 应用
- 定时任务：使用 selcet，time.After(100 * time.Millisecond) 返回一个定时 put 数据的 channel，在其分支后执行代码
- producer、consumer 解耦
- 并发数控制：make 一个指定 buffer 的 channel， goroutine 执行函数开始放入一个值，执行结束读取一个值

## 接口 interface
- golang 中 stcut 对 interface 的实现为隐式实现(非侵入式)，可避免一定场景下的包相互依赖，如使用依赖包的 struct 作为接口实现直接调用。
### 模型：
- interfacetype：接口结构体
- interface 引用，非空接口（有 interface 类型信息）使用 iface， 空接口（无 interface 类型信息）使用 eface
### 值接收者、指针接收者
- 不管方法的接受者是什么类型，值接收者、指针接收者都可以调用（因为有语法糖的存在）
- 值接收者：调用时传值
- 指针接收者：调用时传指针
- interface 实现时具有一定的区别，struct 使用值接收者实现 interface 方法时，可默认认为实现了 指针接收者方法，因为此时的两种类型方法都不会影响到原 struct 实例。但如果仅实现了指针接收者方法，不可以认为其也实现了值接收者方法，因为指针接收者方法会影响到调用时的 struct 实例，但是值接收者方法却不会，故这种情况下使用 struct 实例而非其指针调用实现的 interface 方法时编译时会发生异常
- 在 struct 中包含 slice、map、interface、channel 等字段时，应使用指针接收者，在 struct 对象较大时也可以使用指针接收者
### interface 的零值
- iface 中 tab、data 均为 nil 时为 interface 的零值，此时 interface 的引用等于 nil
- 一个值为 nil 的 struct 类型指针不等于 interface 的零值，因为其包含类型信息
### 类型断言
类型断言与类型转化的区别是类型断言专用了接口变量

## 结构体（struct）
### 初始化
- strcut 内存分配时，会被分配一块连续的内存(大小确定)用于存储。

## 函数（func）
### 参数传递
- golang 中函数传参为值传递
### 匿名函数
- 需要被赋值给一个变量
- 可直接执行
- 可通过变量执行
### 闭包函数
- 函数体内创建的内部函数，可使用外部函数体定义的变量，可被传值到其他 func，或者返回

## defer
- 编译时将 defer 转换成 runtime.deferproc，defer 函数的末尾会调用 runtime.deferreturn
- 在运行过程中遇到 panic，会从 Goroutine 的链表依次取出 runtime._defer 结构体并执行；
- 遇到了 recover 会将 _panic.recovered 标记成 true 并返回 panic 的参数
- 如果没有遇到 recover 就会依次遍历所有的 runtime._defer，并在最后调用 runtime.fatalpanic 中止程序、打印 panic 的参数并返回错误码 2
### 使用规则
- 当defer被声明时，其参数就会被实时解析
- defer执行顺序为先进后出
- defer可以读取有名返回值，也就是可以改变有名返回参数的值。

## select 选择 channel
- 能够让 Goroutine 同时等待多个 Channel 可读或者可写，在 Channel 状态改变之前，select 会一直阻塞 Goroutine。
### 编译期间 select 语句优化
- 空的 select 语句会被转换成调用 runtime.block 直接挂起当前 Goroutine；
- 如果 select 语句中只包含一个 case，编译器会将其转换成 if ch == nil { block }; n; 表达式；
    首先判断操作的 Channel 是不是空的；
    然后执行 case 结构中的内容；
- 如果 select 语句中包含一个 case，一个 default，那么会使用 runtime.selectnbrecv 和 runtime.selectnbsend 非阻塞地执行收发操作；（也是转化为 if else）
- 在多个 case 场景下通过 runtime.selectgo 获取执行 case 的索引（随机），并通过多个 if 语句执行对应 case 中的代码；
### selectgo 函数（随机获取 case）
- 随机生成一个遍历的轮询顺序 pollOrder 并根据 Channel 地址生成锁定顺序 lockOrder；
- 根据 pollOrder 遍历所有的 case 查看是否有可以立刻处理的 Channel；
- 如果存在，直接获取 case 对应的索引并返回；
- 如果不存在，创建 runtime.sudog 结构体，将当前 Goroutine 加入到所有相关 Channel 的收发队列，并调用 runtime.gopark 挂起当前 Goroutine 等待调度器的唤醒；
- 当调度器唤醒当前 Goroutine 时，会再次按照 lockOrder 遍历所有的 case，从中查找需要被处理的 runtime.sudog 对应的索引；


## context
### 定义
- context 是 goroutine 运行时的上下文，主要用于在 goroutine 间传递上下文信息，包括取消信号、超时时间、截止时间、KV 信息等,是 GOlang 中并发场景下 goroutine 超时控制的标准做法
### 功能
- WithCancel 基于父 context，生成一个可以取消的 context
- WithDeadline 建一个有 deadline 的 context
- WithTimeout 创建一个有 timeout 的 context
- WithValue 创建一个存储 k-v 对的 context
### 使用原则
- 不要将 Context 塞到结构体里。直接将 Context 类型作为函数的第一参数，而且一般都命名为 ctx。
- 不要向函数传入一个 nil 的 context，如果你实在不知道传什么，标准库给你准备好了一个 context：todo。
- 不要把本应该作为函数参数的类型塞到 context 中，context 存储的应该是一些共同的数据。例如：登陆的 session、cookie 等。
- 同一个 context 可能会被传递到多个 goroutine，context 是并发安全的。
### ValueCtx
- 使用 withValue 时创建的实际上是 ValueCtx，其中包含参数中的 ctx 以及一个 KV， K 需要保证可以比较，查找时通过当前 ctx，向上递归查询，直到找到最近的一个符合的 KV 对
### Backgroud TODO Ctx
- Backgroud 用于在 main 函数中作为根 ctx
- TODO 用于在不清楚使用什么 ctx 时，暂时使用 TODO，后续需修改为具体的 ctx
- Backgroud 与 TODO 均为 emptyCtx 的实例

## 反射
### 定义
- Go 提供的一种在运行时动态更新、检查、调用变量及其函数的机制（动态：运行时可以确定，编译时期无法确定）
### 使用场景
- 不能明确接口调用哪个函数，需要根据传入的参数在运行时决定。
- 不能明确传入函数的参数类型，需要在运行时处理任意对象。

## Go mod
### 初始化
go mod init
### go.mod 文件
- require语句指定的依赖项模块
- replace语句可以替换依赖项模块
- exclude语句可以忽略依赖项模块
### 开启
- go 1.15 后默认开启 go mod，以前需设置一个环境变量

## goroutine
### goroutine 和 thread 的区别
- oroutine 比 thread 内存占用少：goroutine 占用 2KB，thread 为 1MB
- goroutine 比 thread 创建、销毁成本低：thread 为内核态，创建、销毁消耗较高，goroutine 为用户态，由 go runtime 直接管理，消耗较小
- goroutine 比 thread 切换消耗低：thread 切换需要 1000 - 1500 ns，goroutine 仅需 200 ns
### goroutine 和 thread 关系
- goroutine 和 thread 直接相互独立
- goroutine 需要依赖 thread 进行执行
- scheduler 调度 goroutine 时将其关联至 thread 进行执行

## scheduler
- 职责：将所有处于 runnable 的 goroutines 均匀分布到在 P 上运行的 M
### 核心思想
- 线程重用
- 限制同时运行的线程数为 N，N 等于 CPU 的逻辑核心数，（不包含阻塞线程）
- 线程私有的 runqueues，并且可以从其他线程 stealing goroutine 来运行，线程阻塞后，可以将 runqueues 传递给其他线程。
### GPM 模型
- 概念：GPM 是指 go scheduler 中的三个核心组件
- G：代表一个 goroutine，包含：当前 goroutine 的状态，运行到的指令地址(PC 值)。
- P：代表一个虚拟的 Processor，它维护一个 g 队列，g 均为 Runnable 状态
（P 早期不存在，后续因为全局 g 队列有性能瓶颈而开发）
- M：表示内核线程，包含正在运行的 goroutine
### GRQ （global runqueues）
- 协程全局队列，优先级比 P 内的协程队列低
### LRQ （local runqueues）
- P 内的协程队列
### 运行期会发生的变化
- 线程阻塞（如系统调用，内核态）时会将其队列中的 goroutine 转移到其他 P 移交其他线程执行
- goroutine 阻塞（如 channel 读取阻塞）时，会将其调度走，让其它 goroutine 执行
- scheduler 启动的 sysmon 线程会检查运行时间超过 10ms 的协程，并将其调度到 global runqueues
- P 的 LRQ 没有 goroutine 时会从其它 P 拿走一半
- 全局队列中的携程，会定期被调度到 P 中

## GC 垃圾回收 （Garbage Collectio）
- 概念：自动内存管理的机制
### GC 的触发时机
- 主动调用 runtime.GC
- 两分钟内没有 GC 触发，则强制触发 GC
- 步调算法：GOGC 环境变量、debug.SetGCPercent 参数
### GC 算法
- 追踪式：从根对象出发，根据对象之间的引用信息，一步步推进直到扫描完毕整个堆并确定需要保留的对象，从而回收所有可回收的对象。
### 根对象
- 全局变量
- goroutine 执行栈
- 寄存器（值可能是指针）
### Golang GC 的特点（与 java 的区别）
- 无分代（对象没有代际之分）
分代 GC 依赖分代假设，即 GC 将主要的回收目标放在新创建的对象上（存活时间短，更倾向于被回收），而非频繁检查所有对象。但 Go 的编译器会通过逃逸分析将大部分新生对象存储在栈上（栈直接被回收），只有那些需要长期存在的对象才会被分配到需要进行垃圾回收的堆中。也就是说，分代 GC 回收的那些存活时间短的对象在 Go 中是直接被分配到栈上，当 goroutine 死亡后栈也会被直接回收，不需要 GC 的参与，进而分代假设并没有带来直接优势。并且 Go 的垃圾回收器与用户代码并发执行，使得 STW 的时间与对象的代际、对象的 size 没有关系。Go 团队更关注于如何更好地让 GC 与用户代码并发执行（使用适当的 CPU 来执行垃圾回收），而非减少停顿时间这一单一目标上。
- 不整理（回收过程中不对对象进行移动与整理）
对象整理的优势是解决内存碎片问题以及“允许”使用顺序内存分配器。但 Go 运行时的分配算法基于 tcmalloc，基本上没有碎片问题。 并且顺序内存分配器在多线程的场景下并不适用。Go 使用的是基于 tcmalloc 的现代内存分配算法，对对象进行整理不会带来实质性的性能提升。
- 并发（与用户代码并发执行）
### Golang 三色标级清除
- 白色对象（可能死亡）：未被回收器访问到的对象。在回收开始阶段，所有对象均为白色，当回收结束后，白色对象均不可达。
- 灰色对象（波面）：已被回收器访问到的对象，但回收器需要对其中的一个或多个指针进行扫描，因为他们可能还指向白色对象。
- 黑色对象（确定存活）：已被回收器访问到的对象，其中所有字段都已被扫描，黑色对象中任何一个指针都不可能直接指向白色对象。
当垃圾回收开始时，只有白色对象。随着标记过程开始进行时，灰色对象开始出现（着色），这时候波面便开始扩大。当一个对象的所有子节点均完成扫描时，会被着色为黑色。当整个堆遍历完成时，只剩下黑色和白色对象，这时的黑色对象为可达对象，即存活；而白色对象为不可达对象，即死亡。这个过程可以视为以灰色对象为波面，将黑色对象和白色对象分离，使波面不断向前推进，直到所有可达的灰色对象都变为黑色对象为止的过程
### STW
STW 在垃圾回收过程中为了保证实现的正确性、防止无止境的内存增长等问题而不可避免的需要停止赋值器进一步操作对象图的一段过程。

## 逃逸分析
- 定义：当一个对象的指针被多个方法或线程引用时，我们称这个指针发生了逃逸。
- Go语言的逃逸分析是编译器执行静态代码分析后，对内存管理进行的优化和简化，它可以决定一个变量是分配到堆还栈上。
- Go语言逃逸分析最基本的原则是：如果一个函数返回对一个变量的引用，那么它就会发生逃逸。
- Go中的变量只有在编译器可以证明在函数返回后不会再被引用的，才分配到栈上，其他情况下都是分配到堆上。


## Go Test
- 由 go test 命令和 testing 包构成，测试文件名以 _test.go 结尾
### go test 常用参数
-cpu: 指定测试的GOMAXPROCS值，默认是GOMAXPROCS当前值
-count: 运行单元测试和基准测试n次（默认1）。如设置了-cpu，则为每个GOMAXPROCS运行n次，示例函数总运行一次。
-cover: 启用覆盖率分析
-run: 执行功能测试函数，支持正则匹配，可以选择测试函数或者测试文件来仅测试单个函数或者单个文件
-bench: 执行基准测试函数，支持正则匹配
-benchtime: 基准测试最大时间上限
-parallel: 允许并行执行的最大测试数，默认情况下设置为GOMAXPROCS的值
-v: 展示测试过程信息
