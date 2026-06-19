/* ============================================================
   data.js —— 站点配置与文章数据
   这是你最常编辑的文件：
   - 改站点信息：修改 SITE 对象
   - 发新文章：直接在网页编辑器中写（点击导航栏「写文章」）
   ============================================================ */

/* --------------------------------------------------------
   站点配置
   -------------------------------------------------------- */
const SITE = {
  // 站点名称（显示在浏览器标题栏和页头）
  title: "沉思录",

  // 站点副标题（显示在 Hero 区大标题下方）
  subtitle: "记录学习中的发现、思考与随感。<br>在这里，知识沉淀为文字，灵感凝结成文章。",

  // 作者名
  author: "王欣越",

  // 站点简介（用于关于页面）
  description: "这里是王欣越的个人博客，记录学习过程中的思考、心得与感悟。涵盖计算机科学、物理实验、数学推导以及日常随想。",

  // 关于页面详细介绍（支持 HTML）
  aboutContent: `
    <h2>关于我</h2>
    <p>你好，我是王欣越，一名计算机科学与技术专业的学生。</p>
    <p>这个博客是我的一片自留地，用来记录学习过程中的思考、实验中的发现、以及生活中的随感。我相信写作是最好的思考方式——当我们把想法写下来的时候，模糊的认知会变得清晰，零散的念头会连成脉络。</p>
    <p>如果你对这里的文章有任何想法或建议，欢迎交流。</p>

    <h3>关于这个博客</h3>
    <p>这个博客采用纯静态 HTML/CSS/JS 搭建，没有使用任何框架或构建工具。配色以黑白灰为主，追求简洁、克制的阅读体验。博客的源代码在 <a href="https://github.com/Destiny0124/blog" target="_blank">GitHub</a> 上开源，可通过 <a href="https://destiny0124.github.io/blog/" target="_blank">destiny0124.github.io/blog</a> 在线访问。</p>
  `,

  // 个人简介页面（支持 HTML）
  profileContent: `
    <h2>基本信息</h2>
    <ul>
      <li><strong>姓名：</strong>王欣越</li>
      <li><strong>MBTI：</strong>ISTJ</li>
      <li><strong>身份：</strong>计算机科学与技术专业学生</li>
      <li><strong>博客：</strong><a href="https://destiny0124.github.io/blog/" target="_blank">destiny0124.github.io/blog</a></li>
    </ul>

    <h2>联系方式</h2>
    <ul>
      <li><strong>Gmail：</strong><a href="mailto:starmoon3624@gmail.com">starmoon3624@gmail.com</a></li>
      <li><strong>QQ邮箱：</strong><a href="mailto:2098944274@qq.com">2098944274@qq.com</a></li>
      <li><strong>微信：</strong>W0X1Y24</li>
    </ul>

    <h2>音乐品味</h2>
    <p>喜欢独立、有质感的华语音乐，以下是一些特别欣赏的歌手：</p>
    <ul>
      <li>🎸 <strong>梁博</strong>——干净克制的摇滚，嗓音里有种难得的真诚与力量</li>
      <li>🎹 <strong>周杰伦</strong>——华语流行音乐的里程碑，旋律与意境的完美结合</li>
      <li>🎤 <strong>赵雷</strong>——民谣里的烟火气，唱的是普通人的故事与情感</li>
      <li>🎵 <strong>宋冬野</strong>——低沉的叙事感，歌词里有诗也有生活</li>
    </ul>

    <h2>关于 ISTJ</h2>
    <p>ISTJ 型人格以务实、可靠、有条理著称。喜欢按计划行事，注重细节和逻辑，习惯在行动之前深思熟虑。也许正是这种特质，让我对计算机科学和物理实验中的严谨与秩序感格外着迷。</p>
  `,

  // 分类列表（首页按此显示筛选按钮，也是写文章时的分类选项）
  categories: ["全部", "技术", "随笔", "学习笔记", "物理实验"],

  // 社交媒体链接（留空则不显示；会显示在页脚）
  social: {
    github: "https://github.com/Destiny0124/blog",
    email: "starmoon3624@gmail.com",
    qqEmail: "2098944274@qq.com",
    wechat: "W0X1Y24",
  },

  // 页脚版权起始年份
  since: 2026,
};

/* --------------------------------------------------------
   内置示范文章
   用户在网页编辑器里写的文章会存到 localStorage，
   和这里的文章合并展示。
   -------------------------------------------------------- */
const ARTICLES = [

  {
    id: "hello-world",
    title: "你好，世界",
    date: "2026-06-19",
    category: "随笔",
    tags: ["博客", "开始"],
    excerpt: "第一篇博客文章，聊聊为什么要建这个网站，以及打算在这里写些什么。",
    content: `
      <h2>为什么开始写博客</h2>
      <p>一直以来，我都想有一个属于自己的空间来记录学习和思考的过程。社交媒体过于碎片化，笔记软件又过于私密——博客恰好处于两者之间：它既是公开的，又是结构化的；既是一种表达，也是一种整理。</p>
      <p>费曼学习法中有一个核心观点：<strong>教是最好的学</strong>。当你尝试用清晰的语言把某个概念解释给他人时，你会发现自己对它的理解是否真的透彻。写博客正是这样——每一篇文章都是在向未来的读者（也可能是未来的自己）解释一个话题。</p>

      <h2>这个博客会写什么</h2>
      <p>目前计划涵盖以下几个方面：</p>
      <ul>
        <li><strong>计算机科学</strong>——算法、数据结构、编程语言的学习笔记</li>
        <li><strong>物理实验</strong>——大学物理实验中的思考与数据处理</li>
        <li><strong>数学推导</strong>——有意思的数学问题和证明</li>
        <li><strong>日常随想</strong>——生活中的观察和感悟</li>
      </ul>

      <h2>关于这个网站</h2>
      <p>这个博客采用最基础的网页技术搭建——HTML、CSS 和 JavaScript。没有框架，没有构建工具，甚至不需要服务器。整个网站就是一个文件夹，用浏览器直接打开就能看。</p>
      <p>我选择了黑白灰的配色方案，追求简洁、克制的阅读体验。好的设计应该让人感受不到设计的存在——让读者专注于内容本身。</p>

      <blockquote>
        "写作即思考。我们不因为想清楚了才写，而是因为写才想清楚。"
      </blockquote>

      <p>如果你正在读这篇文章，感谢你的光临。希望这里的内容对你有所启发。</p>
    `
  }

];

/* --------------------------------------------------------
   文章数据持久化（localStorage）
   - ARTICLES: 内置示范文章（只读）
   - localStorage: 用户在网页编辑器里写的文章（可编辑/删除）
   - getAllArticles(): 合并两者，用户文章排前面
   -------------------------------------------------------- */

(function () {
  "use strict";

  var STORAGE_KEY = "blog_user_articles";

  function loadUserArticles() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) { return []; }
  }

  function saveUserArticles(list) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch (e) {
      alert("保存失败，可能存储空间已满。建议导出备份后清理旧文章。");
    }
  }

  function generateSlug(title) {
    var slug = title.trim().toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w一-鿿\-]/g, "")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
    return slug || "article-" + Date.now();
  }

  function todayStr() {
    var d = new Date();
    var m = String(d.getMonth() + 1).padStart(2, "0");
    var day = String(d.getDate()).padStart(2, "0");
    return d.getFullYear() + "-" + m + "-" + day;
  }

  /* 合并所有文章（用户写的 + 内置），按日期降序 */
  window.getAllArticles = function () {
    var userArticles = loadUserArticles();
    userArticles.sort(function (a, b) { return new Date(b.date) - new Date(a.date); });
    var builtin = ARTICLES.slice().sort(function (a, b) { return new Date(b.date) - new Date(a.date); });
    return userArticles.concat(builtin);
  };

  /* 按 id 查找文章（先查用户文章，再查内置） */
  window.findArticle = function (id) {
    var userArticles = loadUserArticles();
    var found = userArticles.find(function (a) { return a.id === id; });
    if (found) return found;
    return ARTICLES.find(function (a) { return a.id === id; });
  };

  /* 保存文章（新建或更新） */
  window.saveArticle = function (article) {
    var userArticles = loadUserArticles();
    var idx = userArticles.findIndex(function (a) { return a.id === article.id; });
    if (idx >= 0) {
      userArticles[idx] = article;
    } else {
      userArticles.push(article);
    }
    saveUserArticles(userArticles);
  };

  /* 删除用户文章，返回 true 表示成功 */
  window.deleteArticle = function (id) {
    var userArticles = loadUserArticles();
    var filtered = userArticles.filter(function (a) { return a.id !== id; });
    if (filtered.length === userArticles.length) return false;
    saveUserArticles(filtered);
    return true;
  };

  /* 导出用户文章 JSON（备份用，控制台调用） */
  window.exportUserArticles = function () {
    return JSON.stringify(loadUserArticles(), null, 2);
  };

  /* 检查某篇文章是否可编辑/删除（用户文章） */
  window.isUserArticle = function (id) {
    return loadUserArticles().some(function (a) { return a.id === id; });
  };

  /* 重新加载用户文章（被 main.js 编辑器使用） */
  window.loadUserArticles = loadUserArticles;

  // 工具暴露给编辑器
  window._blogUtils = { generateSlug: generateSlug, todayStr: todayStr };

})();
