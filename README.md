# 🕵️ AI 审讯室 (AI Interrogation Room)

一个基于 AI 的互动悬疑推理游戏。通过与嫌疑人对话，找出真正的凶手。

![Next.js](https://img.shields.io/badge/Next.js-16-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o--mini-green)

## 🎮 游戏简介

知名古籍收藏家 **Arthur Blackwood** 被发现死于自己的密室图书馆。现场只有三人：
- 🔴 **关系疏远的妻子**
- 🟣 **野心勃勃的竞争对手**  
- 🔵 **沉默寡言的图书管理员**

作为首席探员，你必须通过对话找出破绽。每个人都有秘密，但只有一个是凶手。

## ✨ 特性 test 111

- 🤖 **AI 驱动对话** - 使用 GPT-4o-mini 生成真实、动态的角色回应
- 🎭 **多角色审讯** - 每个角色有独立的对话历史和心理状态
- 📊 **心理压力系统** - 追踪嫌疑人的压力值和镇定程度
- 🎨 **沉浸式 UI** - 黑暗主题 + 玻璃态设计
- 🔑 **测试模式** - 输入 `BYPASS` 可无需 API Key 进行测试

## 🚀 快速开始

### 安装依赖

```bash
npm install
```

### 运行开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000)

### 配置 API Key

1. 打开游戏后，输入你的 OpenAI API Key（以 `sk-` 开头）
2. 或输入 `BYPASS` 进入测试模式（使用模拟回复）

## 🛠️ 技术栈

- **框架**: Next.js 16 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS 4
- **AI**: OpenAI GPT-4o-mini
- **状态管理**: React Hooks

## 📁 项目结构

```
ai_game/
├── app/
│   ├── api/interrogate/    # 游戏 API 路由
│   ├── globals.css         # 全局样式
│   ├── layout.tsx          # 布局组件
│   └── page.tsx            # 主页面
├── components/
│   ├── ApiKeyInput.tsx     # API Key 输入组件
│   └── InterrogationRoom.tsx # 审讯室主界面
├── data/
│   ├── scenarios/          # 游戏剧本数据
│   └── schemas.ts          # TypeScript 类型定义
└── lib/
    ├── GameEngine.ts       # 游戏逻辑引擎
    └── OpenAIService.ts    # OpenAI API 服务
```

## 🎯 游戏玩法

1. **选择嫌疑人** - 点击左侧列表切换审讯对象
2. **提问** - 在输入框中输入问题
3. **观察** - 注意角色的心理状态变化
4. **指认** - 确定凶手后点击「指认凶手」按钮

## 📝 License

MIT

---

Made with ❤️ by Bowen
