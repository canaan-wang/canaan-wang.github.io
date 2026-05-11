# AGENTS.md — Canaan 的技术花园

> 本文档供 AI 编码助手阅读，帮助其快速理解本项目结构、技术栈与内容规范。

---

## 项目概述

本项目是 **Canaan 的个人技术知识库与博客**，站点标题为 "欢迎来到我的花园"。

- **站点地址**：通过 GitHub Pages 部署，`https://canaan-wang.github.io`
- **构建工具**：[VitePress](https://vitepress.dev/) v1.6.4
- **内容语言**：简体中文（`zh-CN`）
- **内容规模**：约 180 篇 Markdown 技术文档
- **主题**：基于 VitePress 默认主题，配合自定义 CSS 与 Mermaid 图表支持

> **历史背景**：项目早期使用 Docsify 搭建（遗留 `documentation/` 目录），现已完全迁移至 VitePress。`documentation/` 与 `public/assets/cover-theme.js` 等文件为旧版残留，不参与当前构建。

---

## 技术栈

| 层级 | 技术 |
|---|---|
| 静态站点生成器 | VitePress 1.6.4 |
| 图表插件 | `vitepress-plugin-mermaid` 2.0.17 |
| 语法高亮 | Shiki（内置），并注册了自定义 Flux 语法（`.vitepress/flux.tmLanguage.json`） |
| 运行时 | Node.js 20（CI 指定版本） |
| 包管理器 | npm |
| 部署平台 | GitHub Pages |

### 依赖

- **开发依赖**：`vitepress`, `vitepress-plugin-mermaid`
- **无运行时依赖**（纯静态站点）

---

## 项目结构

```
.
├── index.md                      # 首页（Hero + Features 配置）
├── README.md                     # 站点介绍页（个人 Q&A）
├── package.json                  # npm 配置与脚本
├── .npmrc                        # npm 配置：include=dev
├── .gitignore                    # Git 忽略规则
├── .nojekyll                     # 禁用 Jekyll 处理（GitHub Pages）
│
├── .vitepress/
│   ├── config.mjs                # VitePress 核心配置（导航、侧边栏、搜索、主题）
│   ├── flux.tmLanguage.json      # InfluxDB Flux 查询语言自定义语法高亮
│   ├── theme/
│   │   ├── index.js              # 主题入口：继承 DefaultTheme 并加载自定义样式
│   │   └── custom.css            # 自定义样式：中文字体、宽屏适配、表格、Mermaid 容器
│   ├── cache/                    # 构建缓存（gitignored）
│   └── dist/                     # 构建输出目录（gitignored）
│
├── .github/
│   └── workflows/
│       └── deploy.yml            # GitHub Actions：push 到 main 时自动构建并部署到 Pages
│
├── public/
│   └── assets/
│       ├── logo.svg              # 站点 Logo
│       └── cover-theme.js        # ⚠️ 旧版 Docsify 残留，当前未使用
│
├── .trae/rules/
│   └── project_rules.md          # 内容创作规范（见下文「文档编写规范」）
│
├── documentation/                # ⚠️ 旧版 Docsify 站点残留，不参与当前构建
│
├── Go/                           # Go 语言与框架
│   ├── Golang/                   #   Go 基础语法、并发、GC、GMP 等
│   └── 框架/                     #   go-zero、gorm、elastic、testify
│
├── Java/                         # Java 生态
│   ├── Java/                     #   Java 基础、集合、并发、JVM
│   ├── MyBatis/                  #   MyBatis 笔记
│   └── Spring/                   #   Spring / Spring Boot / Spring Cloud
│
├── 数据库/                       # 数据库专题
│   ├── ES/                       #   Elasticsearch 查询语法
│   ├── InfluxDB/                 #   InfluxDB 数据模型、Flux、TSM 引擎等
│   ├── Mysql/                    #   MySQL 索引、MVCC
│   └── Redis/                    #   Redis 数据结构、命令、存储类型
│
├── 理论/                         # 计算机理论与设计原则
│   ├── API设计/                  #   RESTful / RPC API
│   ├── SOLID设计原则/            #   SOLID 五大原则
│   ├── 分布式系统/               #   一致性、分布式锁、分布式事务
│   ├── 数据库/                   #   数据库原理（锁、概览）
│   ├── 数据结构/                 #   数据结构（skiplist 等）
│   ├── 计算机网络/               #   网络协议
│   └── 领域驱动设计/             #   DDD 概览
│
├── 中间件/                       # 中间件与基础设施
│   ├── Docker/
│   ├── 消息队列/                 #   Kafka 等
│   ├── 缓存/                     #   Redis 中间件视角
│   └── 配置中心/                 #   Apollo
│
├── web前端/                      # 前端技术
│   └── HTML/
│
├── me/工作/                      # 个人工作记录、简历、项目介绍
│
├── 生活/                         # 生活随笔
│   └── 菜品/                     #   菜谱分享
│
└── Linux/                        # Linux 笔记
```

### 内容目录命名约定

- 所有内容目录使用**中文命名**（如 `数据库/`, `理论/`, `中间件/`）
- Markdown 文件也普遍使用中文文件名（如 `Go语言概览.md`, `索引.md`）
- VitePress 配置中 `cleanUrls: true`，访问时无需 `.html` 后缀

---

## 构建与开发命令

所有命令通过 npm scripts 执行：

```bash
# 安装依赖
npm ci

# 启动本地开发服务器
npm run docs:dev

# 构建静态站点（输出到 .vitepress/dist）
npm run docs:build

# 预览生产构建
npm run docs:preview
```

---

## 部署流程

项目采用 **GitHub Actions + GitHub Pages** 全自动部署：

1. **触发条件**：`push` 到 `main` 分支，或手动触发 `workflow_dispatch`
2. **构建作业**：
   - 检出代码（`actions/checkout@v4`，`fetch-depth: 0` 以支持 `lastUpdated`）
   - 设置 Node.js 20
   - `npm ci` 安装依赖
   - `npm run docs:build` 构建
   - 上传 `.vitepress/dist` 为 Pages artifact
3. **部署作业**：依赖构建作业，使用 `actions/deploy-pages@v4` 部署到 GitHub Pages

**无需手动构建或提交 dist 目录。**

---

## 文档编写规范

项目根目录下的 `.trae/rules/project_rules.md` 定义了严格的内容创作规范。AI 助手在协助编写或整理 Markdown 文档时，**必须遵守以下规则**：

### 标题层级
- 文章**必须**有一级标题（`# 标题`），用于展示文档标题
- 目录/模块标题**必须**为二级标题（`## 标题`），每个二级标题代表一个独立的能力模块
- **禁止使用三级及以下标题**
- 目录中**不要重复**文章标题（如文章标题为 "Mysql"，目录里不要再出现 "mysql" 字段）

### 强调样式
- 重点突出使用 `entry`（行内代码）或 **etry**（加粗）
- **禁止混合使用**，例如：\*`entry`\*、\*\*1`entry`\*\*、`entry`2 等情况均不允许

### 内容排版
- 模块之间使用**分割线**（`---`）分隔
- Mermaid 图表需要**分散**在文档的不同位置，**不要集中在一起**
- 文章不需要手动添加目录——VitePress 会自动生成页面右侧的目录导航
- 文章在网页上的渲染宽度可放置约 **80 个中文字符**，需保证内容不要过于稀疏
- 二级标题应能链接到关键信息，方便目录导航跳转

### 内容整理原则
- 用户对话通常是要求"帮我整理文档"
- "整理文件内容"指**直接修改文档文件**，不需要将内容发到对话框
- 将对话形式的原始内容整理为**可分享的知识文档**
- **禁止增加原文档外的内容**，但可以调整语气、语法、格式
- 允许根据文档本身内容进行适当合并，但必须保证内容正确
- 文档整体格式需优美，达到可以在行业分享的程度

---

## VitePress 配置要点

配置集中在 `.vitepress/config.mjs`，关键设定：

| 配置项 | 说明 |
|---|---|
| `lang: 'zh-CN'` | 站点语言 |
| `lastUpdated: true` | 显示页面最后更新时间 |
| `cleanUrls: true` | 干净 URL（无 `.html`） |
| `ignoreDeadLinks: true` | 构建时忽略死链，不中断 |
| `metaChunk: true` | 提取页面 meta 为独立 chunk |
| `srcExclude` | 排除 `**/_sidebar.md`, `**/_navbar.md`, `**/_coverpage.md`（Docsify 遗留文件） |
| `markdown.html: false` | 禁用原始 HTML（安全） |
| `search.provider: 'local'` | 本地搜索 |

### 导航与侧边栏

- `themeConfig.nav`：顶部导航栏，按技术领域分类（Web前端 / Java / Go / 数据库 / 理论 / 中间件）
- `themeConfig.sidebar`：左侧侧边栏，按目录路径配置，结构庞大（覆盖所有内容分类）
- 侧边栏配置需与文件实际路径保持同步，新增文档时需要手动在 `config.mjs` 中注册

---

## 自定义主题

- `.vitepress/theme/index.js`：继承 `DefaultTheme`，仅加载自定义 CSS
- `.vitepress/theme/custom.css`：
  - 中文字体栈优化（PingFang SC、Microsoft YaHei 等）
  - 等宽字体栈（JetBrains Mono、Fira Code 等）
  - 宽屏（`≥1440px`）下增大内容区域最大宽度至 `900px`
  - 表格字体缩小至 `14px`
  - Mermaid 图表居中显示

---

## 安全与注意事项

- **无后端、无数据库、无用户认证**：纯静态站点，无传统安全攻击面
- **禁用原始 HTML**：`markdown.html: false`，防止 Markdown 中嵌入恶意脚本
- **环境变量**：项目不使用 `.env` 文件，无敏感配置
- **CI 权限**：GitHub Actions workflow 使用最小权限原则（`contents: read`, `pages: write`, `id-token: write`）

---

## 常见问题

**Q：新增一篇 Markdown 文章后，为什么侧边栏没有显示？**
A：VitePress 的侧边栏为手动配置，需要在 `.vitepress/config.mjs` 的 `themeConfig.sidebar` 中对应路径下添加条目。

**Q：构建时报 "dead links" 错误怎么办？**
A：配置中已开启 `ignoreDeadLinks: true`，构建不会因此中断。但建议修复死链以保证用户体验。

**Q：如何支持新的编程语言语法高亮？**
A：VitePress 使用 Shiki。如需自定义语法，参考 `flux.tmLanguage.json` 的注册方式，在 `config.mjs` 的 `markdown.shikiSetup` 中加载。
