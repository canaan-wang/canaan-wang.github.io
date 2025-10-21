# database/sql

## 概览
- 标准数据库抽象层，需配合驱动（如 `github.com/go-sql-driver/mysql`）。

## 常用用法
```go
db, _ := sql.Open("mysql", dsn)
defer db.Close()
var id int
_ = db.QueryRow("SELECT id FROM users WHERE name=?", name).Scan(&id)
```
- 预处理：`Prepare`/`Stmt`；批量：`Exec`；事务：`Begin`/`Commit`/`Rollback`。
- 连接池：驱动负责；可配置最大空闲/最大打开连接数。

## 技术原理
- 通过接口与驱动约定提供统一访问层；语义尽量保持与 SQL 接近。

## 最佳实践
- 使用上下文控制查询超时；参数化查询防止 SQL 注入。
- 处理 `Rows`、`Stmt` 的 `Close()`；合理配置连接池。