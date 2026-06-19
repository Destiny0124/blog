# 个人博客——“沉思录”

## 项目概述

纯静态个人博客网站，黑白灰极简配色，无需服务器或构建工具，浏览器直接打开 `index.html` 即可运行。适合部署到 GitHub Pages。

## 文件结构

```
个人博客/
├── index.html          # 唯一 HTML 入口
├── css/
│   └── style.css       # 全局样式（CSS 变量驱动）
├── js/
│   ├── data.js         # 站点配置 + 文章数据 ★最常编辑的文件
│   └── main.js         # 路由 + 页面渲染（一般无需修改）
└── CLAUDE.md           # 项目说明（本文件）
```

## 使用方法

### 本地浏览
直接用浏览器打开 `index.html`。

### 添加新文章
编辑 `js/data.js`，在 `ARTICLES` 数组末尾追加一个对象：

```javascript
{
  id: "article-slug",              // URL 标识（英文+连字符，唯一）
  title: "文章标题",
  date: "2026-06-19",             // YYYY-MM-DD 格式
  category: "技术",               // 需与 SITE.categories 中某个值一致
  tags: ["标签1", "标签2"],       // 可选
  excerpt: "摘要，约1-2句话...",
  content: `
    <h2>小标题</h2>
    <p>正文支持 HTML</p>
  `,
}
```

### 修改站点信息
编辑 `js/data.js` 中的 `SITE` 对象即可：
- `title` / `subtitle` — 站点名称
- `author` — 作者名
- `categories` — 文章分类列表
- `aboutContent` — “关于”页面内容
- `social.github` / `social.email` — 社交链接

### 修改配色
编辑 `css/style.css`，修改 `:root` 中的 CSS 变量。

### 部署到 GitHub Pages
1. 在 GitHub 创建仓库
2. 将整个 `个人博客` 文件夹内容推送到仓库
3. 在仓库 Settings → Pages 中启用 GitHub Pages，Source 选择 `main` 分支

## 设计理念

- **模块化**：内容（data.js）与逻辑（main.js）与样式（style.css）完全分离
- **CSS 变量驱动**：所有颜色、间距、字体定义在 `:root` 中，改主题只需改一处
- **零依赖**：不依赖任何第三方库、框架或构建工具
- **响应式**：适配桌面和平板/手机端
