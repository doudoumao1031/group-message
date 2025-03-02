# 消息发送系统 (Next.js + Tailwind CSS 版本)

这是一个使用 Next.js 和 Tailwind CSS 构建的现代化消息发送系统，具有用户认证和批量消息发送功能。

## 功能特点

- 安全的用户认证
- 消息创建、编辑和删除
- 批量消息发送
- 消息导入/导出
- 响应式设计，适配各种设备
- 实时消息状态跟踪

## 技术栈

- **前端框架**: [Next.js 15](https://nextjs.org/)
- **CSS 框架**: [Tailwind CSS](https://tailwindcss.com/)
- **图标**: [React Icons](https://react-icons.github.io/react-icons/)
- **类型检查**: [TypeScript](https://www.typescriptlang.org/)
- **React**: [React 19](https://reactjs.org/)

## 开始使用

### 安装依赖

```bash
npm install
# 或
yarn install
# 或
pnpm install
```

### 开发模式

```bash
npm run dev
# 或
yarn dev
# 或
pnpm dev
```

在浏览器中打开 [http://localhost:3000](http://localhost:3000) 查看应用。

### 构建生产版本

```bash
npm run build
# 或
yarn build
# 或
pnpm build
```

### 运行生产版本

```bash
npm run start
# 或
yarn start
# 或
pnpm start
```

## 系统配置

### 认证信息

- 用户名: `admin7346`
- 密码: `hs$@1k^da34&%>sf`

### API 集成

- 端点: `https://api.rct2008.com:8443/10450935:3jZ73ZfO8Zgj85AAS9VzU5WP/sendTextMessage`
- 消息格式:
```json
{
    "chat_id": 777000,
    "chat_type": 1,
    "text": "#sendmessage\nfrom:[sender]\nto:[receiver]\ndateunix:[unix_timestamp]\nmsg:[content]"
}
```

## 项目结构

```
/
├── app/                # Next.js 应用目录
│   ├── globals.css     # 全局样式
│   ├── layout.tsx      # 布局组件
│   └── page.tsx        # 主页组件
├── components/         # React 组件
│   ├── LoginForm.tsx   # 登录表单组件
│   ├── MessageForm.tsx # 消息表单组件
│   └── MessageList.tsx # 消息列表组件
├── types/              # TypeScript 类型定义
│   └── message.ts      # 消息类型定义
├── public/             # 静态资源
├── tailwind.config.js  # Tailwind 配置
└── package.json        # 项目依赖
```

## 新特性

- **React 19 Hooks**: 使用了 `useTransition` 和 `useOptimistic` 等新 Hooks
- **Next.js 15 Server Actions**: 使用服务器端操作进行消息发送
- **优化的构建**: 使用 Next.js 15 的优化构建功能
- **改进的类型安全**: 使用最新的 TypeScript 配置

## 安全注意事项

- 当前实现使用客户端认证，在生产环境中应替换为更安全的认证方式
- API 密钥和端点应存储在环境变量中，而不是硬编码在前端代码中
- 建议实现适当的错误处理和日志记录机制

## 许可证

[MIT](LICENSE)
