# 房贷计算器 Web 版

基于 Vue 3 + Vite 构建的房贷计算器 Web 应用，支持商业贷款、公积金贷款、组合贷款计算。

## 技术栈

- **框架**: Vue 3 (Composition API + `<script setup>`)
- **构建工具**: Vite
- **路由**: Vue Router 4
- **状态管理**: Pinia
- **样式**: SCSS
- **PWA**: vite-plugin-pwa

## 项目结构

```
mortgage-calculator-web/
├── public/                 # 静态资源
├── src/
│   ├── assets/
│   │   ├── styles/         # 全局样式
│   │   └── images/
│   ├── components/         # 公共组件
│   │   ├── common/
│   │   ├── mortgage/
│   │   └── ui/
│   ├── composables/        # 组合式函数
│   │   ├── useCalculator.js
│   │   └── useRateData.js
│   ├── layouts/            # 布局组件
│   ├── router/
│   │   └── index.js
│   ├── stores/             # Pinia 状态管理
│   │   ├── mortgage.js
│   │   └── rate.js
│   ├── utils/
│   │   ├── calculator.js   # 核心计算逻辑
│   │   └── format.js
│   ├── views/
│   │   ├── Mortgage/       # 房贷计算
│   │   ├── EarlyRepayment/ # 提前还款
│   │   ├── HouseTax/       # 房屋税费
│   │   └── Policy/         # 政策资讯
│   ├── App.vue
│   └── main.js
├── package.json
└── vite.config.js
```

## 功能特性

- 支持商业贷款、公积金贷款、组合贷款计算
- 按房价总额、按贷款总额、按房屋面积单价三种计算方式
- 等额本息、等额本金两种还款方式对比
- 自定义利率选择
- 响应式设计，支持 PC 和移动端
- PWA 支持，可添加到桌面

## 开发指南

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

### 预览生产版本

```bash
npm run preview
```

## 云开发集成

项目预留了腾讯云开发 Web 端集成位置，可在 `composables/useRateData.js` 中配置云开发环境，获取实时 LPR 利率数据。
