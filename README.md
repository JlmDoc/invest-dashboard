# 投资研究仪表盘

多市场投资研究工具，支持 A股、美股、加密货币行情查看和自选管理。

## 技术栈

- **框架**: Next.js 14 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **图表**: Recharts
- **状态管理**: Zustand

## 功能特性

### 核心功能

1. **市场概览**
   - A股大盘指数（上证、深证、创业板）
   - 美股大盘指数（道琼斯、标普500、纳斯达克100）
   - 加密货币市值排行

2. **自选管理**
   - 添加/删除自选股
   - LocalStorage 持久化
   - 多市场统一管理

3. **标的详情**
   - 基本行情信息
   - 价格走势图表
   - 一键关注/取消关注

4. **搜索功能**
   - 跨市场搜索（A股/美股/加密货币）
   - 实时搜索结果

### 数据源

- **A股**: 东方财富公开 API
- **美股**: Finnhub API
- **加密货币**: CoinGecko API

## 快速开始

### 安装依赖

\`\`\`bash
npm install
\`\`\`

### 配置环境变量

复制环境变量示例文件：

\`\`\`bash
cp .env.example .env.local
\`\`\`

编辑 `.env.local` 文件，配置 Finnhub API Key（可选）：

\`\`\`env
FINNHUB_API_KEY=your_api_key_here
\`\`\`

> 注意：A股和加密货币数据使用公开 API，无需密钥。美股数据默认使用 demo key，有请求限制，生产环境建议申请真实 API key。

### 开发模式

\`\`\`bash
npm run dev
\`\`\`

访问 http://localhost:3000

### 生产构建

\`\`\`bash
npm run build
npm start
\`\`\`

## 部署

### Vercel 部署

1. 推送代码到 GitHub
2. 在 Vercel 导入项目
3. 配置环境变量 `FINNHUB_API_KEY`（可选）
4. 部署完成

项目已包含 `vercel.json` 配置文件，支持自动部署。

## 项目结构

\`\`\`
invest-dashboard/
├── app/                    # Next.js App Router
│   ├── api/               # API 路由
│   │   ├── stock/
│   │   │   ├── cn/       # A股 API
│   │   │   └── us/       # 美股 API
│   │   └── crypto/       # 加密货币 API
│   ├── stock/[market]/[code]/  # 标的详情页
│   ├── watchlist/        # 自选管理页
│   ├── market/           # 市场概览页
│   ├── page.tsx          # 首页
│   └── layout.tsx        # 布局
├── components/            # React 组件
│   ├── MarketOverview.tsx
│   ├── WatchlistPreview.tsx
│   ├── StockChart.tsx
│   └── SearchBar.tsx
├── lib/                   # 工具库
│   ├── types.ts          # 类型定义
│   ├── cache.ts          # 内存缓存
│   └── store.ts          # Zustand 状态管理
└── public/               # 静态资源
\`\`\`

## API 说明

### A股 API (`/api/stock/cn`)

- `?action=indices` - 获取大盘指数
- `?action=search&keyword=xxx` - 搜索股票
- `?action=detail&code=xxx` - 获取股票详情

### 美股 API (`/api/stock/us`)

- `?action=indices` - 获取大盘指数
- `?action=search&keyword=xxx` - 搜索股票
- `?action=detail&code=xxx` - 获取股票详情

### 加密货币 API (`/api/crypto`)

- `?action=top&limit=20` - 获取市值排行
- `?action=search&keyword=xxx` - 搜索加密货币
- `?action=detail&id=xxx` - 获取详情

## 注意事项

1. **数据缓存**: API 实现了 1-2 分钟的内存缓存，减少外部 API 调用
2. **CORS 处理**: 通过服务端 API 代理，避免客户端 CORS 问题
3. **密钥安全**: API Key 通过环境变量配置，不会暴露到客户端
4. **仅供研究**: 本工具仅供投资研究参考，不构成投资建议

## 开发说明

- 使用 TypeScript 严格模式
- 组件拆分合理，职责清晰
- 添加必要的错误处理
- 响应式设计，支持移动端

## License

MIT
