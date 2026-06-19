/* ============================================================
   main.js —— 路由系统与页面渲染 / DeepSeek 风格
   路由：hash → 首页 / 文章详情 / 关于 / 简介 / 游戏 / 写文章
   一般不需要修改这个文件
   ============================================================ */

(function () {
  "use strict";

  // ============================================================
  // 0. 每日一言（网络拉取 + 本地兜底）
  // ============================================================

  var QUOTE_CACHE_KEY = "blog_daily_quote";
  var QUOTE_CACHE_DATE_KEY = "blog_daily_quote_date";

  /** 当前季节/节日信息 */
  function getSeasonInfo() {
    var m = new Date().getMonth() + 1;
    var d = new Date().getDate();
    if (m === 1 && d === 1)  return { icon: "🎉", label: "元旦" };
    if (m === 2 && d === 14) return { icon: "💝", label: "情人节" };
    if (m === 5 && d === 1)  return { icon: "💪", label: "劳动节" };
    if (m === 6 && d === 1)  return { icon: "🎈", label: "儿童节" };
    if (m === 10 && d === 1) return { icon: "🇨🇳", label: "国庆节" };
    if (m === 12 && d === 25) return { icon: "🎄", label: "圣诞节" };
    if ((m === 1 && d >= 20) || (m === 2 && d <= 15)) return { icon: "🧧", label: "新春" };
    if (m >= 3 && m <= 5)  return { icon: "🌸", label: "春日" };
    if (m >= 6 && m <= 8)  return { icon: "☀️", label: "盛夏" };
    if (m >= 9 && m <= 11) return { icon: "🍂", label: "秋日" };
    return { icon: "❄️", label: "冬日" };
  }

  /** 本地兜底语录库 */
  function getLocalQuote() {
    var m = new Date().getMonth() + 1;
    var seasonal = {
      spring: [
        { text: "春天是一点、一点地化开的。", from: "迟子建" },
        { text: "江南无所有，聊赠一枝春。", from: "陆凯《赠范晔诗》" },
        { text: "风传花信，雨濯春尘。", from: "《小窗幽记》" },
        { text: "整个春天都是生命力独享风流的季节。", from: "史铁生" },
      ],
      summer: [
        { text: "生如夏花之绚烂，死如秋叶之静美。", from: "泰戈尔" },
        { text: "绿树阴浓夏日长，楼台倒影入池塘。", from: "高骈《山亭夏日》" },
        { text: "在夏天，我们吃绿豆、桃、樱桃和甜瓜。", from: "罗伯特·瓦尔泽" },
        { text: "夏天属于散文和柠檬，属于裸露和慵懒。", from: "德里克·沃尔科特" },
      ],
      autumn: [
        { text: "秋天是第二个春天，每片叶子都是花朵。", from: "加缪" },
        { text: "自古逢秋悲寂寥，我言秋日胜春朝。", from: "刘禹锡《秋词》" },
        { text: "秋日薄暮，用菊花煮竹叶青，人与海棠俱醉。", from: "林清玄" },
        { text: "晴秋上午，随便走走，不一定要快乐。", from: "木心" },
      ],
      winter: [
        { text: "晚来天欲雪，能饮一杯无？", from: "白居易《问刘十九》" },
        { text: "冬天来了，春天还会远吗？", from: "雪莱" },
        { text: "家人闲坐，灯火可亲。", from: "汪曾祺" },
        { text: "红泥小火炉，绿蚁新醅酒。", from: "白居易" },
      ],
    };
    var universal = [
      { text: "一个人知道自己为什么而活，就可以忍受任何一种生活。", from: "尼采" },
      { text: "世界上只有一种真正的英雄主义，那就是认清生活真相后依然热爱生活。", from: "罗曼·罗兰" },
      { text: "种一棵树最好的时间是十年前，其次是现在。", from: "非洲谚语" },
      { text: "吹灭读书灯，一身都是月。", from: "桂苓" },
      { text: "且将新火试新茶，诗酒趁年华。", from: "苏轼" },
      { text: "人生如逆旅，我亦是行人。", from: "苏轼" },
      { text: "怕什么真理无穷，进一寸有一寸的欢喜。", from: "胡适" },
      { text: "万物皆有裂痕，那是光照进来的地方。", from: "莱昂纳德·科恩" },
      { text: "你的问题主要在于读书不多而想得太多。", from: "杨绛" },
      { text: "每一个不曾起舞的日子，都是对生命的辜负。", from: "尼采" },
      { text: "有一分热，发一分光。", from: "鲁迅" },
      { text: "日拱一卒无有尽，功不唐捐终入海。", from: "《荀子》" },
      { text: "追风赶月莫停留，平芜尽处是春山。", from: "田歆" },
    ];
    var pool = [];
    if (m === 12 || m <= 2) pool = pool.concat(seasonal.winter);
    else if (m >= 3 && m <= 5) pool = pool.concat(seasonal.spring);
    else if (m >= 6 && m <= 8) pool = pool.concat(seasonal.summer);
    else pool = pool.concat(seasonal.autumn);
    pool = pool.concat(universal);
    var today = new Date();
    var seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
    return pool[seed % pool.length];
  }

  /** 从网络拉取一言（双源竞速 + 超时兜底） */
  function fetchRemoteQuote(callback) {
    var done = false;
    tryFetch("https://v1.hitokoto.cn/?c=d&encode=json", function (d) {
      if (done) return; done = true;
      callback({ text: d.hitokoto, from: (d.from_who ? d.from_who + "·" : "") + "《" + d.from + "》" });
    });
    setTimeout(function () {
      if (done) return;
      tryFetch("https://v1.apizero.cn/yiyan?format=json", function (d) {
        if (done) return; done = true;
        callback({ text: d.content || d.hitokoto, from: d.origin || d.from || "" });
      });
    }, 1500);
    setTimeout(function () {
      if (!done) { done = true; callback(null); }
    }, 4000);
  }

  function tryFetch(url, ok) {
    try {
      fetch(url, { method: "GET", mode: "cors" })
        .then(function (r) { if (!r.ok) throw Error(); return r.json(); })
        .then(function (d) { ok(d); })
        .catch(function () {});
    } catch (e) {}
  }

  /** 获取今日一言（缓存 → 网络 → 本地兜底） */
  function getDailyQuote(callback) {
    var today = new Date().toDateString();
    var cacheDate = null;
    try { cacheDate = localStorage.getItem(QUOTE_CACHE_DATE_KEY); } catch (e) {}
    if (cacheDate === today) {
      try {
        var c = JSON.parse(localStorage.getItem(QUOTE_CACHE_KEY));
        if (c && c.text) { callback(c); return; }
      } catch (e) {}
    }
    fetchRemoteQuote(function (remote) {
      if (remote && remote.text) {
        remote.remote = true;
        try { localStorage.setItem(QUOTE_CACHE_KEY, JSON.stringify(remote)); localStorage.setItem(QUOTE_CACHE_DATE_KEY, today); } catch (e) {}
        callback(remote);
      } else {
        var local = getLocalQuote();
        local.remote = false;
        callback(local);
      }
    });
  }

  // ============================================================
  // 1. 工具函数
  // ============================================================

  function formatDate(dateStr) {
    var d = new Date(dateStr);
    var weekdays = ["日","一","二","三","四","五","六"];
    return d.getFullYear() + "年" + (d.getMonth()+1) + "月" + d.getDate() + "日 · 周" + weekdays[d.getDay()];
  }

  /** 短日期: 2026-06-19 */
  function shortDate(dateStr) {
    var d = new Date(dateStr);
    var m = String(d.getMonth() + 1).padStart(2, "0");
    var day = String(d.getDate()).padStart(2, "0");
    return d.getFullYear() + "-" + m + "-" + day;
  }

  /** 分类 → 图标 */
  function categoryIcon(cat) {
    var map = {
      "技术": "💻",
      "随笔": "✍️",
      "学习笔记": "📖",
      "物理实验": "🔬",
    };
    return map[cat] || "📄";
  }

  // ============================================================
  // 2. 组件渲染
  // ============================================================

  /** 页头 —— 左标右导 */
  function renderHeader(currentRoute) {
    var isHome = currentRoute === "/" || currentRoute === "";

    return ""
      + "<header class=\"header\">"
      +   "<div class=\"header-inner\">"
      +     "<div class=\"header-left\">"
      +       "<a href=\"#/\" class=\"header-logo\" aria-label=\"首页\"></a>"
      +       "<a href=\"#/\" class=\"site-title\">" + SITE.title + "</a>"
      +     "</div>"
      +     "<nav class=\"header-nav\">"
      +       "<a href=\"#/\" class=\"" + (isHome ? "active" : "") + "\">首页</a>"
      +       "<a href=\"#/games\" class=\"" + (currentRoute === "/games" ? "active" : "") + "\">游戏</a>"
      +       "<a href=\"#/profile\" class=\"" + (currentRoute === "/profile" ? "active" : "") + "\">简介</a>"
      +       "<a href=\"#/about\" class=\"" + (currentRoute === "/about" ? "active" : "") + "\">关于</a>"
      +       "<a href=\"#/editor\" class=\"" + (currentRoute === "/editor" || currentRoute === "/edit" ? "active" : "") + "\">✎ 写文章</a>"
      +     "</nav>"
      +   "</div>"
      + "</header>";
  }

  /** Hero 区 —— 首页顶部大标题 + 每日一言 */
  function renderHero() {
    var filterBtns = "";
    if (SITE.categories && SITE.categories.length > 0) {
      filterBtns = SITE.categories.map(function(cat) {
        return "<button class=\"filter-btn\" data-category=\"" + cat + "\">" + cat + "</button>";
      }).join("");
    }

    var season = getSeasonInfo();
    return ""
      + "<section class=\"hero\">"
      +   "<span class=\"hero-greeting\">✺ 探索 · 思考 · 记录</span>"
      +   "<h1 class=\"hero-title\">" + SITE.title + "</h1>"
      +   "<p class=\"hero-subtitle\">" + SITE.subtitle + "</p>"
      +   "<div class=\"daily-quote\" id=\"daily-quote\">"
      +     "<span class=\"daily-quote-season\">" + season.icon + " " + season.label + "</span>"
      +     "<blockquote class=\"daily-quote-text\" id=\"daily-quote-text\">加载中…</blockquote>"
      +     "<cite class=\"daily-quote-from\" id=\"daily-quote-from\"></cite>"
      +   "</div>"
      +   (filterBtns ? "<div class=\"hero-filter\">" + filterBtns + "</div>" : "")
      + "</section>";
  }

  /** 文章卡片 —— 用户文章显示 📝 标记 */
  function renderArticleCard(article) {
    var tagsHtml = "";
    if (article.tags && article.tags.length > 0) {
      tagsHtml = article.tags.map(function(t) { return "<span class=\"tag\">" + t + "</span>"; }).join("");
    }

    var userBadge = window.isUserArticle && window.isUserArticle(article.id)
      ? " <span title=\"在线编写\" style=\"font-size:0.7rem;opacity:0.5\">📝</span>" : "";

    return ""
      + "<li class=\"article-item\">"
      +   "<a href=\"#/article/" + article.id + "\" class=\"article-card\">"
      +     "<div class=\"card-icon\">" + categoryIcon(article.category) + "</div>"
      +     "<h3 class=\"card-title\">" + article.title + userBadge + "</h3>"
      +     "<p class=\"card-excerpt\">" + article.excerpt + "</p>"
      +     "<div class=\"card-footer\">"
      +       "<span class=\"card-date\">" + shortDate(article.date) + "</span>"
      +       "<div class=\"card-meta-right\">"
      +         (tagsHtml ? tagsHtml : "")
      +         "<span class=\"category-tag\">" + article.category + "</span>"
      +       "</div>"
      +     "</div>"
      +   "</a>"
      + "</li>";
  }

  /** 页脚 */
  function renderFooter() {
    var socialHtml = "";
    if (SITE.social) {
      var s = SITE.social;
      if (s.github) socialHtml += "<a href=\"" + s.github + "\" target=\"_blank\" rel=\"noopener\">GitHub</a>";
      if (s.email) {
        if (socialHtml) socialHtml += " <span class=\"separator\">·</span> ";
        socialHtml += "<a href=\"mailto:" + s.email + "\">Gmail</a>";
      }
      if (s.qqEmail) {
        if (socialHtml) socialHtml += " <span class=\"separator\">·</span> ";
        socialHtml += "<a href=\"mailto:" + s.qqEmail + "\">QQ邮箱</a>";
      }
      if (s.wechat) {
        if (socialHtml) socialHtml += " <span class=\"separator\">·</span> ";
        socialHtml += "<span title=\"微信号：" + s.wechat + "\" style=\"cursor:pointer;\" onclick=\"navigator.clipboard&&navigator.clipboard.writeText('" + s.wechat + "');var t=this;t.textContent='✓ 已复制';setTimeout(function(){t.textContent='微信';},1500);\">微信</span>";
      }
    }

    var year = new Date().getFullYear();
    var yearStr = year === SITE.since ? year : SITE.since + "–" + year;

    return ""
      + "<footer class=\"footer\">"
      +   "<div class=\"footer-inner\">"
      +     (socialHtml ? "<div class=\"social-links\">" + socialHtml + "</div>" : "")
      +     "<p class=\"copyright\">© " + yearStr + " " + SITE.author + " · Powered by curiosity</p>"
      +   "</div>"
      + "</footer>";
  }

  // ============================================================
  // 3. 页面渲染
  // ============================================================

  /** 首页 */
  function renderHome(category) {
    var articles = window.getAllArticles();

    if (category && category !== "全部") {
      articles = articles.filter(function(a) { return a.category === category; });
    }

    var listHtml = articles.length > 0
      ? "<ul class=\"article-grid\">" + articles.map(renderArticleCard).join("") + "</ul>"
      : "<div class=\"empty-state\"><p>这个分类下还没有文章，敬请期待。</p></div>";

    return ""
      + "<main class=\"main\">"
      +   renderHero()
      +   "<section class=\"article-grid-section\">"
      +     "<div class=\"section-header\">"
      +       "<span class=\"section-label\">" + (category && category !== "全部" ? category : "最新文章") + "</span>"
      +       "<span style=\"font-size:0.78rem;color:var(--color-text-tertiary)\">" + articles.length + " 篇</span>"
      +     "</div>"
      +     listHtml
      +   "</section>"
      + "</main>";
  }

  /** 文章详情 */
  function renderArticleDetail(article) {
    if (!article) return render404();

    var tagsHtml = article.tags
      ? article.tags.map(function(t) { return "<span class=\"tag\">" + t + "</span>"; }).join("")
      : "";

    var editBtn = "";
    if (window.isUserArticle && window.isUserArticle(article.id)) {
      editBtn = "<a href=\"#/editor/" + article.id + "\" class=\"article-edit-btn\">✎ 编辑此文</a>";
    }

    return ""
      + "<main class=\"main\">"
      +   "<div class=\"article-detail-wrapper\">"
      +     "<article class=\"article-detail\">"
      +       "<a href=\"#/\" class=\"back-link\"><span class=\"arrow\">←</span> 返回首页</a>"
      +       (editBtn ? editBtn : "")
      +       "<header class=\"article-header\">"
      +         "<h1 class=\"article-title\">" + article.title + "</h1>"
      +         "<div class=\"article-meta\">"
      +           "<span class=\"date\">" + formatDate(article.date) + "</span>"
      +           "<span class=\"separator\">·</span>"
      +           "<span class=\"category-tag\">" + article.category + "</span>"
      +         "</div>"
      +         (tagsHtml ? "<div class=\"article-tags\">" + tagsHtml + "</div>" : "")
      +       "</header>"
      +       "<div class=\"article-body\">" + article.content + "</div>"
      +     "</article>"
      +   "</div>"
      + "</main>";
  }

  /** 关于页面 */
  function renderAbout() {
    return ""
      + "<main class=\"main\">"
      +   "<div class=\"article-detail-wrapper\">"
      +     "<div class=\"about-page\">"
      +       "<article>"
      +         "<header class=\"article-header\">"
      +           "<h1 class=\"article-title\">关于</h1>"
      +         "</header>"
      +         "<div class=\"article-body\">" + SITE.aboutContent + "</div>"
      +       "</article>"
      +     "</div>"
      +   "</div>"
      + "</main>";
  }

  /** 个人简介页面 */
  function renderProfile() {
    return ""
      + "<main class=\"main\">"
      +   "<div class=\"article-detail-wrapper\">"
      +     "<div class=\"profile-page\">"
      +       "<article>"
      +         "<header class=\"article-header\">"
      +           "<h1 class=\"article-title\">个人简介</h1>"
      +         "</header>"
      +         "<div class=\"article-body\">" + SITE.profileContent + "</div>"
      +       "</article>"
      +     "</div>"
      +   "</div>"
      + "</main>";
  }

  /** 写文章 / 编辑文章 */
  function renderEditor(articleId) {
    var isEdit = !!articleId;
    var article = isEdit ? window.findArticle(articleId) : null;
    if (isEdit && !article) return render404();

    var title = article ? article.title : "";
    var category = article ? article.category : (SITE.categories[1] || "随笔");
    var tagsStr = article && article.tags ? article.tags.join("，") : "";
    var excerpt = article ? article.excerpt : "";
    var content = article ? article.content : "";
    var date = article ? article.date : window._blogUtils.todayStr();

    // 分类选项
    var catOptions = SITE.categories.filter(function(c) { return c !== "全部"; }).map(function(c) {
      return "<option value=\"" + c + "\"" + (category === c ? " selected" : "") + ">" + c + "</option>";
    }).join("");

    return ""
      + "<main class=\"main\">"
      +   "<div class=\"article-detail-wrapper\">"
      +     "<div class=\"editor-page\">"
      +       "<a href=\"" + (isEdit ? "#/article/" + articleId : "#/") + "\" class=\"back-link\"><span class=\"arrow\">←</span> " + (isEdit ? "返回文章" : "返回首页") + "</a>"
      +       "<h1 class=\"article-title\" style=\"margin-bottom:var(--spacing-lg)\">" + (isEdit ? "编辑文章" : "写文章") + "</h1>"

      // 表单
      +       "<div class=\"editor-form\">"

      // 标题
      +         "<label class=\"editor-label\">标题 <span class=\"editor-required\">*</span></label>"
      +         "<input type=\"text\" id=\"editor-title\" class=\"editor-input\" value=\"" + escapeAttr(title) + "\" placeholder=\"文章标题\">"

      // 分类 + 日期
      +         "<div class=\"editor-row\">"
      +           "<div class=\"editor-col\">"
      +             "<label class=\"editor-label\">分类</label>"
      +             "<select id=\"editor-category\" class=\"editor-input\">" + catOptions + "</select>"
      +           "</div>"
      +           "<div class=\"editor-col\">"
      +             "<label class=\"editor-label\">日期</label>"
      +             "<input type=\"date\" id=\"editor-date\" class=\"editor-input\" value=\"" + date + "\">"
      +           "</div>"
      +         "</div>"

      // 标签
      +         "<label class=\"editor-label\">标签 <span class=\"editor-hint\">（用中文逗号或英文逗号分隔）</span></label>"
      +         "<input type=\"text\" id=\"editor-tags\" class=\"editor-input\" value=\"" + escapeAttr(tagsStr) + "\" placeholder=\"博客, 随想\">"

      // 摘要
      +         "<label class=\"editor-label\">摘要 <span class=\"editor-required\">*</span></label>"
      +         "<textarea id=\"editor-excerpt\" class=\"editor-textarea editor-excerpt\" rows=\"2\" placeholder=\"用一两句话概括文章内容...\">" + escapeHtml(excerpt) + "</textarea>"

      // 正文
      +         "<label class=\"editor-label\">正文 <span class=\"editor-required\">*</span> <span class=\"editor-hint\">（支持 HTML：&lt;h2&gt; &lt;p&gt; &lt;blockquote&gt; &lt;pre&gt; &lt;code&gt; &lt;img&gt; &lt;ul&gt; &lt;ol&gt; &lt;li&gt; &lt;strong&gt; &lt;em&gt; &lt;a&gt;）</span></label>"
      +         "<textarea id=\"editor-content\" class=\"editor-textarea editor-content\" rows=\"18\" placeholder=\"<h2>小标题</h2>&#10;<p>正文内容...</p>&#10;&#10;<blockquote>&#10;  引用文字...&#10;</blockquote>\">" + escapeHtml(content) + "</textarea>"

      // 快捷插入按钮
      +         "<div class=\"editor-insert-btns\">"
      +           "<span class=\"editor-insert-label\">快捷插入：</span>"
      +           "<button class=\"insert-btn\" data-tag=\"h2\">标题</button>"
      +           "<button class=\"insert-btn\" data-tag=\"p\">段落</button>"
      +           "<button class=\"insert-btn\" data-tag=\"blockquote\">引用</button>"
      +           "<button class=\"insert-btn\" data-tag=\"pre\">代码块</button>"
      +           "<button class=\"insert-btn\" data-tag=\"ul\">列表</button>"
      +           "<button class=\"insert-btn\" data-tag=\"img\">图片</button>"
      +         "</div>"

      // 操作按钮
      +         "<div class=\"editor-actions\">"
      +           "<button class=\"game-btn\" id=\"editor-save\">" + (isEdit ? "更新文章" : "发布文章") + "</button>"
      +           (isEdit ? "<button class=\"game-btn editor-delete-btn\" id=\"editor-delete\">删除文章</button>" : "")
      +         "</div>"

      +         "<p id=\"editor-msg\" class=\"editor-msg\"></p>"
      +       "</div>"

      // 隐藏字段：原始 id
      +       "<input type=\"hidden\" id=\"editor-id\" value=\"" + (isEdit ? articleId : "") + "\">"

      +     "</div>"
      +   "</div>"
      + "</main>";

    // HTML 转义辅助
    function escapeAttr(str) { return str.replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); }
    function escapeHtml(str) { return str.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); }
  }

  /** 游戏页面 */
  function renderGame(gameId) {
    var gameMap = {
      "snake": { init: "initSnake", title: "贪吃蛇" },
      "rolling-sky": { init: "initRollingSky", title: "滚动的天空" },
      "space-shooter": { init: "initSpaceShooter", title: "星际战机" },
    };
    var cfg = gameMap[gameId];
    if (!cfg) return render404();
    return '<main class="main" id="game-mount" data-game="' + gameId + '"></main>';
  }

  /** 挂载游戏（DOM 就绪后调用） */
  function mountGame(gameId) {
    var mount = document.getElementById("game-mount");
    if (!mount) return;

    var gameMap = {
      "snake": "initSnake",
      "rolling-sky": "initRollingSky",
      "space-shooter": "initSpaceShooter",
    };
    var initFn = gameMap[gameId];
    if (initFn && window.Games && window.Games[initFn]) {
      if (window._gameCleanup) {
        window._gameCleanup();
        window._gameCleanup = null;
      }
      window._gameCleanup = window.Games[initFn](mount);
    }
  }

  /** 404 */
  function render404() {
    return ""
      + "<main class=\"main\">"
      +   "<div class=\"container\">"
      +     "<div class=\"page-404\">"
      +       "<div class=\"code\">404</div>"
      +       "<p>页面未找到</p>"
      +       "<a href=\"#/\" class=\"back-link\"><span class=\"arrow\">←</span> 返回首页</a>"
      +     "</div>"
      +   "</div>"
      + "</main>";
  }

  // ============================================================
  // 4. 编辑器事件绑定
  // ============================================================

  function bindEditorEvents() {
    // 保存按钮
    var saveBtn = document.getElementById("editor-save");
    if (saveBtn) {
      saveBtn.addEventListener("click", function () {
        var title = document.getElementById("editor-title").value.trim();
        var category = document.getElementById("editor-category").value;
        var date = document.getElementById("editor-date").value;
        var tagsRaw = document.getElementById("editor-tags").value.trim();
        var excerpt = document.getElementById("editor-excerpt").value.trim();
        var content = document.getElementById("editor-content").value.trim();
        var originalId = document.getElementById("editor-id").value;

        if (!title) { showMsg("请填写标题", "error"); return; }
        if (!excerpt) { showMsg("请填写摘要", "error"); return; }
        if (!content) { showMsg("请填写正文", "error"); return; }

        // 解析标签
        var tags = [];
        if (tagsRaw) {
          tags = tagsRaw.split(/[，,]/).map(function(t) { return t.trim(); }).filter(Boolean);
        }

        // 生成 id
        var id = originalId || window._blogUtils.generateSlug(title);

        // 检查 id 唯一性（排除自身）
        var existing = window.findArticle(id);
        if (existing && existing.id !== originalId) {
          id = id + "-" + Date.now().toString(36);
        }

        var article = {
          id: id,
          title: title,
          date: date || window._blogUtils.todayStr(),
          category: category,
          tags: tags,
          excerpt: excerpt,
          content: content,
        };

        window.saveArticle(article);
        showMsg("✓ 文章已保存！", "success");

        // 跳转到文章详情
        setTimeout(function () {
          window.location.hash = "#/article/" + id;
        }, 600);
      });
    }

    // 删除按钮
    var deleteBtn = document.getElementById("editor-delete");
    if (deleteBtn) {
      deleteBtn.addEventListener("click", function () {
        var id = document.getElementById("editor-id").value;
        if (!id) return;
        if (!confirm("确定要删除这篇文章吗？此操作不可撤销。")) return;
        var ok = window.deleteArticle(id);
        if (ok) {
          showMsg("已删除", "success");
          setTimeout(function () {
            window.location.hash = "#/";
          }, 400);
        } else {
          showMsg("删除失败", "error");
        }
      });
    }

    // 快捷插入按钮
    var insertBtns = document.querySelectorAll(".insert-btn");
    insertBtns.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var tag = this.dataset.tag;
        var textarea = document.getElementById("editor-content");
        if (!textarea) return;

        var start = textarea.selectionStart;
        var end = textarea.selectionEnd;
        var before = textarea.value.substring(0, start);
        var selected = textarea.value.substring(start, end) || "内容";
        var after = textarea.value.substring(end);

        var snippets = {
          h2: "<h2>" + selected + "</h2>",
          p: "<p>" + selected + "</p>",
          blockquote: "<blockquote>\n  <p>" + selected + "</p>\n</blockquote>",
          pre: "<pre><code>" + selected + "</code></pre>",
          ul: "<ul>\n  <li>" + selected + "</li>\n  <li>...</li>\n</ul>",
          img: '<img src="https://..." alt="' + selected + '">',
        };

        textarea.value = before + (snippets[tag] || "") + after;
        textarea.focus();
        textarea.setSelectionRange(start, start + (snippets[tag] || "").length);
      });
    });

    function showMsg(msg, type) {
      var el = document.getElementById("editor-msg");
      if (!el) return;
      el.textContent = msg;
      el.className = "editor-msg editor-msg-" + type;
      if (type === "success") {
        setTimeout(function () { el.textContent = ""; el.className = "editor-msg"; }, 3000);
      }
    }
  }

  // ============================================================
  // 5. 路由系统
  // ============================================================

  function parseRoute(hash) {
    var path = hash.replace(/^#\/?/, "");
    if (!path || path === "/") return { page: "home" };

    var m = path.match(/^article\/(.+)/);
    if (m) return { page: "article", id: m[1] };

    m = path.match(/^category\/(.+)/);
    if (m) return { page: "home", category: decodeURIComponent(m[1]) };

    m = path.match(/^editor\/(.+)/);
    if (m) return { page: "editor", id: m[1] };

    if (path === "about") return { page: "about" };
    if (path === "profile") return { page: "profile" };
    if (path === "games") return { page: "games" };
    if (path === "editor") return { page: "editor" };

    m = path.match(/^game\/(.+)/);
    if (m) return { page: "game", id: m[1] };

    return { page: "404" };
  }

  function getNavKey(route) {
    if (route.page === "home") return "/";
    if (route.page === "about") return "/about";
    if (route.page === "profile") return "/profile";
    if (route.page === "games" || route.page === "game") return "/games";
    if (route.page === "editor") return "/editor";
    return "/" + route.page;
  }

  /** 主渲染 */
  function render() {
    var route = parseRoute(window.location.hash);
    var pageHtml = "";
    var activeCategory = null;

    switch (route.page) {
      case "home":
        activeCategory = route.category || null;
        pageHtml = renderHome(activeCategory);
        break;
      case "article":
        var article = window.findArticle(route.id);
        pageHtml = renderArticleDetail(article);
        break;
      case "about":
        pageHtml = renderAbout();
        break;
      case "profile":
        pageHtml = renderProfile();
        break;
      case "editor":
        pageHtml = renderEditor(route.id || null);
        break;
      case "games":
        pageHtml = window.Games.renderHub();
        break;
      case "game":
        pageHtml = renderGame(route.id);
        break;
      default:
        pageHtml = render404();
    }

    // 路由切换时清理游戏
    if (route.page !== "game" && window._gameCleanup) {
      window._gameCleanup();
      window._gameCleanup = null;
    }

    document.getElementById("app").innerHTML =
      renderHeader(getNavKey(route)) + pageHtml + renderFooter();

    if (route.page === "editor") {
      bindEditorEvents();
    }

    if (route.page === "game") {
      mountGame(route.id);
    }

    if (route.page === "home") {
      highlightFilter(activeCategory || "全部");
      bindFilterEvents();
      bindDailyQuote();
    }

    window.scrollTo(0, 0);
  }

  function bindDailyQuote() {
    getDailyQuote(function (quote) {
      var textEl = document.getElementById("daily-quote-text");
      var fromEl = document.getElementById("daily-quote-from");
      if (textEl) {
        textEl.textContent = "“" + quote.text + "”";
        textEl.style.opacity = "0";
        textEl.style.transition = "opacity 0.6s ease";
        requestAnimationFrame(function () {
          textEl.style.opacity = "1";
        });
      }
      if (fromEl && quote.from) {
        fromEl.textContent = "—— " + quote.from;
      }
      if (quote.remote) {
        var dot = document.querySelector(".daily-quote-season");
        if (dot) dot.textContent = dot.textContent + " · 一言";
      }
    });
  }

  // ============================================================
  // 6. 事件绑定
  // ============================================================

  function bindFilterEvents() {
    var btns = document.querySelectorAll(".filter-btn");
    btns.forEach(function(btn) {
      btn.addEventListener("click", function() {
        var cat = this.getAttribute("data-category");
        if (cat === "全部") window.location.hash = "#/";
        else window.location.hash = "#/category/" + encodeURIComponent(cat);
      });
    });
  }

  function highlightFilter(cat) {
    var btns = document.querySelectorAll(".filter-btn");
    btns.forEach(function(btn) {
      btn.classList.toggle("active", btn.getAttribute("data-category") === cat);
    });
  }

  // ============================================================
  // 7. 启动
  // ============================================================

  window.addEventListener("hashchange", render);

  if (!window.location.hash) window.location.hash = "#/";
  render();

})();
