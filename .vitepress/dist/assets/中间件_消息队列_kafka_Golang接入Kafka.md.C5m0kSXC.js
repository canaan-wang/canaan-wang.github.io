import{_ as a,o as n,c as i,a2 as p}from"./chunks/framework.CAKCj7G0.js";const g=JSON.parse('{"title":"Golang 接入 Kafka","description":"","frontmatter":{},"headers":[],"relativePath":"中间件/消息队列/kafka/Golang接入Kafka.md","filePath":"中间件/消息队列/kafka/Golang接入Kafka.md","lastUpdated":1765279874000}'),l={name:"中间件/消息队列/kafka/Golang接入Kafka.md"};function t(e,s,h,k,r,o){return n(),i("div",null,[...s[0]||(s[0]=[p(`<h1 id="golang-接入-kafka" tabindex="-1">Golang 接入 Kafka <a class="header-anchor" href="#golang-接入-kafka" aria-label="Permalink to &quot;Golang 接入 Kafka&quot;">​</a></h1><h1 id="一、前置准备" tabindex="-1">一、前置准备 <a class="header-anchor" href="#一、前置准备" aria-label="Permalink to &quot;一、前置准备&quot;">​</a></h1><h2 id="_1-1-环境要求" tabindex="-1">1.1 环境要求 <a class="header-anchor" href="#_1-1-环境要求" aria-label="Permalink to &quot;1.1 环境要求&quot;">​</a></h2><ul><li><p>Kafka 集群：推荐 2.8.0+ 版本（支持 KRaft 模式，无 ZK 依赖）</p></li><li><p>Golang：1.16+ 版本（支持 Go Modules 依赖管理）</p></li><li><p>客户端库：sarama v1.38.1+（稳定版，兼容主流 Kafka 版本）</p></li></ul><h2 id="_1-2-依赖安装" tabindex="-1">1.2 依赖安装 <a class="header-anchor" href="#_1-2-依赖安装" aria-label="Permalink to &quot;1.2 依赖安装&quot;">​</a></h2><p>在项目根目录执行以下命令，引入 sarama 依赖：</p><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 初始化模块（首次创建项目时执行）</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">go</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> mod</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> init</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> kafka-demo</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 安装 sarama 客户端</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">go</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> get</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> github.com/Shopify/sarama@v1.38.1</span></span></code></pre></div><h1 id="二、核心概念适配-golang视角" tabindex="-1">二、核心概念适配（Golang视角） <a class="header-anchor" href="#二、核心概念适配-golang视角" aria-label="Permalink to &quot;二、核心概念适配（Golang视角）&quot;">​</a></h1><p>需明确 Kafka 核心概念与 sarama 库的对应关系，避免配置混淆：</p><table tabindex="0"><thead><tr><th>Kafka 概念</th><th>sarama 库对应对象/配置</th><th>核心作用</th></tr></thead><tbody><tr><td>Broker 集群</td><td>配置中的 <code>Net.DialTimeout</code> 等网络参数</td><td>指定集群节点地址，控制连接超时</td></tr><tr><td>Topic 主题</td><td>生产者 <code>SendMessage</code> 时指定</td><td>消息的分类容器，需提前创建</td></tr><tr><td>Partition 分区</td><td>生产者 <code>Msg.Partition</code> 或分区器</td><td>控制消息发送到的分区，实现并行</td></tr><tr><td>Consumer Group 消费者组</td><td>消费者 <code>NewConsumerGroup</code> 时指定</td><td>组内消费者分摊消费分区，避免重复消费</td></tr></tbody></table><h1 id="三、生产者实现-发送消息" tabindex="-1">三、生产者实现（发送消息） <a class="header-anchor" href="#三、生产者实现-发送消息" aria-label="Permalink to &quot;三、生产者实现（发送消息）&quot;">​</a></h1><h2 id="_3-1-核心逻辑" tabindex="-1">3.1 核心逻辑 <a class="header-anchor" href="#_3-1-核心逻辑" aria-label="Permalink to &quot;3.1 核心逻辑&quot;">​</a></h2><ol><li><p>配置生产者参数（重点：ACK 级别、重试机制）；</p></li><li><p>创建生产者实例；</p></li><li><p>构造消息并发送；</p></li><li><p>关闭资源。</p></li></ol><h2 id="_3-2-精简代码" tabindex="-1">3.2 精简代码 <a class="header-anchor" href="#_3-2-精简代码" aria-label="Permalink to &quot;3.2 精简代码&quot;">​</a></h2><div class="language-go vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">go</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">package</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> main</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">import</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">	&quot;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">fmt</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">	&quot;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">log</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">	&quot;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">github.com/Shopify/sarama</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 全局配置（可根据环境调整）</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">	KafkaBrokers</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;192.168.1.100:9092,192.168.1.101:9092&quot;</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> // 集群地址</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">	TopicName</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    =</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;user-login-topic&quot;</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">                       // 主题（需提前创建）</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">func</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> main</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">() {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">	// 1. 配置生产者参数</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">	config </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> sarama.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">NewConfig</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">()</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">	config.Producer.RequiredAcks </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> sarama.WaitForAll </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// ACK级别：等待所有副本确认（最可靠）</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">	config.Producer.Retry.Max </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 3</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">                    // 重试次数：失败后重试3次</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">	config.Producer.Return.Successes </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> true</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">          // 启用成功消息回调</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">	config.Version </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> sarama.V2_8_0_0                 </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 适配Kafka版本</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">	// 2. 创建生产者实例</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">	producer, err </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> sarama.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">NewSyncProducer</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(strings.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">Split</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(KafkaBrokers, </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;,&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">), config)</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">	if</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> err </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">!=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> nil</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">		log.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">Fatalf</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;创建生产者失败：</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">%v</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, err)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">	}</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">	defer</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> producer.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">Close</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">() </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 退出时关闭资源</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">	// 3. 构造并发送消息</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">	msg </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:=</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> &amp;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">sarama</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">ProducerMessage</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">{</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">		Topic: TopicName,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">		Key:   sarama.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">StringEncoder</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;user_1001&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">), </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 消息Key：用于分区路由（同Key走同分区）</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">		Value: sarama.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">StringEncoder</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;用户1001登录成功&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">),  </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 消息内容</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">	}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">	// 同步发送消息（返回分区和偏移量）</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">	partition, offset, err </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> producer.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">SendMessage</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(msg)</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">	if</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> err </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">!=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> nil</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">		log.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">Printf</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;发送消息失败：</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">%v</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, err)</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">		return</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">	}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">	fmt.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">Printf</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;消息发送成功：分区=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">%d</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">, 偏移量=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">%d\\n</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, partition, offset)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><h2 id="_3-3-关键配置说明" tabindex="-1">3.3 关键配置说明 <a class="header-anchor" href="#_3-3-关键配置说明" aria-label="Permalink to &quot;3.3 关键配置说明&quot;">​</a></h2><ul><li><p><code>RequiredAcks</code>：ACK级别决定可靠性与吞吐量平衡，<code>WaitForAll</code>（生产环境推荐）、<code>WaitForLocal</code>（仅主副本确认）、<code>NoResponse</code>（不确认，最快但不可靠）。</p></li><li><p><code>Retry.Max</code>：网络抖动时自动重试，建议设置 3-5 次。</p></li><li><p><code>Version</code>：必须与 Kafka 集群版本匹配，否则可能出现兼容性问题。</p></li></ul><h1 id="四、消费者实现-消费消息" tabindex="-1">四、消费者实现（消费消息） <a class="header-anchor" href="#四、消费者实现-消费消息" aria-label="Permalink to &quot;四、消费者实现（消费消息）&quot;">​</a></h1><h2 id="_4-1-核心逻辑" tabindex="-1">4.1 核心逻辑 <a class="header-anchor" href="#_4-1-核心逻辑" aria-label="Permalink to &quot;4.1 核心逻辑&quot;">​</a></h2><ol><li><p>配置消费者参数（重点：消费起始位置、重平衡策略）；</p></li><li><p>创建消费者组实例；</p></li><li><p>实现消息处理回调；</p></li><li><p>启动消费循环。</p></li></ol><h2 id="_4-2-精简代码-基础串行版" tabindex="-1">4.2 精简代码（基础串行版） <a class="header-anchor" href="#_4-2-精简代码-基础串行版" aria-label="Permalink to &quot;4.2 精简代码（基础串行版）&quot;">​</a></h2><div class="language-Plain vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">Plain</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span></span></span>
<span class="line"><span></span></span>
<span class="line"><span>package main</span></span>
<span class="line"><span></span></span>
<span class="line"><span>import (</span></span>
<span class="line"><span>	&quot;context&quot;</span></span>
<span class="line"><span>	&quot;log&quot;</span></span>
<span class="line"><span>	&quot;strings&quot;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>	&quot;github.com/Shopify/sarama&quot;</span></span>
<span class="line"><span>)</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 全局配置</span></span>
<span class="line"><span>const (</span></span>
<span class="line"><span>	KafkaBrokers = &quot;192.168.1.100:9092,192.168.1.101:9092&quot;</span></span>
<span class="line"><span>	TopicName    = &quot;user-login-topic&quot;</span></span>
<span class="line"><span>	ConsumerGroup = &quot;user-login-group&quot; // 消费者组名称</span></span>
<span class="line"><span>)</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 自定义消息处理器（实现sarama.ConsumerGroupHandler接口）</span></span>
<span class="line"><span>type LoginMsgHandler struct{}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 消费消息的核心方法</span></span>
<span class="line"><span>func (h *LoginMsgHandler) ConsumeClaim(sess sarama.ConsumerGroupSession, claim sarama.ConsumerGroupClaim) error {</span></span>
<span class="line"><span>	// 循环获取消息</span></span>
<span class="line"><span>	for msg := range claim.Messages() {</span></span>
<span class="line"><span>		log.Printf(</span></span>
<span class="line"><span>			&quot;收到消息：主题=%s, 分区=%d, 偏移量=%d, Key=%s, 内容=%s&quot;,</span></span>
<span class="line"><span>			msg.Topic, msg.Partition, msg.Offset, string(msg.Key), string(msg.Value),</span></span>
<span class="line"><span>		)</span></span>
<span class="line"><span>		sess.MarkMessage(msg, &quot;&quot;) // 标记消息已消费（提交偏移量）</span></span>
<span class="line"><span>	}</span></span>
<span class="line"><span>	return nil</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 以下两个方法为接口必填，默认实现即可</span></span>
<span class="line"><span>func (h *LoginMsgHandler) Setup(sess sarama.ConsumerGroupSession) error { return nil }</span></span>
<span class="line"><span>func (h *LoginMsgHandler) Cleanup(sess sarama.ConsumerGroupSession) error { return nil }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>func main() {</span></span>
<span class="line"><span>	// 1. 配置消费者参数</span></span>
<span class="line"><span>	config := sarama.NewConfig()</span></span>
<span class="line"><span>	config.Consumer.Group.Rebalance.Strategy = sarama.BalanceStrategyRange // 重平衡策略：范围分配</span></span>
<span class="line"><span>	config.Consumer.Offsets.Initial = sarama.OffsetNewest                  // 起始消费位置：最新消息</span></span>
<span class="line"><span>	config.Consumer.Offsets.CommitInterval = 1 * time.Second               // 偏移量提交间隔</span></span>
<span class="line"><span>	config.Version = sarama.V2_8_0_0</span></span>
<span class="line"><span></span></span>
<span class="line"><span>	// 2. 创建消费者组实例</span></span>
<span class="line"><span>	consumerGroup, err := sarama.NewConsumerGroup(strings.Split(KafkaBrokers, &quot;,&quot;), ConsumerGroup, config)</span></span>
<span class="line"><span>	if err != nil {</span></span>
<span class="line"><span>		log.Fatalf(&quot;创建消费者组失败：%v&quot;, err)</span></span>
<span class="line"><span>	}</span></span>
<span class="line"><span>	defer consumerGroup.Close()</span></span>
<span class="line"><span></span></span>
<span class="line"><span>	// 3. 启动消费循环（持续监听消息）</span></span>
<span class="line"><span>	handler := &amp;LoginMsgHandler{}</span></span>
<span class="line"><span>	ctx := context.Background()</span></span>
<span class="line"><span></span></span>
<span class="line"><span>	for {</span></span>
<span class="line"><span>		// 订阅主题并消费（出错后重试）</span></span>
<span class="line"><span>		err := consumerGroup.Consume(ctx, []string{TopicName}, handler)</span></span>
<span class="line"><span>		if err != nil {</span></span>
<span class="line"><span>			log.Printf(&quot;消费出错：%v，重试中...&quot;, err)</span></span>
<span class="line"><span>			time.Sleep(3 * time.Second)</span></span>
<span class="line"><span>		}</span></span>
<span class="line"><span>	}</span></span>
<span class="line"><span>}</span></span></code></pre></div><h2 id="_4-3-单个消费者并发消费实现-进阶版" tabindex="-1">4.3 单个消费者并发消费实现（进阶版） <a class="header-anchor" href="#_4-3-单个消费者并发消费实现-进阶版" aria-label="Permalink to &quot;4.3 单个消费者并发消费实现（进阶版）&quot;">​</a></h2><p>sarama 本身支持单个消费者实例内通过“多协程+通道分发”实现并发消费，核心是在 ConsumeClaim 中启动协程池处理消息，需注意偏移量提交的线程安全。</p><h3 id="_4-3-1-并发消费代码" tabindex="-1">4.3.1 并发消费代码 <a class="header-anchor" href="#_4-3-1-并发消费代码" aria-label="Permalink to &quot;4.3.1 并发消费代码&quot;">​</a></h3><div class="language-Plain vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">Plain</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span></span></span>
<span class="line"><span></span></span>
<span class="line"><span>package main</span></span>
<span class="line"><span></span></span>
<span class="line"><span>import (</span></span>
<span class="line"><span>	&quot;context&quot;</span></span>
<span class="line"><span>	&quot;log&quot;</span></span>
<span class="line"><span>	&quot;strings</span></span>
<span class="line"><span>	&quot;sync&quot;</span></span>
<span class="line"><span>	&quot;time&quot;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>	&quot;github.com/Shopify/sarama&quot;</span></span>
<span class="line"><span>)</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 全局配置</span></span>
<span class="line"><span>const (</span></span>
<span class="line"><span>	KafkaBrokers   = &quot;192.168.1.100:9092,192.168.1.101:9092&quot;</span></span>
<span class="line"><span>	TopicName      = &quot;user-login-topic&quot;</span></span>
<span class="line"><span>	ConsumerGroup  = &quot;user-login-group&quot;</span></span>
<span class="line"><span>	GoroutineCount = 5 // 协程池大小，控制并发度</span></span>
<span class="line"><span>)</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// ConcurrentMsgHandler 并发消息处理器</span></span>
<span class="line"><span>type ConcurrentMsgHandler struct {</span></span>
<span class="line"><span>	wg *sync.WaitGroup</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 初始化协程池</span></span>
<span class="line"><span>func (h *ConcurrentMsgHandler) Setup(sess sarama.ConsumerGroupSession) error {</span></span>
<span class="line"><span>	h.wg = &amp;sync.WaitGroup{}</span></span>
<span class="line"><span>	return nil</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 消费消息：分发到协程池处理</span></span>
<span class="line"><span>func (h *ConcurrentMsgHandler) ConsumeClaim(sess sarama.ConsumerGroupSession, claim sarama.ConsumerGroupClaim) error {</span></span>
<span class="line"><span>	// 创建带缓冲通道，用于分发消息</span></span>
<span class="line"><span>	msgChan := make(chan *sarama.ConsumerMessage, GoroutineCount*2)</span></span>
<span class="line"><span></span></span>
<span class="line"><span>	// 启动协程池</span></span>
<span class="line"><span>	for i := 0; i &lt; GoroutineCount; i++ {</span></span>
<span class="line"><span>		h.wg.Add(1)</span></span>
<span class="line"><span>		go h.processMsg(sess, msgChan)</span></span>
<span class="line"><span>	}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>	// 从claim获取消息并发送到通道</span></span>
<span class="line"><span>	for msg := range claim.Messages() {</span></span>
<span class="line"><span>		msgChan &lt;- msg</span></span>
<span class="line"><span>	}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>	// 关闭通道并等待所有协程处理完成</span></span>
<span class="line"><span>	close(msgChan)</span></span>
<span class="line"><span>	h.wg.Wait()</span></span>
<span class="line"><span>	return nil</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// processMsg 协程处理消息逻辑</span></span>
<span class="line"><span>func (h *ConcurrentMsgHandler) processMsg(sess sarama.ConsumerGroupSession, msgChan &lt;-chan *sarama.ConsumerMessage) {</span></span>
<span class="line"><span>	defer h.wg.Done()</span></span>
<span class="line"><span>	for msg := range msgChan {</span></span>
<span class="line"><span>		// 模拟业务处理（如数据库写入、接口调用）</span></span>
<span class="line"><span>		err := h.handleBusiness(msg)</span></span>
<span class="line"><span>		if err != nil {</span></span>
<span class="line"><span>			log.Printf(&quot;处理消息失败：offset=%d, err=%v&quot;, msg.Offset, err)</span></span>
<span class="line"><span>			// 可根据业务配置重试机制</span></span>
<span class="line"><span>			continue</span></span>
<span class="line"><span>		}</span></span>
<span class="line"><span>		// 处理成功后提交偏移量（线程安全）</span></span>
<span class="line"><span>		sess.MarkMessage(msg, &quot;&quot;)</span></span>
<span class="line"><span>		log.Printf(</span></span>
<span class="line"><span>			&quot;并发处理消息成功：协程ID=%d, 分区=%d, 偏移量=%d&quot;,</span></span>
<span class="line"><span>			goroutineID(), msg.Partition, msg.Offset,</span></span>
<span class="line"><span>		)</span></span>
<span class="line"><span>	}</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span>	</span></span>
<span class="line"><span>// handleBusiness 模拟业务逻辑</span></span>
<span class="line"><span>func (h *ConcurrentMsgHandler) handleBusiness(msg *sarama.ConsumerMessage) error {</span></span>
<span class="line"><span>	time.Sleep(100 * time.Millisecond) // 模拟耗时处理</span></span>
<span class="line"><span>	log.Printf(&quot;处理消息内容：Key=%s, Value=%s&quot;, string(msg.Key), string(msg.Value))</span></span>
<span class="line"><span>	return nil</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// goroutineID 模拟获取协程ID（仅用于日志展示）</span></span>
<span class="line"><span>func goroutineID() uint64 {</span></span>
<span class="line"><span>	// 实际生产可使用runtime包获取，此处简化处理</span></span>
<span class="line"><span>	var id uint64</span></span>
<span class="line"><span>	_ = id</span></span>
<span class="line"><span>	// runtime.ReadGoroutineID(&amp;id)</span><span> // Go 1.21+支持</span></span>
<span class="line"><span>	return id</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// Cleanup 消费结束清理资源</span></span>
<span class="line"><span>func (h *ConcurrentMsgHandler) Cleanup(sess sarama.ConsumerGroupSession) error {</span></span>
<span class="line"><span>	return nil</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>func main() {</span></span>
<span class="line"><span>	config := sarama.NewConfig()</span></span>
<span class="line"><span>	config.Consumer.Group.Rebalance.Strategy = sarama.BalanceStrategyRange</span></span>
<span class="line"><span>	config.Consumer.Offsets.Initial = sarama.OffsetNewest</span></span>
<span class="line"><span>	config.Consumer.Offsets.CommitInterval = 1 * time.Second</span></span>
<span class="line"><span>	config.Version = sarama.V2_8_0_0</span></span>
<span class="line"><span></span></span>
<span class="line"><span>	// 关键配置：关闭自动提交，确保手动提交线程安全</span></span>
<span class="line"><span>	config.Consumer.Offsets.AutoCommit.Enable = false</span></span>
<span class="line"><span></span></span>
<span class="line"><span>	consumerGroup, err := sarama.NewConsumerGroup(strings.Split(KafkaBrokers, &quot;,&quot;), ConsumerGroup, config)</span></span>
<span class="line"><span>	if err != nil {</span></span>
<span class="line"><span>		log.Fatalf(&quot;创建消费者组失败：%v&quot;, err)</span></span>
<span class="line"><span>	}</span></span>
<span class="line"><span>	defer consumerGroup.Close()</span></span>
<span class="line"><span></span></span>
<span class="line"><span>	handler := &amp;ConcurrentMsgHandler{}</span></span>
<span class="line"><span>	ctx := context.Background()</span></span>
<span class="line"><span></span></span>
<span class="line"><span>	for {</span></span>
<span class="line"><span>		err := consumerGroup.Consume(ctx, []string{TopicName}, handler)</span></span>
<span class="line"><span>		if err != nil {</span></span>
<span class="line"><span>			log.Printf(&quot;消费出错：%v，重试中...&quot;, err)</span></span>
<span class="line"><span>			time.Sleep(3 * time.Second)</span></span>
<span class="line"><span>		}</span></span>
<span class="line"><span>	}</span></span>
<span class="line"><span>}</span></span></code></pre></div><h3 id="_4-3-2-核心实现要点" tabindex="-1">4.3.2 核心实现要点 <a class="header-anchor" href="#_4-3-2-核心实现要点" aria-label="Permalink to &quot;4.3.2 核心实现要点&quot;">​</a></h3><ul><li><p><strong>协程池设计</strong>：通过固定大小的协程池（GoroutineCount）控制并发度，避免协程泛滥导致资源耗尽，通道缓冲大小建议设为协程数的2倍，平衡消息分发效率。</p></li><li><p><strong>偏移量安全</strong>：必须关闭自动提交（<code>AutoCommit.Enable = false</code>），在消息处理成功后手动调用 <code>MarkMessage</code>，sarama 会保证偏移量提交的线程安全。</p></li><li><p><strong>资源同步</strong>：使用 <code>sync.WaitGroup</code> 等待所有协程处理完成后再退出 ConsumeClaim，避免消息未处理完就触发重平衡。</p></li><li><p><strong>故障处理</strong>：业务处理失败时需添加重试机制（如有限次重试后放入死信队列），避免单条坏消息阻塞整个协程。</p></li></ul><div class="language-go vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">go</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">package</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> main</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">import</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">	&quot;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">context</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">	&quot;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">log</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">	&quot;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">strings</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">	&quot;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">github.com/Shopify/sarama</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 全局配置</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">	KafkaBrokers</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;192.168.1.100:9092,192.168.1.101:9092&quot;</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">	TopicName</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    =</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;user-login-topic&quot;</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">	ConsumerGroup</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;user-login-group&quot;</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> // 消费者组名称</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 自定义消息处理器（实现sarama.ConsumerGroupHandler接口）</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">type</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> LoginMsgHandler</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> struct</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">{}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 消费消息的核心方法</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">func</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">h </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">*</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">LoginMsgHandler</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">ConsumeClaim</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">sess</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> sarama</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">ConsumerGroupSession</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">claim</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> sarama</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">ConsumerGroupClaim</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">error</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">	// 循环获取消息</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">	for</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> msg </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:=</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> range</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> claim.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">Messages</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">() {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">		log.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">Printf</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">			&quot;收到消息：主题=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">%s</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">, 分区=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">%d</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">, 偏移量=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">%d</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">, Key=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">%s</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">, 内容=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">%s</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">			msg.Topic, msg.Partition, msg.Offset, </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(msg.Key), </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(msg.Value),</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">		)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">		sess.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">MarkMessage</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(msg, </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 标记消息已消费（提交偏移量）</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">	}</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">	return</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> nil</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 以下两个方法为接口必填，默认实现即可</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">func</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">h </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">*</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">LoginMsgHandler</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">Setup</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">sess</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> sarama</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">ConsumerGroupSession</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">error</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">return</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> nil</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> }</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">func</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">h </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">*</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">LoginMsgHandler</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">Cleanup</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">sess</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> sarama</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">ConsumerGroupSession</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">error</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">return</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> nil</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> }</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">func</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> main</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">() {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">	// 1. 配置消费者参数</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">	config </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> sarama.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">NewConfig</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">()</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">	config.Consumer.Group.Rebalance.Strategy </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> sarama.BalanceStrategyRange </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 重平衡策略：范围分配</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">	config.Consumer.Offsets.Initial </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> sarama.OffsetNewest                  </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 起始消费位置：最新消息</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">	config.Consumer.Offsets.CommitInterval </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 1</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> *</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> time.Second               </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 偏移量提交间隔</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">	config.Version </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> sarama.V2_8_0_0</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">	// 2. 创建消费者组实例</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">	consumerGroup, err </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> sarama.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">NewConsumerGroup</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(strings.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">Split</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(KafkaBrokers, </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;,&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">), ConsumerGroup, config)</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">	if</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> err </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">!=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> nil</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">		log.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">Fatalf</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;创建消费者组失败：</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">%v</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, err)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">	}</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">	defer</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> consumerGroup.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">Close</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">()</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">	// 3. 启动消费循环（持续监听消息）</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">	handler </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:=</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> &amp;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">LoginMsgHandler</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">{}</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">	ctx </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> context.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">Background</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">()</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">	for</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">		// 订阅主题并消费（出错后重试）</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">		err </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> consumerGroup.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">Consume</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(ctx, []</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">{TopicName}, handler)</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">		if</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> err </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">!=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> nil</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">			log.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">Printf</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;消费出错：</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">%v</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">，重试中...&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, err)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">			time.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">Sleep</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">3</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> *</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> time.Second)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">		}</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">	}</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><h2 id="_4-3-关键配置说明" tabindex="-1">4.3 关键配置说明 <a class="header-anchor" href="#_4-3-关键配置说明" aria-label="Permalink to &quot;4.3 关键配置说明&quot;">​</a></h2><ul><li><p><code>Rebalance.Strategy</code>：重平衡策略决定分区分配方式，<code>BalanceStrategyRange</code>（范围分配，默认）、<code>BalanceStrategyRoundRobin</code>（轮询分配）。</p></li><li><p><code>Offsets.Initial</code>：首次消费时的起始位置，<code>OffsetNewest</code>（最新消息，默认）、<code>OffsetOldest</code>（从头消费，用于数据回溯）。</p></li><li><p><code>MarkMessage</code>：手动提交偏移量的核心方法，必须在消息处理完成后调用。不建议用自动提交（<code>config.Consumer.Offsets.AutoCommit.Enable = true</code>），因自动提交按固定间隔执行，可能出现“消息未处理完就提交”导致数据丢失，或“处理完未提交就故障”导致重复消费。手动提交可精准控制提交时机，适配复杂业务场景。</p></li></ul><h1 id="五、安全认证配置-生产环境必备" tabindex="-1">五、安全认证配置（生产环境必备） <a class="header-anchor" href="#五、安全认证配置-生产环境必备" aria-label="Permalink to &quot;五、安全认证配置（生产环境必备）&quot;">​</a></h1><p>若 Kafka 集群启用 SASL 认证（如 PLAIN 用户名密码）或 TLS 加密，需补充以下配置，生产者和消费者配置逻辑一致。</p><h2 id="_5-1-sasl-认证-plain-机制" tabindex="-1">5.1 SASL 认证（PLAIN 机制） <a class="header-anchor" href="#_5-1-sasl-认证-plain-机制" aria-label="Permalink to &quot;5.1 SASL 认证（PLAIN 机制）&quot;">​</a></h2><div class="language-go vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">go</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 在创建config后添加以下配置</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">config.Net.SASL.Enable </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> true</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">config.Net.SASL.Mechanism </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> sarama.SASLTypePlaintext</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">config.Net.SASL.User </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;kafka-user&quot;</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">      // 认证用户名</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">config.Net.SASL.Password </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;kafka-pass&quot;</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  // 认证密码</span></span></code></pre></div><h2 id="_5-2-tls-加密传输" tabindex="-1">5.2 TLS 加密传输 <a class="header-anchor" href="#_5-2-tls-加密传输" aria-label="Permalink to &quot;5.2 TLS 加密传输&quot;">​</a></h2><div class="language-go vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">go</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">import</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">crypto/tls</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 在创建config后添加以下配置</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">config.Net.TLS.Enable </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> true</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">config.Net.TLS.Config </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> &amp;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">tls</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">Config</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">{</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">	InsecureSkipVerify: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">false</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 生产环境禁用跳过证书验证</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">	RootCAs:            x509.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">NewCertPool</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(), </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 加载根证书（需替换为实际证书路径）</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 加载根证书（示例：从文件加载）</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">certBytes, _ </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> os.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">ReadFile</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;ca.crt&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">config.Net.TLS.Config.RootCAs.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">AppendCertsFromPEM</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(certBytes)</span></span></code></pre></div><h1 id="六、避坑指南-团队分享重点" tabindex="-1">六、避坑指南（团队分享重点） <a class="header-anchor" href="#六、避坑指南-团队分享重点" aria-label="Permalink to &quot;六、避坑指南（团队分享重点）&quot;">​</a></h1><ol><li><p><strong>版本兼容性</strong>：<code>config.Version</code> 必须与 Kafka 集群版本一致，否则可能出现“消息发送失败”“重平衡异常”等问题。</p></li><li><p><strong>分区路由</strong>：若需同类型消息有序消费，需指定 <code>Msg.Key</code>（同 Key 会路由到同一分区），但需避免 Key 分布不均导致分区负载失衡。</p></li><li><p><strong>资源关闭</strong>：生产者和消费者必须调用 <code>Close()</code> 关闭，否则会导致连接泄漏，集群压力增大。</p></li><li><p><strong>偏移量管理</strong>：优先选择手动提交偏移量（<code>MarkMessage</code>），而非自动提交。自动提交的核心问题：① 按固定间隔提交（如配置的1秒），若消息处理耗时超过间隔，会出现“未处理完就提交”，故障后消息丢失；② 若处理完未到提交间隔就故障，会导致重复消费。手动提交在“消息处理完成后”主动提交，精准控制提交时机，完全规避上述问题，尤其适配数据库写入、接口调用等耗时场景。</p></li><li><p><strong>集群地址配置</strong>：需填写所有 Broker 节点地址，而非仅主节点，否则节点故障时无法自动切换。</p></li><li><p><strong>消费顺序控制</strong>：单个应用的单个消费者实例中，同一分区的消息默认串行消费（按偏移量顺序处理）。若需并行消费同一主题，需通过“增加分区数+启动多个消费者实例”实现；单个实例内不建议并行处理同一分区消息，会破坏消息有序性。若业务允许乱序且需提升单实例消费能力，可采用“协程池+通道”方案（见4.3节），但需确保偏移量提交安全。</p></li></ol><h1 id="七、快速测试流程" tabindex="-1">七、快速测试流程 <a class="header-anchor" href="#七、快速测试流程" aria-label="Permalink to &quot;七、快速测试流程&quot;">​</a></h1><ol><li><p>创建主题：<code>kafka-topics.sh --bootstrap-server 192.168.1.100:9092 --create --topic user-login-topic --partitions 3 --replication-factor 2</code></p></li><li><p>启动消费者：<code>go run consumer.go</code></p></li><li><p>启动生产者：<code>go run producer.go</code></p></li><li><p>查看结果：消费者控制台打印收到的消息，生产者控制台打印发送成功的分区和偏移量。</p></li></ol><blockquote><p>（注：文档部分内容可能由 AI 生成）</p></blockquote>`,42)])])}const E=a(l,[["render",t]]);export{g as __pageData,E as default};
