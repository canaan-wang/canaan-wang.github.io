import { defineConfig } from 'vitepress'
import { withMermaid } from 'vitepress-plugin-mermaid'
import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default withMermaid({
  title: "Canaan' Blog",
  description: '拥有一颗平静的心，才能看到诗和远方',
  lang: 'zh-CN',
  lastUpdated: true,
  cleanUrls: true,
  metaChunk: true,
  srcExclude: ['**/_sidebar.md', '**/_navbar.md', '**/_coverpage.md'],
  ignoreDeadLinks: true,

  markdown: {
    html: true,
    async shikiSetup(highlighter) {
      const fluxGrammar = JSON.parse(
        readFileSync(resolve(__dirname, 'flux.tmLanguage.json'), 'utf-8')
      )
      await highlighter.loadLanguage(fluxGrammar)
    }
  },

  head: [
    ['link', { rel: 'icon', href: '/assets/logo.svg' }],
  ],

  themeConfig: {
    nav: [
  {
        'text': 'Web前端',
        'items': [
      {
            'text': 'HTML',
            'link': '/web前端/HTML/介绍'
      }
    ]
  },
  {
        'text': 'CSS',
        'items': []
  },
  {
        'text': 'JavaScript',
        'items': []
  },
  {
        'text': 'Java',
        'items': [
      {
            'text': 'Java 语言',
            'link': '/Java/Java/Java语言概览'
      },
      {
            'text': 'Spring',
            'link': '/Java/Spring/Spring概览'
      }
    ]
  },
  {
        'text': 'Go',
        'items': [
      {
            'text': 'Go 语言',
            'link': '/Go/Golang/Go语言概览'
      },
      {
            'text': '框架',
            'link': '/Go/框架/gorm/概览'
      }
    ]
  },
  {
        'text': '数据库',
        'items': [
      {
            'text': 'Mysql',
            'link': '/数据库/Mysql/Mysql'
      },
      {
            'text': 'Redis',
            'link': '/数据库/Redis/Redis'
      },
      {
            'text': 'ES',
            'link': '/数据库/ES/查询语法'
      },
      {
            'text': 'InfluxDB',
            'link': '/数据库/InfluxDB/InfluxDB概览'
      }
    ]
  },
  {
        'text': 'Linux',
        'items': [
      {
            'text': 'Linux',
            'link': '/Linux/SSH密钥免密登录'
      }
    ]
  },
  {
        'text': 'macOS',
        'items': [
      {
            'text': '命令行常用命令',
            'link': '/macOS/命令行常用命令'
      }
    ]
  },
  {
        'text': '理论',
        'items': [
      {
            'text': '数据结构',
            'link': '/理论/数据结构/skiplist'
      },
      {
            'text': '数据库原理',
            'link': '/理论/数据库/概览'
      },
      {
            'text': '分布式系统',
            'link': '/理论/分布式系统/一致性/一致性'
      },
      {
            'text': 'SOLID 设计原则',
            'link': '/理论/SOLID设计原则/SOLID设计原则'
      },
      {
            'text': '领域驱动设计',
            'link': '/理论/领域驱动设计/领域驱动设计概览'
      },
      {
            'text': 'API设计',
            'link': '/理论/API设计/RestFulAPI'
      }
    ]
  },
  {
        'text': '中间件',
        'items': [
      {
            'text': '数据库',
            'link': '/中间件/数据库/数据库概览'
      },
      {
            'text': '缓存',
            'link': '/中间件/缓存/Redis/Redis概览'
      },
      {
            'text': '消息队列',
            'link': '/中间件/消息队列/kafka/Kafka'
      },
      {
            'text': '配置中心',
            'link': '/中间件/配置中心/Apollo/Apollo概览'
      }
    ]
  }
],

    sidebar: {
      '/': [
    {
          'text': '首页',
          'link': '/'
    }
  ],
      '/Go/Golang/': [
    {
          'text': '概览',
          'items': [
        {
              'text': 'Go语言概览',
              'link': '/Go/Golang/Go语言概览'
        }
      ]
    },
    {
          'text': '基础',
          'items': [
        {
              'text': 'package',
              'link': '/Go/Golang/基础/package'
        },
        {
              'text': '变量与常量',
              'link': '/Go/Golang/基础/变量与常量'
        },
        {
              'text': '函数',
              'link': '/Go/Golang/基础/函数'
        },
        {
              'text': '结构体与方法',
              'link': '/Go/Golang/基础/结构体与方法'
        },
        {
              'text': '控制流',
              'link': '/Go/Golang/基础/控制流'
        },
        {
              'text': '错误处理',
              'link': '/Go/Golang/基础/错误处理'
        },
        {
              'text': '接口',
              'link': '/Go/Golang/基础/接口'
        },
        {
              'text': '包管理',
              'link': '/Go/Golang/基础/包管理'
        },
        {
              'text': '类型转换与断言',
              'link': '/Go/Golang/基础/类型转换与断言'
        },
        {
              'text': 'Workspace',
              'link': '/Go/Golang/基础/Workspace'
        }
      ]
    },
    {
          'text': '复合数据类型',
          'items': [
        {
              'text': 'map',
              'link': '/Go/Golang/复合数据类型/map'
        },
        {
              'text': 'slice',
              'link': '/Go/Golang/复合数据类型/slice'
        },
        {
              'text': 'channel',
              'link': '/Go/Golang/复合数据类型/channel'
        }
      ]
    },
    {
          'text': '特性',
          'items': [
        {
              'text': '泛型',
              'link': '/Go/Golang/特性/泛型'
        },
        {
              'text': 'GC',
              'link': '/Go/Golang/特性/GC'
        },
        {
              'text': 'GMP',
              'link': '/Go/Golang/特性/GMP'
        },
        {
              'text': 'pointer',
              'link': '/Go/Golang/特性/pointer'
        },
        {
              'text': 'context',
              'link': '/Go/Golang/特性/context'
        }
      ]
    },
    {
          'text': '关键字',
          'items': [
        {
              'text': 'for-range',
              'link': '/Go/Golang/关键字/for-range'
        },
        {
              'text': 'defer',
              'link': '/Go/Golang/关键字/defer'
        }
      ]
    },
    {
          'text': 'sync',
          'items': [
        {
              'text': 'Map 老版',
              'link': '/Go/Golang/sync/sync_Map(old)'
        },
        {
              'text': 'Map hashtriemap',
              'link': '/Go/Golang/sync/sync_Map(new)'
        },
        {
              'text': 'WaitGroup',
              'link': '/Go/Golang/sync/wait_group'
        },
        {
              'text': 'Pool',
              'link': '/Go/Golang/sync/pool'
        }
      ]
    }
  ],
      '/Go/框架/': [
    {
          'text': 'go-zero',
          'items': [
        {
              'text': 'Go-Zero概览',
              'link': '/Go/框架/go-zero/Go-Zero'
        },
        {
              'text': '链路追踪',
              'link': '/Go/框架/go-zero/go-zero-tracing'
        }
      ]
    },
    {
          'text': 'gorm',
          'items': [
        {
              'text': 'gorm 概览',
              'link': '/Go/框架/gorm/概览'
        },
        {
              'text': '使用方式',
              'link': '/Go/框架/gorm/使用方式'
        }
      ]
    },
    {
          'text': 'elastic',
          'items': [
        {
              'text': '介绍',
              'link': '/Go/框架/elastic/介绍'
        },
        {
              'text': '使用方式',
              'link': '/Go/框架/elastic/使用方式'
        }
      ]
    },
    {
          'text': 'testify',
          'items': [
        {
              'text': 'Testify',
              'link': '/Go/框架/testify/testify'
        },
        {
              'text': 'Mock 实现原理',
              'link': '/Go/框架/testify/mock实现原理'
        }
      ]
    }
  ],
      '/Java/Java/': [
    {
          'text': '基础',
          'items': [
        {
              'text': 'Class',
              'link': '/Java/Java/基础/1-Class'
        },
        {
              'text': 'Interface',
              'link': '/Java/Java/基础/2-Interface'
        },
        {
              'text': '判断比较方式',
              'link': '/Java/Java/基础/3-判断比较方式'
        },
        {
              'text': '循环遍历方式',
              'link': '/Java/Java/基础/4-循环遍历方式'
        },
        {
              'text': '泛型',
              'link': '/Java/Java/基础/5-泛型'
        },
        {
              'text': '反射',
              'link': '/Java/Java/基础/6-反射'
        },
        {
              'text': 'String',
              'link': '/Java/Java/基础/7-String'
        }
      ]
    },
    {
          'text': '集合',
          'items': [
        {
              'text': '集合概览',
              'link': '/Java/Java/集合/集合概览'
        },
        {
              'text': 'List',
              'link': '/Java/Java/集合/Collection/List/List'
        },
        {
              'text': 'ArrayList',
              'link': '/Java/Java/集合/Collection/List/ArrayList'
        },
        {
              'text': 'CopyOnWriteArrayList',
              'link': '/Java/Java/集合/Collection/List/CopyOnWriteArrayList'
        },
        {
              'text': 'LinkedList',
              'link': '/Java/Java/集合/Collection/List/LinkedList'
        },
        {
              'text': 'Vector',
              'link': '/Java/Java/集合/Collection/List/Vector'
        },
        {
              'text': 'Set',
              'link': '/Java/Java/集合/Collection/Set/Set'
        },
        {
              'text': 'HashSet',
              'link': '/Java/Java/集合/Collection/Set/HashSet'
        },
        {
              'text': 'CopyOnWriteArraySet',
              'link': '/Java/Java/集合/Collection/Set/CopyOnWriteArraySet'
        },
        {
              'text': 'ConcurrentSkipListSet',
              'link': '/Java/Java/集合/Collection/Set/ConcurrentSkipListSet'
        },
        {
              'text': 'LinkedHashSet',
              'link': '/Java/Java/集合/Collection/Set/LinkedHashSet'
        },
        {
              'text': 'TreeSet',
              'link': '/Java/Java/集合/Collection/Set/TreeSet'
        },
        {
              'text': 'Map',
              'link': '/Java/Java/集合/Map/Map'
        },
        {
              'text': 'Hashtable',
              'link': '/Java/Java/集合/Map/Hashtable'
        },
        {
              'text': 'HashMap',
              'link': '/Java/Java/集合/Map/HashMap'
        },
        {
              'text': 'LinkedHashMap',
              'link': '/Java/Java/集合/Map/LinkedHashMap'
        },
        {
              'text': 'TreeMap',
              'link': '/Java/Java/集合/Map/TreeMap'
        },
        {
              'text': 'ConcurrentHashMap',
              'link': '/Java/Java/集合/Map/ConcurrentHashMap'
        },
        {
              'text': 'Queue',
              'link': '/Java/Java/集合/Collection/Queue/Queue'
        },
        {
              'text': 'ArrayBlockingQueue',
              'link': '/Java/Java/集合/Collection/Queue/ArrayBlockingQueue'
        },
        {
              'text': 'ArrayDeque',
              'link': '/Java/Java/集合/Collection/Queue/ArrayDeque'
        },
        {
              'text': 'ConcurrentLinkedQueue',
              'link': '/Java/Java/集合/Collection/Queue/ConcurrentLinkedQueue'
        },
        {
              'text': 'DelayQueue',
              'link': '/Java/Java/集合/Collection/Queue/DelayQueue'
        },
        {
              'text': 'LinkedBlockingDeque',
              'link': '/Java/Java/集合/Collection/Queue/LinkedBlockingDeque'
        },
        {
              'text': 'LinkedBlockingQueue',
              'link': '/Java/Java/集合/Collection/Queue/LinkedBlockingQueue'
        },
        {
              'text': 'PriorityQueue',
              'link': '/Java/Java/集合/Collection/Queue/PriorityQueue'
        }
      ]
    },
    {
          'text': '并发',
          'items': [
        {
              'text': 'synchronized',
              'link': '/Java/Java/并发/synchronized'
        },
        {
              'text': 'volatile',
              'link': '/Java/Java/并发/volatile'
        }
      ]
    },
    {
          'text': 'JVM',
          'items': [
        {
              'text': 'JVM 概述',
              'link': '/Java/Java/JVM/JVM概述'
        },
        {
              'text': '运行时数据区',
              'link': '/Java/Java/JVM/运行时数据区'
        },
        {
              'text': '执行引擎',
              'link': '/Java/Java/JVM/执行引擎'
        },
        {
              'text': '垃圾回收',
              'link': '/Java/Java/JVM/垃圾回收'
        }
      ]
    }
  ],
      '/Java/Spring/': [
    {
          'text': 'Spring',
          'items': [
        {
              'text': 'Spring概览',
              'link': '/Java/Spring/Spring概览'
        }
      ]
    },
    {
          'text': 'Spring Core',
          'items': [
        {
              'text': 'SpringCore概览',
              'link': '/Java/Spring/SpringCore/SpringCore概览'
        },
        {
              'text': 'IOC',
              'link': '/Java/Spring/SpringCore/IOC'
        },
        {
              'text': 'AOP',
              'link': '/Java/Spring/SpringCore/AOP'
        },
        {
              'text': '事务',
              'link': '/Java/Spring/SpringCore/事务'
        }
      ]
    },
    {
          'text': 'Spring Boot',
          'items': [
        {
              'text': 'SpringBoot概览',
              'link': '/Java/Spring/SpringBoot/SpringBoot概览'
        }
      ]
    },
    {
          'text': 'Spring Cloud',
          'items': [
        {
              'text': 'SpringCloud概览',
              'link': '/Java/Spring/SpringCloud/SpringCloud概览'
        },
        {
              'text': 'Nacos 注册中心',
              'link': '/Java/Spring/SpringCloud/Nacos注册中心'
        }
      ]
    }
  ],
      '/me/工作/': [
    {
          'text': '简历',
          'items': [
        {
              'text': '简历',
              'link': '/me/工作/简历'
        }
      ]
    },
    {
          'text': '宠物保险',
          'items': [
        {
              'text': '介绍',
              'link': '/me/工作/宠物保险/支付宝宠物保险'
        }
      ]
    },
    {
          'text': '全业务巡检',
          'items': [
        {
              'text': '介绍',
              'link': '/me/工作/全业务巡检/全业务巡检'
        }
      ]
    },
    {
          'text': 'VPC',
          'items': [
        {
              'text': '介绍',
              'link': '/me/工作/VPC/VPC'
        }
      ]
    }
  ],
      '/中间件/消息队列/': [
    {
          'text': 'kafka',
          'items': [
        {
              'text': 'Kafka',
              'link': '/中间件/消息队列/kafka/Kafka'
        },
        {
              'text': 'Golang接入Kafka',
              'link': '/中间件/消息队列/kafka/Golang接入Kafka'
        }
      ]
    },
    {
          'text': 'rabbitmq',
          'items': [
        {
              'text': 'RabbitMQ 入门与核心概念',
              'link': '/中间件/消息队列/rabbitmq/RabbitMQ入门与核心概念'
        },
        {
              'text': 'RabbitMQ 进阶：存储原理与高可用',
              'link': '/中间件/消息队列/rabbitmq/RabbitMQ进阶：存储原理与高可用'
        },
        {
              'text': 'RabbitMQ 进阶：消息可靠性与高级特性',
              'link': '/中间件/消息队列/rabbitmq/RabbitMQ进阶：消息可靠性与高级特性'
        }
      ]
    }
  ],
      '/中间件/缓存/': [
    {
          'text': 'Redis',
          'items': [
        {
              'text': 'Redis 概览',
              'link': '/中间件/缓存/Redis/Redis概览'
        },
        {
              'text': 'Redis 个人总结',
              'link': '/中间件/缓存/Redis/Redis个人总结'
        }
      ]
    }
  ],
      '/中间件/配置中心/': [
    {
          'text': '配置中心',
          'items': [
        {
              'text': 'Apollo',
              'link': '/中间件/配置中心/Apollo/Apollo概览'
        }
      ]
    }
  ],
      '/数据库/ES/': [
    {
          'text': '介绍',
          'items': [
        {
              'text': '查询语法',
              'link': '/数据库/ES/查询语法'
        }
      ]
    },
    {
          'text': '查询语法',
          'items': [
        {
              'text': 'match',
              'link': '/数据库/ES/查询语法/match'
        },
        {
              'text': 'match_phrase',
              'link': '/数据库/ES/查询语法/match_phrase'
        },
        {
              'text': 'match_phrase_prefix',
              'link': '/数据库/ES/查询语法/match_phrase_prefix'
        },
        {
              'text': 'multi_match',
              'link': '/数据库/ES/查询语法/multi_match'
        },
        {
              'text': 'term',
              'link': '/数据库/ES/查询语法/term'
        },
        {
              'text': 'bool',
              'link': '/数据库/ES/查询语法/bool'
        },
        {
              'text': 'range',
              'link': '/数据库/ES/查询语法/range'
        }
      ]
    },
    {
          'text': '特性',
          'items': [
        {
              'text': '倒排索引',
              'link': '/数据库/ES/特性/倒排索引'
        },
        {
              'text': 'copy_to',
              'link': '/数据库/ES/特性/copy_to'
        }
      ]
    }
  ],
      '/数据库/Mysql/': [
    {
          'text': '概览',
          'items': [
        {
              'text': 'Mysql',
              'link': '/数据库/Mysql/Mysql'
        }
      ]
    },
    {
          'text': '特性',
          'items': [
        {
              'text': '索引',
              'link': '/数据库/Mysql/特性/索引'
        },
        {
              'text': 'MVCC',
              'link': '/数据库/Mysql/特性/MVCC'
        }
      ]
    }
  ],
      '/数据库/Redis/': [
    {
          'text': '概览',
          'items': [
        {
              'text': 'Redis',
              'link': '/数据库/Redis/Redis'
        }
      ]
    },
    {
          'text': '命令',
          'items': [
        {
              'text': 'Redis 命令',
              'link': '/数据库/Redis/命令'
        }
      ]
    },
    {
          'text': '数据类型',
          'items': [
        {
              'text': 'String',
              'link': '/数据库/Redis/数据类型/string'
        },
        {
              'text': 'hash',
              'link': '/数据库/Redis/数据类型/hash'
        },
        {
              'text': 'list',
              'link': '/数据库/Redis/数据类型/list'
        },
        {
              'text': 'set',
              'link': '/数据库/Redis/数据类型/set'
        },
        {
              'text': 'sorted set',
              'link': '/数据库/Redis/数据类型/sortedSet'
        },
        {
              'text': 'bitmap',
              'link': '/数据库/Redis/数据类型/bitmap'
        },
        {
              'text': 'geo',
              'link': '/数据库/Redis/数据类型/geo'
        }
      ]
    },
    {
          'text': '存储类型',
          'items': [
        {
              'text': 'SDS',
              'link': '/数据库/Redis/存储类型/SDS'
        },
        {
              'text': 'embstr',
              'link': '/数据库/Redis/存储类型/embstr'
        },
        {
              'text': 'raw',
              'link': '/数据库/Redis/存储类型/raw'
        },
        {
              'text': 'int',
              'link': '/数据库/Redis/存储类型/int'
        },
        {
              'text': 'ziplist',
              'link': '/数据库/Redis/存储类型/ziplist'
        },
        {
              'text': 'hashtable',
              'link': '/数据库/Redis/存储类型/hashtable'
        },
        {
              'text': 'quicklist',
              'link': '/数据库/Redis/存储类型/quicklist'
        },
        {
              'text': 'intset',
              'link': '/数据库/Redis/存储类型/intset'
        },
        {
              'text': 'skiplist',
              'link': '/数据库/Redis/存储类型/skiplist'
        }
      ]
    }
  ],
      '/数据库/InfluxDB/': [
    {
          'text': '基础认知',
          'items': [
        {
              'text': 'InfluxDB 概览',
              'link': '/数据库/InfluxDB/InfluxDB概览'
        },
        {
              'text': 'InfluxDB 数据模型',
              'link': '/数据库/InfluxDB/InfluxDB数据模型'
        },
        {
              'text': 'InfluxDB 安装与快速上手',
              'link': '/数据库/InfluxDB/InfluxDB安装与快速上手'
        }
      ]
    },
    {
          'text': '写入与协议',
          'items': [
        {
              'text': 'Line Protocol 详解',
              'link': '/数据库/InfluxDB/InfluxDBLineProtocol详解'
        },
        {
              'text': '写入优化与最佳实践',
              'link': '/数据库/InfluxDB/InfluxDB写入优化与最佳实践'
        }
      ]
    },
    {
          'text': '查询语法',
          'items': [
        {
              'text': 'Flux 查询语言',
              'link': '/数据库/InfluxDB/InfluxDBFlux查询语言'
        },
        {
              'text': 'InfluxQL 回顾',
              'link': '/数据库/InfluxDB/InfluxDBInfluxQL回顾'
        }
      ]
    },
    {
          'text': '核心原理',
          'items': [
        {
              'text': 'TSM 存储引擎',
              'link': '/数据库/InfluxDB/InfluxDBTSM存储引擎'
        },
        {
              'text': '数据存储与索引',
              'link': '/数据库/InfluxDB/InfluxDB数据存储与索引'
        },
        {
              'text': '内存与性能调优',
              'link': '/数据库/InfluxDB/InfluxDB内存与性能调优'
        }
      ]
    },
    {
          'text': '架构与运维',
          'items': [
        {
              'text': '高可用与集群架构',
              'link': '/数据库/InfluxDB/InfluxDB高可用与集群架构'
        },
        {
              'text': '数据备份与迁移',
              'link': '/数据库/InfluxDB/InfluxDB数据备份与迁移'
        },
        {
              'text': '生态集成',
              'link': '/数据库/InfluxDB/InfluxDB生态集成'
        }
      ]
    },
    {
          'text': '实战与避坑',
          'items': [
        {
              'text': '常见注意事项与踩坑指南',
              'link': '/数据库/InfluxDB/InfluxDB常见注意事项与踩坑指南'
        },
        {
              'text': '实战案例：指标监控平台',
              'link': '/数据库/InfluxDB/InfluxDB实战案例指标监控平台'
        }
      ]
    }
  ],
      '/理论/API设计/': [
    {
          'text': 'RestFul API',
          'items': [
        {
              'text': 'RestFul API',
              'link': '/理论/API设计/RestFulAPI'
        }
      ]
    },
    {
          'text': 'Rpc API',
          'items': [
        {
              'text': 'Rpc API',
              'link': '/理论/API设计/RpcApi'
        }
      ]
    }
  ],
      '/理论/SOLID设计原则/': [
    {
          'text': 'SOLID 设计原则',
          'items': [
        {
              'text': '概述',
              'link': '/理论/SOLID设计原则/SOLID设计原则'
        },
        {
              'text': '单一职责原则',
              'link': '/理论/SOLID设计原则/单一职责原则'
        },
        {
              'text': '开闭原则',
              'link': '/理论/SOLID设计原则/开闭原则'
        },
        {
              'text': '里氏替换原则',
              'link': '/理论/SOLID设计原则/里氏替换原则'
        },
        {
              'text': '接口隔离原则',
              'link': '/理论/SOLID设计原则/接口隔离原则'
        },
        {
              'text': '依赖倒置原则',
              'link': '/理论/SOLID设计原则/依赖倒置原则'
        }
      ]
    }
  ],
      '/理论/分布式系统/': [
    {
          'text': '一致性',
          'items': [
        {
              'text': '一致性',
              'link': '/理论/分布式系统/一致性/一致性'
        },
        {
              'text': '分布式锁',
              'link': '/理论/分布式系统/一致性/分布式锁'
        },
        {
              'text': '分布式事务',
              'link': '/理论/分布式系统/一致性/分布式事务'
        }
      ]
    }
  ],
      '/理论/数据库/': [
    {
          'text': '概览',
          'items': [
        {
              'text': '概览',
              'link': '/理论/数据库/概览'
        }
      ]
    },
    {
          'text': '锁',
          'items': [
        {
              'text': '悲观锁',
              'link': '/理论/数据库/锁/悲观锁'
        },
        {
              'text': '乐观锁',
              'link': '/理论/数据库/锁/乐观锁'
        }
      ]
    }
  ],
      '/理论/领域驱动设计/': [
    {
          'text': '概览',
          'items': [
        {
              'text': '领域驱动设计',
              'link': '/理论/领域驱动设计/领域驱动设计概览'
        }
      ]
    }
  ],
      '/Linux/': [
    {
          'text': 'Linux',
          'items': [
        {
              'text': 'SSH 密钥免密登录',
              'link': '/Linux/SSH密钥免密登录'
        }
      ]
    }
  ],
      '/macOS/': [
    {
          'text': 'macOS',
          'items': [
        {
              'text': '命令行常用命令',
              'link': '/macOS/命令行常用命令'
        }
      ]
    }
  ],
      '/生活/': [
    {
          'text': '[菜品](生活/菜品/)',
          'items': [
        {
              'text': '冬瓜玉米排骨汤',
              'link': '/生活/菜品/冬瓜玉米排骨汤'
        },
        {
              'text': '凉菜',
              'link': '/生活/菜品/凉菜'
        },
        {
              'text': '大锅菜',
              'link': '/生活/菜品/大锅菜'
        },
        {
              'text': '烤鱼',
              'link': '/生活/菜品/烤鱼'
        },
        {
              'text': '银耳薏米莲子粥',
              'link': '/生活/菜品/银耳薏米莲子粥'
        },
        {
              'text': '鱼香肉丝',
              'link': '/生活/菜品/鱼香肉丝'
        },
        {
              'text': '鸡蛋西红柿',
              'link': '/生活/菜品/鸡蛋西红柿'
        }
      ]
    }
  ]
},

    socialLinks: [
      { icon: 'github', link: 'https://github.com/canaan-wang/canaan-wang.github.io' },
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024-present Canaan',
    },

    docFooter: {
      prev: '上一页',
      next: '下一页',
    },

    outline: {
      label: '页面导航',
    },

    lastUpdated: {
      text: '最后更新于',
      formatOptions: {
        dateStyle: 'short',
        timeStyle: 'medium',
      },
    },

    search: {
      provider: 'local',
      options: {
        translations: {
          button: {
            buttonText: '搜索文档',
            buttonAriaLabel: '搜索文档',
          },
          modal: {
            noResultsText: '无法找到相关结果',
            resetButtonTitle: '清除查询条件',
            footer: {
              selectText: '选择',
              navigateText: '切换',
              closeText: '关闭',
            },
          },
        },
      },
    },
  },
})
