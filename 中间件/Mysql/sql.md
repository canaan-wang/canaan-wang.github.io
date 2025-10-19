# 数据库、表、索引
## create
- 创建数据库
```sql
create database db_name
```
- 创建表
```sql
create table if not exists `table_name`(
   `col1` type 列的限定 ,
   PRIMARY KEY ( `主键列` ),
   INDEX [index_name] (pre_len) // index 可修改为对应的 index_type
)ENGINE=指定引擎 DEFAULT CHARSET=编码方式;
```
- 创建索引
```sql
create [index_type] index index_name on table_name (col1, col2 ...)
```

## drop
- 删除数据库
```sql
drop database db_name
```
- 删除表
```sql
drop table table_name
```
- 删除索引
```sql
drop index index_name on table_name
```

## alter
- 删除表字段
```sql
alter table table_name drop col1
```
- 添加表字段
```sql
alter table table_name add col1 type ... [FIRST/AFTER c] // FIRST 创建在第一列， AFTER 创建在 c 列之后
```
- 修改表字段
```sql
alter table table_name modify col type ... [FIRST/AFTER c]
```
- 修改表名
```sql
alter table table_name rename to table_name
- 创建索引
alter table table_name add index index_name(col1,col2 ...) // index 可以修改为对应的 index 类型

## use
```sql
use db_name
```
- 选择数据库

# 数据操作
## insert
```sql
insert into table_name(列名列表) values (对应数据)
```
- 插入数据

## select
```sql
select 列名列表 from table_name
```
- 查询数据

## update
```sql
update table_name set col1=val1, col2=val2
```
- 更新数据

## delete
```sql
delete from table_name
```
- 删除数据

## where
- 指定条件：可配合 select、update、delete 使用
```sql
where condition1 And/OR condition2
```

## like
- 在 where 语句中的 condition 中使用，用于判断 col 值的模糊匹配
```sql
col1 like '格式' // 可用 % 来表示任意字符，通常为 % 与其它字符组成的一个字符串
```

## union
- 用于将多个 select 语句查询结果做并集
```sql
select ...
union [all/distinct] // all 不会去重， distinct 去重，默认为 distinct
select ...
```

## order by
- 用于将查询结果排序，配合 select 进行使用
```sql
order by col_name [ASC/DESC] // ASC 升序， DESC 降序，默认为升序
```

## group by
- 用于将查询结果进行分组，配合 select 使用，select 中非 group by 指定的列，可以使用函数进行统计（count、sum、avg）
```sql
select col1, col2, count(col3), avg(col4)
...
group by col1, col2
```

## NULL
- 判断 NULL 是否为 NULL
```sql
col1 IS NULL // 是 NULL 则返回 true
col2 IS NOT NULL // 不是 NULL 则返回 true
col1 <=> 'val1' // 两个值相等 or 均为 NULL 则返回 true
```

## regexp
- 用于 SQL 中的正则表达式匹配，用于 where 的 condition 中
``` sql
col1 regexp '正则表达式'
```

# 事务
## begin、start transaction
- 事务开启

## commit、commit work
- 事务提交

## rollback、rollback work
- 事物回滚

## savepoint
- 创建保存点，事务中允许多个
```sql
savepoint point_name(自定义名称)
```

## release savepoint 
- 删除一个保存点，保存点不存在则会抛异常
```sql
release savepoint point_name(自定义名称)
```

## rollback to
- 事务回滚到保存点
```sql
rollback to point_name
```

## set transaction
- 设置事务的隔离级别
- READ UNCOMMITTED
- READ COMMITTED
- REPEATABLE READ
- SERIALIZABLE。

# 列修饰
## AUTO_INCREMENT
- 修饰列，表示列为自增列