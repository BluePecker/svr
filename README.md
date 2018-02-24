## Nodejs API框架
---

#### 项目概要

	本项目通过抽象数据模型和业务逻辑层以达到快捷/高效/清晰地提供API。
#### 项目结构

	├── bootstrap    项目启动目录, 负责一些初始化工作
	├── config       配置目录(${NODE_ENV}.json + default.json)
	├── const        常量配置
	├── middleware   jwt/日志/设置header等中间件
	├── model        数据模型层
	│   ├── mongo
	│   ├── mysql
	│   └── redis
	├── router       路由
	│   ├── user
	│   └── ...
	├── script      脚本
	├── service     http业务逻辑层
	│   ├── user
	│   └── ...
	├── socket      websocket业务逻辑层
	│   ├── interval
	│   └── ...
	└── utils       常用助手函数层