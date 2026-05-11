import{_ as u,C as c,o as t,c as d,a2 as l,b as i,w as s,a as n,E as o,a3 as r,j as e}from"./chunks/framework.CAKCj7G0.js";const v=JSON.parse('{"title":"InfluxDB Flux 查询语言核心解析：管道语法、聚合窗口与数据变换","description":"","frontmatter":{},"headers":[],"relativePath":"数据库/InfluxDB/InfluxDBFlux查询语言.md","filePath":"数据库/InfluxDB/InfluxDBFlux查询语言.md","lastUpdated":null}'),g={name:"数据库/InfluxDB/InfluxDBFlux查询语言.md"};function h(m,a,f,b,q,x){const p=c("Mermaid");return t(),d("div",null,[a[3]||(a[3]=l(`<h1 id="influxdb-flux-查询语言核心解析-管道语法、聚合窗口与数据变换" tabindex="-1">InfluxDB Flux 查询语言核心解析：管道语法、聚合窗口与数据变换 <a class="header-anchor" href="#influxdb-flux-查询语言核心解析-管道语法、聚合窗口与数据变换" aria-label="Permalink to &quot;InfluxDB Flux 查询语言核心解析：管道语法、聚合窗口与数据变换&quot;">​</a></h1><p>Flux 是 InfluxDB 2.x 引入的<strong>函数式管道查询语言</strong>，它的设计目标是统一时序数据的查询、转换、告警和任务编排。理解 Flux 的管道思维和核心函数，是掌握 InfluxDB 2.x 查询能力的关键。</p><hr><h2 id="flux-的设计哲学" tabindex="-1">Flux 的设计哲学 <a class="header-anchor" href="#flux-的设计哲学" aria-label="Permalink to &quot;Flux 的设计哲学&quot;">​</a></h2><h3 id="为什么需要-flux" tabindex="-1">为什么需要 Flux <a class="header-anchor" href="#为什么需要-flux" aria-label="Permalink to &quot;为什么需要 Flux&quot;">​</a></h3><p>InfluxDB 1.x 使用 <strong>InfluxQL</strong>（类 SQL 语法），在简单查询上表现良好，但面对复杂的时序分析场景时力不从心：</p><table tabindex="0"><thead><tr><th>场景</th><th>InfluxQL 局限</th><th>Flux 解决方式</th></tr></thead><tbody><tr><td>跨 bucket 联合查询</td><td>不支持</td><td><code>join()</code>、<code>union()</code> 原生支持</td></tr><tr><td>数据变换后重新写入</td><td>需借助外部工具</td><td><code>to()</code> 函数直接写回</td></tr><tr><td>复杂数学运算</td><td>函数有限</td><td><code>map()</code> 支持任意表达式</td></tr><tr><td>条件分支逻辑</td><td>不支持</td><td><code>filter()</code> + 多级管道实现</td></tr><tr><td>定时任务编排</td><td>依赖外部 Cron</td><td>内置 <code>task</code> 系统</td></tr></tbody></table><p>Flux 的核心设计思想：<strong>一切操作都是函数，函数通过管道 <code>|&gt;</code> 串联</strong>。这与 Unix Shell 的管道哲学一致——每个函数接收一个表（table），处理后再传给下一个函数。</p><h3 id="flux-vs-influxql-vs-sql-对比" tabindex="-1">Flux vs InfluxQL vs SQL 对比 <a class="header-anchor" href="#flux-vs-influxql-vs-sql-对比" aria-label="Permalink to &quot;Flux vs InfluxQL vs SQL 对比&quot;">​</a></h3><table tabindex="0"><thead><tr><th>维度</th><th>Flux</th><th>InfluxQL</th><th>SQL</th></tr></thead><tbody><tr><td><strong>语法范式</strong></td><td>函数式管道</td><td>声明式类 SQL</td><td>声明式标准 SQL</td></tr><tr><td><strong>时间处理</strong></td><td><code>range()</code> + <code>window()</code> 原生</td><td><code>WHERE time</code> + <code>GROUP BY time()</code></td><td><code>WHERE</code> + 窗口函数</td></tr><tr><td><strong>聚合能力</strong></td><td>丰富（内置 + 自定义）</td><td>中等（内置为主）</td><td>丰富（标准 + 扩展）</td></tr><tr><td><strong>Join 支持</strong></td><td>原生时序 Join</td><td>不支持</td><td>标准关系 Join</td></tr><tr><td><strong>数据写入</strong></td><td><code>to()</code> 直接写回</td><td><code>INTO</code> 子句</td><td><code>INSERT</code>/<code>UPDATE</code></td></tr><tr><td><strong>学习曲线</strong></td><td>中等（新范式）</td><td>低（类 SQL）</td><td>低（通用）</td></tr><tr><td><strong>生态成熟度</strong></td><td>Grafana 支持良好</td><td>历史工具多</td><td>极成熟</td></tr></tbody></table><blockquote><p><strong>选型建议</strong>：简单查询（单表聚合、时间过滤）用 InfluxQL 更顺手；复杂分析（多表关联、数据变换、任务编排）必须用 Flux。</p></blockquote><hr><h2 id="管道语法基础" tabindex="-1">管道语法基础 <a class="header-anchor" href="#管道语法基础" aria-label="Permalink to &quot;管道语法基础&quot;">​</a></h2><p>Flux 查询始终以 <code>from()</code> 开始，以消费结果结束。管道操作符 <code>|&gt;</code> 将左侧的表流传给右侧的函数。</p><h3 id="最简单的查询" tabindex="-1">最简单的查询 <a class="header-anchor" href="#最简单的查询" aria-label="Permalink to &quot;最简单的查询&quot;">​</a></h3><div class="language-flux vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">flux</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>from(bucket: &quot;my_bucket&quot;)</span></span>
<span class="line"><span>  |&gt; range(start: -1h)</span></span>
<span class="line"><span>  |&gt; filter(fn: (r) =&gt; r._measurement == &quot;cpu&quot;)</span></span>
<span class="line"><span>  |&gt; filter(fn: (r) =&gt; r._field == &quot;usage_user&quot;)</span></span></code></pre></div><p>执行流程：</p>`,17)),(t(),i(r,null,{default:s(()=>[o(p,{id:"mermaid-231",class:"mermaid",graph:"flowchart%20LR%0A%20%20%20%20A%5B%22from(bucket)%5Cn%E5%8A%A0%E8%BD%BD%E6%8C%87%E5%AE%9A%20bucket%22%5D%20--%3E%7C%20%7C%3E%20%7C%20B%5B%22range(start%3A-1h)%5Cn%E8%BF%87%E6%BB%A4%E6%9C%80%E8%BF%911%E5%B0%8F%E6%97%B6%22%5D%0A%20%20%20%20B%20--%3E%7C%20%7C%3E%20%7C%20C%5B%22filter(_measurement%3D%3Dcpu)%5Cn%E7%AD%9B%E9%80%89%20CPU%20%E6%8C%87%E6%A0%87%22%5D%0A%20%20%20%20C%20--%3E%7C%20%7C%3E%20%7C%20D%5B%22filter(_field%3D%3Dusage_user)%5Cn%E7%AD%9B%E9%80%89%E7%94%A8%E6%88%B7%E6%80%81%E4%BD%BF%E7%94%A8%E7%8E%87%22%5D%0A%20%20%20%20D%20--%3E%20E%5B%22%E8%BE%93%E5%87%BA%E7%BB%93%E6%9E%9C%E8%A1%A8%22%5D%0A"})]),fallback:s(()=>[...a[0]||(a[0]=[n(" Loading... ",-1)])]),_:1})),a[4]||(a[4]=e("h3",{id:"核心概念-表流-stream-of-tables",tabindex:"-1"},[n("核心概念：表流（Stream of Tables） "),e("a",{class:"header-anchor",href:"#核心概念-表流-stream-of-tables","aria-label":'Permalink to "核心概念：表流（Stream of Tables）"'},"​")],-1)),a[5]||(a[5]=e("p",null,[n("Flux 处理的不是单张表，而是"),e("strong",null,"表流"),n("——一系列具有相同 schema 的表。每个函数对表流中的每张表执行操作，然后传出新的表流。")],-1)),(t(),i(r,null,{default:s(()=>[o(p,{id:"mermaid-238",class:"mermaid",graph:"graph%20TD%0A%20%20%20%20subgraph%20%22%E8%BE%93%E5%85%A5%E8%A1%A8%E6%B5%81%22%0A%20%20%20%20%20%20%20%20T1%5B%22%E8%A1%A81%3A%20_measurement%3Dcpu%2C%20host%3DA%22%5D%0A%20%20%20%20%20%20%20%20T2%5B%22%E8%A1%A82%3A%20_measurement%3Dcpu%2C%20host%3DB%22%5D%0A%20%20%20%20%20%20%20%20T3%5B%22%E8%A1%A83%3A%20_measurement%3Dmem%2C%20host%3DA%22%5D%0A%20%20%20%20end%0A%0A%20%20%20%20F%5B%22filter(fn%3A%20(r)%20%3D%3E%20r._measurement%20%3D%3D%20%22cpu%22)%22%5D%0A%0A%20%20%20%20subgraph%20%22%E8%BE%93%E5%87%BA%E8%A1%A8%E6%B5%81%22%0A%20%20%20%20%20%20%20%20O1%5B%22%E8%A1%A81%3A%20_measurement%3Dcpu%2C%20host%3DA%22%5D%0A%20%20%20%20%20%20%20%20O2%5B%22%E8%A1%A82%3A%20_measurement%3Dcpu%2C%20host%3DB%22%5D%0A%20%20%20%20end%0A%0A%20%20%20%20T1%20--%3E%20F%0A%20%20%20%20T2%20--%3E%20F%0A%20%20%20%20T3%20--%3E%20F%0A%20%20%20%20F%20--%3E%20O1%0A%20%20%20%20F%20--%3E%20O2%0A"})]),fallback:s(()=>[...a[1]||(a[1]=[n(" Loading... ",-1)])]),_:1})),a[6]||(a[6]=l(`<hr><h2 id="核心函数详解" tabindex="-1">核心函数详解 <a class="header-anchor" href="#核心函数详解" aria-label="Permalink to &quot;核心函数详解&quot;">​</a></h2><h3 id="from-—-数据源指定" tabindex="-1">from() — 数据源指定 <a class="header-anchor" href="#from-—-数据源指定" aria-label="Permalink to &quot;from() — 数据源指定&quot;">​</a></h3><div class="language-flux vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">flux</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>from(bucket: &quot;metrics&quot;)</span></span></code></pre></div><table tabindex="0"><thead><tr><th>参数</th><th>类型</th><th>说明</th></tr></thead><tbody><tr><td><code>bucket</code></td><td>string</td><td>要查询的 bucket 名称（v2.x）</td></tr><tr><td><code>host</code></td><td>string</td><td>可选，指定远程 InfluxDB 地址</td></tr><tr><td><code>org</code></td><td>string</td><td>可选，指定 organization</td></tr></tbody></table><blockquote><p><strong>v1.x 映射</strong>：v1 的 <code>database</code> + <code>retention policy</code> 在 v2 中合并为 <code>bucket</code>。若从 v1 迁移，需将每个 <code>db.rp</code> 组合创建为一个 bucket。</p></blockquote><h3 id="range-—-时间范围过滤" tabindex="-1">range() — 时间范围过滤 <a class="header-anchor" href="#range-—-时间范围过滤" aria-label="Permalink to &quot;range() — 时间范围过滤&quot;">​</a></h3><p><strong>唯一必需参数</strong>，Flux 查询必须限定时间范围：</p><div class="language-flux vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">flux</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>// 相对时间</span></span>
<span class="line"><span>|&gt; range(start: -1h)        // 最近1小时</span></span>
<span class="line"><span>|&gt; range(start: -24h, stop: -1h)  // 昨天（排除最近1小时）</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 绝对时间</span></span>
<span class="line"><span>|&gt; range(start: 2024-01-01T00:00:00Z, stop: 2024-01-02T00:00:00Z)</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 混合</span></span>
<span class="line"><span>|&gt; range(start: 2024-01-01T00:00:00Z, stop: now())</span></span></code></pre></div><table tabindex="0"><thead><tr><th>参数</th><th>说明</th></tr></thead><tbody><tr><td><code>start</code></td><td>起始时间（必需），支持相对（<code>-1h</code>）或绝对（RFC3339）</td></tr><tr><td><code>stop</code></td><td>结束时间（可选，默认 <code>now()</code>）</td></tr></tbody></table><h3 id="filter-—-条件过滤" tabindex="-1">filter() — 条件过滤 <a class="header-anchor" href="#filter-—-条件过滤" aria-label="Permalink to &quot;filter() — 条件过滤&quot;">​</a></h3><div class="language-flux vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">flux</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>// 单条件</span></span>
<span class="line"><span>|&gt; filter(fn: (r) =&gt; r._measurement == &quot;cpu&quot;)</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 多条件 AND</span></span>
<span class="line"><span>|&gt; filter(fn: (r) =&gt; r._measurement == &quot;cpu&quot; and r.host == &quot;server01&quot;)</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 多条件 OR</span></span>
<span class="line"><span>|&gt; filter(fn: (r) =&gt; r.host == &quot;server01&quot; or r.host == &quot;server02&quot;)</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 正则匹配</span></span>
<span class="line"><span>|&gt; filter(fn: (r) =&gt; r.host =~ /^server[0-9]+$/)</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 排除匹配</span></span>
<span class="line"><span>|&gt; filter(fn: (r) =&gt; r.host !~ /^test-/)</span></span></code></pre></div><blockquote><p><strong>性能提示</strong>：<code>filter()</code> 对 tag 的过滤会走索引，对 field 的过滤需要全表扫描。尽量把过滤条件放在管道早期。</p></blockquote><h3 id="聚合函数" tabindex="-1">聚合函数 <a class="header-anchor" href="#聚合函数" aria-label="Permalink to &quot;聚合函数&quot;">​</a></h3><div class="language-flux vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">flux</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>// 基础聚合</span></span>
<span class="line"><span>|&gt; mean()           // 平均值</span></span>
<span class="line"><span>|&gt; sum()            // 求和</span></span>
<span class="line"><span>|&gt; count()          // 计数</span></span>
<span class="line"><span>|&gt; max()            // 最大值</span></span>
<span class="line"><span>|&gt; min()            // 最小值</span></span>
<span class="line"><span>|&gt; median()         // 中位数</span></span>
<span class="line"><span>|&gt; percentile(</span></span>
<span class="line"><span>      column: &quot;_value&quot;,</span></span>
<span class="line"><span>      q: 0.99        // P99</span></span>
<span class="line"><span>   )</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 变化率</span></span>
<span class="line"><span>|&gt; derivative(</span></span>
<span class="line"><span>      unit: 1s,      // 每秒变化率</span></span>
<span class="line"><span>      nonNegative: true</span></span>
<span class="line"><span>   )</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 差值</span></span>
<span class="line"><span>|&gt; difference(</span></span>
<span class="line"><span>      nonNegative: true</span></span>
<span class="line"><span>   )</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 累积和</span></span>
<span class="line"><span>|&gt; cumulativeSum()</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 移动平均</span></span>
<span class="line"><span>|&gt; movingAverage(n: 5)</span></span></code></pre></div><h3 id="aggregatewindow-—-时间窗口聚合" tabindex="-1">aggregateWindow() — 时间窗口聚合 <a class="header-anchor" href="#aggregatewindow-—-时间窗口聚合" aria-label="Permalink to &quot;aggregateWindow() — 时间窗口聚合&quot;">​</a></h3><p>时序查询中最常用的函数，按固定时间窗口分组并聚合：</p><div class="language-flux vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">flux</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>|&gt; aggregateWindow(</span></span>
<span class="line"><span>      every: 5m,           // 每 5 分钟一个窗口</span></span>
<span class="line"><span>      fn: mean,             // 窗口内取平均</span></span>
<span class="line"><span>      column: &quot;_value&quot;,      // 聚合目标列</span></span>
<span class="line"><span>      createEmpty: false     // 空窗口不生成记录</span></span>
<span class="line"><span>   )</span></span></code></pre></div>`,18)),(t(),i(r,null,{default:s(()=>[o(p,{id:"mermaid-359",class:"mermaid",graph:"timeline%0A%20%20%20%20title%20aggregateWindow(every%3A%205m%2C%20fn%3A%20mean)%20%E7%A4%BA%E6%84%8F%0A%20%20%20%20section%20%E5%8E%9F%E5%A7%8B%E6%95%B0%E6%8D%AE%0A%20%20%20%20%20%20%20%2010%3A00%20%3A%20value%3D10%0A%20%20%20%20%20%20%20%2010%3A01%20%3A%20value%3D20%0A%20%20%20%20%20%20%20%2010%3A02%20%3A%20value%3D30%0A%20%20%20%20%20%20%20%2010%3A03%20%3A%20value%3D40%0A%20%20%20%20%20%20%20%2010%3A04%20%3A%20value%3D50%0A%20%20%20%20%20%20%20%2010%3A05%20%3A%20value%3D60%0A%20%20%20%20%20%20%20%2010%3A06%20%3A%20value%3D70%0A%20%20%20%20section%20%E8%81%9A%E5%90%88%E5%90%8E%0A%20%20%20%20%20%20%20%2010%3A00%20%3A%20mean%3D30%0A%20%20%20%20%20%20%20%2010%3A05%20%3A%20mean%3D65%0A"})]),fallback:s(()=>[...a[2]||(a[2]=[n(" Loading... ",-1)])]),_:1})),a[7]||(a[7]=l(`<h3 id="window-—-原始窗口划分" tabindex="-1">window() — 原始窗口划分 <a class="header-anchor" href="#window-—-原始窗口划分" aria-label="Permalink to &quot;window() — 原始窗口划分&quot;">​</a></h3><p>只分组不聚合，需要配合 <code>aggregateWindow()</code> 或自定义聚合：</p><div class="language-flux vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">flux</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>|&gt; window(every: 1h)</span></span>
<span class="line"><span>|&gt; mean()</span></span>
<span class="line"><span>|&gt; duplicate(column: &quot;_start&quot;, as: &quot;_time&quot;)</span></span></code></pre></div><h3 id="pivot-—-宽表转长表" tabindex="-1">pivot() — 宽表转长表 <a class="header-anchor" href="#pivot-—-宽表转长表" aria-label="Permalink to &quot;pivot() — 宽表转长表&quot;">​</a></h3><p>将多个 field 的查询结果转为宽表格式，便于 Grafana 展示：</p><div class="language-flux vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">flux</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>from(bucket: &quot;metrics&quot;)</span></span>
<span class="line"><span>  |&gt; range(start: -1h)</span></span>
<span class="line"><span>  |&gt; filter(fn: (r) =&gt; r._measurement == &quot;cpu&quot;)</span></span>
<span class="line"><span>  |&gt; filter(fn: (r) =&gt; r._field == &quot;usage_user&quot; or r._field == &quot;usage_system&quot;)</span></span>
<span class="line"><span>  |&gt; aggregateWindow(every: 5m, fn: mean)</span></span>
<span class="line"><span>  |&gt; pivot(</span></span>
<span class="line"><span>      rowKey: [&quot;_time&quot;],</span></span>
<span class="line"><span>      columnKey: [&quot;_field&quot;],</span></span>
<span class="line"><span>      valueColumn: &quot;_value&quot;</span></span>
<span class="line"><span>   )</span></span>
<span class="line"><span>// 结果：_time | usage_user | usage_system</span></span></code></pre></div><h3 id="join-—-表关联" tabindex="-1">join() — 表关联 <a class="header-anchor" href="#join-—-表关联" aria-label="Permalink to &quot;join() — 表关联&quot;">​</a></h3><p>Flux 的 <code>join()</code> 通过 <strong>时间 + tag 的精确匹配</strong> 实现时序数据的关联：</p><div class="language-flux vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">flux</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>// 查询 CPU 数据</span></span>
<span class="line"><span>cpu = from(bucket: &quot;metrics&quot;)</span></span>
<span class="line"><span>  |&gt; range(start: -1h)</span></span>
<span class="line"><span>  |&gt; filter(fn: (r) =&gt; r._measurement == &quot;cpu&quot;)</span></span>
<span class="line"><span>  |&gt; filter(fn: (r) =&gt; r._field == &quot;usage_user&quot;)</span></span>
<span class="line"><span>  |&gt; aggregateWindow(every: 5m, fn: mean)</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 查询内存数据</span></span>
<span class="line"><span>mem = from(bucket: &quot;metrics&quot;)</span></span>
<span class="line"><span>  |&gt; range(start: -1h)</span></span>
<span class="line"><span>  |&gt; filter(fn: (r) =&gt; r._measurement == &quot;memory&quot;)</span></span>
<span class="line"><span>  |&gt; filter(fn: (r) =&gt; r._field == &quot;used_percent&quot;)</span></span>
<span class="line"><span>  |&gt; aggregateWindow(every: 5m, fn: mean)</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// join：按 _time 和 host 关联</span></span>
<span class="line"><span>cpu</span></span>
<span class="line"><span>  |&gt; join(</span></span>
<span class="line"><span>      tables: {mem: mem},</span></span>
<span class="line"><span>      on: [&quot;_time&quot;, &quot;host&quot;],</span></span>
<span class="line"><span>      method: &quot;inner&quot;</span></span>
<span class="line"><span>   )</span></span></code></pre></div><blockquote><p><strong>时序 Join 的特殊性</strong>：InfluxDB 的 join 以<strong>时间对齐</strong>为核心，不像 SQL 以键值匹配为主。如果两个序列的时间戳不完全一致，需先用 <code>aggregateWindow()</code> 对齐到相同粒度。</p></blockquote><hr><h2 id="完整查询示例" tabindex="-1">完整查询示例 <a class="header-anchor" href="#完整查询示例" aria-label="Permalink to &quot;完整查询示例&quot;">​</a></h2><h3 id="示例1-最近-1-小时的-cpu-平均值-按-host-分组" tabindex="-1">示例1：最近 1 小时的 CPU 平均值（按 host 分组） <a class="header-anchor" href="#示例1-最近-1-小时的-cpu-平均值-按-host-分组" aria-label="Permalink to &quot;示例1：最近 1 小时的 CPU 平均值（按 host 分组）&quot;">​</a></h3><div class="language-flux vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">flux</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>from(bucket: &quot;metrics&quot;)</span></span>
<span class="line"><span>  |&gt; range(start: -1h)</span></span>
<span class="line"><span>  |&gt; filter(fn: (r) =&gt; r._measurement == &quot;cpu&quot;)</span></span>
<span class="line"><span>  |&gt; filter(fn: (r) =&gt; r._field == &quot;usage_user&quot;)</span></span>
<span class="line"><span>  |&gt; aggregateWindow(every: 5m, fn: mean)</span></span>
<span class="line"><span>  |&gt; yield(name: &quot;cpu_mean&quot;)</span></span></code></pre></div><h3 id="示例2-top-5-内存使用率最高的服务器" tabindex="-1">示例2：Top 5 内存使用率最高的服务器 <a class="header-anchor" href="#示例2-top-5-内存使用率最高的服务器" aria-label="Permalink to &quot;示例2：Top 5 内存使用率最高的服务器&quot;">​</a></h3><div class="language-flux vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">flux</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>from(bucket: &quot;metrics&quot;)</span></span>
<span class="line"><span>  |&gt; range(start: -5m)</span></span>
<span class="line"><span>  |&gt; filter(fn: (r) =&gt; r._measurement == &quot;memory&quot;)</span></span>
<span class="line"><span>  |&gt; filter(fn: (r) =&gt; r._field == &quot;used_percent&quot;)</span></span>
<span class="line"><span>  |&gt; group(columns: [&quot;host&quot;])</span></span>
<span class="line"><span>  |&gt; last()</span></span>
<span class="line"><span>  |&gt; group()</span></span>
<span class="line"><span>  |&gt; sort(columns: [&quot;_value&quot;], desc: true)</span></span>
<span class="line"><span>  |&gt; limit(n: 5)</span></span></code></pre></div><h3 id="示例3-网络-io-流入流出对比-join-双序列" tabindex="-1">示例3：网络 IO 流入流出对比（join 双序列） <a class="header-anchor" href="#示例3-网络-io-流入流出对比-join-双序列" aria-label="Permalink to &quot;示例3：网络 IO 流入流出对比（join 双序列）&quot;">​</a></h3><div class="language-flux vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">flux</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>in_bytes = from(bucket: &quot;metrics&quot;)</span></span>
<span class="line"><span>  |&gt; range(start: -1h)</span></span>
<span class="line"><span>  |&gt; filter(fn: (r) =&gt; r._measurement == &quot;net&quot;)</span></span>
<span class="line"><span>  |&gt; filter(fn: (r) =&gt; r._field == &quot;bytes_recv&quot;)</span></span>
<span class="line"><span>  |&gt; aggregateWindow(every: 5m, fn: sum)</span></span>
<span class="line"><span></span></span>
<span class="line"><span>out_bytes = from(bucket: &quot;metrics&quot;)</span></span>
<span class="line"><span>  |&gt; range(start: -1h)</span></span>
<span class="line"><span>  |&gt; filter(fn: (r) =&gt; r._measurement == &quot;net&quot;)</span></span>
<span class="line"><span>  |&gt; filter(fn: (r) =&gt; r._field == &quot;bytes_sent&quot;)</span></span>
<span class="line"><span>  |&gt; aggregateWindow(every: 5m, fn: sum)</span></span>
<span class="line"><span></span></span>
<span class="line"><span>in_bytes</span></span>
<span class="line"><span>  |&gt; join(</span></span>
<span class="line"><span>      tables: {out: out_bytes},</span></span>
<span class="line"><span>      on: [&quot;_time&quot;, &quot;host&quot;],</span></span>
<span class="line"><span>      method: &quot;inner&quot;</span></span>
<span class="line"><span>   )</span></span>
<span class="line"><span>  |&gt; map(fn: (r) =&gt; ({r with ratio: r._value_in / r._value_out}))</span></span></code></pre></div><h3 id="示例4-磁盘使用率告警检测" tabindex="-1">示例4：磁盘使用率告警检测 <a class="header-anchor" href="#示例4-磁盘使用率告警检测" aria-label="Permalink to &quot;示例4：磁盘使用率告警检测&quot;">​</a></h3><div class="language-flux vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">flux</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>from(bucket: &quot;metrics&quot;)</span></span>
<span class="line"><span>  |&gt; range(start: -5m)</span></span>
<span class="line"><span>  |&gt; filter(fn: (r) =&gt; r._measurement == &quot;disk&quot;)</span></span>
<span class="line"><span>  |&gt; filter(fn: (r) =&gt; r._field == &quot;used_percent&quot;)</span></span>
<span class="line"><span>  |&gt; filter(fn: (r) =&gt; r._value &gt; 80.0)</span></span>
<span class="line"><span>  |&gt; map(fn: (r) =&gt; ({</span></span>
<span class="line"><span>      r with</span></span>
<span class="line"><span>      severity: if r._value &gt; 95.0 then &quot;CRITICAL&quot; else &quot;WARNING&quot;,</span></span>
<span class="line"><span>      message: &quot;Disk usage \${r._value}% on \${r.host}:\${r.path}&quot;</span></span>
<span class="line"><span>   }))</span></span></code></pre></div><h3 id="示例5-数据降采样后写入新-bucket" tabindex="-1">示例5：数据降采样后写入新 bucket <a class="header-anchor" href="#示例5-数据降采样后写入新-bucket" aria-label="Permalink to &quot;示例5：数据降采样后写入新 bucket&quot;">​</a></h3><div class="language-flux vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">flux</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>option task = {</span></span>
<span class="line"><span>    name: &quot;downsample_cpu&quot;,</span></span>
<span class="line"><span>    every: 1h,</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>from(bucket: &quot;metrics_raw&quot;)</span></span>
<span class="line"><span>  |&gt; range(start: -task.every)</span></span>
<span class="line"><span>  |&gt; filter(fn: (r) =&gt; r._measurement == &quot;cpu&quot;)</span></span>
<span class="line"><span>  |&gt; aggregateWindow(every: 5m, fn: mean)</span></span>
<span class="line"><span>  |&gt; to(bucket: &quot;metrics_5m&quot;)</span></span></code></pre></div><h3 id="示例6-同比环比分析" tabindex="-1">示例6：同比环比分析 <a class="header-anchor" href="#示例6-同比环比分析" aria-label="Permalink to &quot;示例6：同比环比分析&quot;">​</a></h3><div class="language-flux vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">flux</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>// 本周数据</span></span>
<span class="line"><span>this_week = from(bucket: &quot;metrics&quot;)</span></span>
<span class="line"><span>  |&gt; range(start: -7d, stop: now())</span></span>
<span class="line"><span>  |&gt; filter(fn: (r) =&gt; r._measurement == &quot;requests&quot;)</span></span>
<span class="line"><span>  |&gt; filter(fn: (r) =&gt; r._field == &quot;count&quot;)</span></span>
<span class="line"><span>  |&gt; aggregateWindow(every: 1d, fn: sum)</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 上周同期（shift 7天）</span></span>
<span class="line"><span>last_week = from(bucket: &quot;metrics&quot;)</span></span>
<span class="line"><span>  |&gt; range(start: -14d, stop: -7d)</span></span>
<span class="line"><span>  |&gt; filter(fn: (r) =&gt; r._measurement == &quot;requests&quot;)</span></span>
<span class="line"><span>  |&gt; filter(fn: (r) =&gt; r._field == &quot;count&quot;)</span></span>
<span class="line"><span>  |&gt; aggregateWindow(every: 1d, fn: sum)</span></span>
<span class="line"><span>  |&gt; timeShift(duration: 7d)</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// join 对比</span></span>
<span class="line"><span>this_week</span></span>
<span class="line"><span>  |&gt; join(</span></span>
<span class="line"><span>      tables: {last: last_week},</span></span>
<span class="line"><span>      on: [&quot;_time&quot;],</span></span>
<span class="line"><span>      method: &quot;inner&quot;</span></span>
<span class="line"><span>   )</span></span>
<span class="line"><span>  |&gt; map(fn: (r) =&gt; ({</span></span>
<span class="line"><span>      r with</span></span>
<span class="line"><span>      growth_rate: (r._value - r._value_last) / r._value_last * 100.0</span></span>
<span class="line"><span>   }))</span></span></code></pre></div><h3 id="示例7-异常检测-3-sigma-法则" tabindex="-1">示例7：异常检测（3-sigma 法则） <a class="header-anchor" href="#示例7-异常检测-3-sigma-法则" aria-label="Permalink to &quot;示例7：异常检测（3-sigma 法则）&quot;">​</a></h3><div class="language-flux vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">flux</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>// 计算均值和标准差</span></span>
<span class="line"><span>stats = from(bucket: &quot;metrics&quot;)</span></span>
<span class="line"><span>  |&gt; range(start: -24h)</span></span>
<span class="line"><span>  |&gt; filter(fn: (r) =&gt; r._measurement == &quot;api_latency&quot;)</span></span>
<span class="line"><span>  |&gt; filter(fn: (r) =&gt; r._field == &quot;duration&quot;)</span></span>
<span class="line"><span>  |&gt; reduce(</span></span>
<span class="line"><span>      fn: (r, accumulator) =&gt; ({</span></span>
<span class="line"><span>          sum: accumulator.sum + r._value,</span></span>
<span class="line"><span>          count: accumulator.count + 1,</span></span>
<span class="line"><span>          sumsq: accumulator.sumsq + r._value * r._value</span></span>
<span class="line"><span>      }),</span></span>
<span class="line"><span>      identity: {sum: 0.0, count: 0, sumsq: 0.0}</span></span>
<span class="line"><span>   )</span></span>
<span class="line"><span>  |&gt; map(fn: (r) =&gt; ({</span></span>
<span class="line"><span>      mean: r.sum / float(v: r.count),</span></span>
<span class="line"><span>      stddev: math.sqrt(x: (r.sumsq / float(v: r.count)) - (r.sum / float(v: r.count)) * (r.sum / float(v: r.count)))</span></span>
<span class="line"><span>   }))</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 检测当前异常点</span></span>
<span class="line"><span>from(bucket: &quot;metrics&quot;)</span></span>
<span class="line"><span>  |&gt; range(start: -5m)</span></span>
<span class="line"><span>  |&gt; filter(fn: (r) =&gt; r._measurement == &quot;api_latency&quot;)</span></span>
<span class="line"><span>  |&gt; filter(fn: (r) =&gt; r._field == &quot;duration&quot;)</span></span>
<span class="line"><span>  |&gt; map(fn: (r) =&gt; ({</span></span>
<span class="line"><span>      r with</span></span>
<span class="line"><span>      is_anomaly: r._value &gt; stats.mean + 3.0 * stats.stddev</span></span>
<span class="line"><span>   }))</span></span></code></pre></div><hr><h2 id="调试技巧" tabindex="-1">调试技巧 <a class="header-anchor" href="#调试技巧" aria-label="Permalink to &quot;调试技巧&quot;">​</a></h2><h3 id="使用-yield-查看中间结果" tabindex="-1">使用 yield() 查看中间结果 <a class="header-anchor" href="#使用-yield-查看中间结果" aria-label="Permalink to &quot;使用 yield() 查看中间结果&quot;">​</a></h3><div class="language-flux vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">flux</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>from(bucket: &quot;metrics&quot;)</span></span>
<span class="line"><span>  |&gt; range(start: -1h)</span></span>
<span class="line"><span>  |&gt; filter(fn: (r) =&gt; r._measurement == &quot;cpu&quot;)</span></span>
<span class="line"><span>  |&gt; yield(name: &quot;after_filter&quot;)</span></span>
<span class="line"><span>  |&gt; aggregateWindow(every: 5m, fn: mean)</span></span>
<span class="line"><span>  |&gt; yield(name: &quot;after_agg&quot;)</span></span></code></pre></div><h3 id="使用-influx-cli-测试-flux-查询" tabindex="-1">使用 influx CLI 测试 Flux 查询 <a class="header-anchor" href="#使用-influx-cli-测试-flux-查询" aria-label="Permalink to &quot;使用 influx CLI 测试 Flux 查询&quot;">​</a></h3><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 直接执行 Flux 查询</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">influx</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> query</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">from(bucket: &quot;metrics&quot;)</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">  |&gt; range(start: -1h)</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">  |&gt; filter(fn: (r) =&gt; r._measurement == &quot;cpu&quot;)</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">  |&gt; limit(n: 10)</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 从文件执行</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">influx</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> query</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> --file</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> query.flux</span></span></code></pre></div><h3 id="web-ui-data-explorer-自动生成-flux" tabindex="-1">Web UI Data Explorer 自动生成 Flux <a class="header-anchor" href="#web-ui-data-explorer-自动生成-flux" aria-label="Permalink to &quot;Web UI Data Explorer 自动生成 Flux&quot;">​</a></h3><p>打开 <code>http://localhost:8086</code> → Data Explorer → 选择 bucket/measurement/field → 点击 <strong>Script Editor</strong> 查看自动生成的 Flux 代码，是学习 Flux 的最佳途径。</p><hr><h2 id="flux-在-3-x-中的变化" tabindex="-1">Flux 在 3.x 中的变化 <a class="header-anchor" href="#flux-在-3-x-中的变化" aria-label="Permalink to &quot;Flux 在 3.x 中的变化&quot;">​</a></h2><p>InfluxDB 3.x 大幅改变了 Flux 的地位：</p><table tabindex="0"><thead><tr><th>版本</th><th>Flux 支持状态</th><th>推荐查询语言</th></tr></thead><tbody><tr><td><strong>2.x</strong></td><td>原生主推</td><td>Flux</td></tr><tr><td><strong>3.x</strong></td><td><strong>已弃用</strong></td><td>InfluxQL / 标准 SQL</td></tr></tbody></table><p>3.x 不再内置 Flux 引擎，社区对 Flux 的接受度低于预期是主要原因。如果你在 2.x 上投入了大量 Flux 查询，迁移到 3.x 时需要改写为 InfluxQL 或 SQL。</p><blockquote><p><strong>学习建议</strong>：如果你是新用户，建议优先掌握 <strong>InfluxQL</strong>（兼容 1.x/2.x/3.x 三代）和基础 Flux（用于 2.x 环境）。不要深度投入 Flux 的高级特性，除非确定长期停留在 2.x。</p></blockquote>`,40))])}const _=u(g,[["render",h]]);export{v as __pageData,_ as default};
