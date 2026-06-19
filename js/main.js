/* ============================================================
   main.js —— 路由系统与页面渲染 / DeepSeek 风格
   路由：hash → 首页 / 文章详情 / 关于
   一般不需要修改这个文件
   ============================================================ */

(function () {
  "use strict";

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
      +     "</nav>"
      +   "</div>"
      + "</header>";
  }

  /** Hero 区 —— 首页顶部大标题 */
  function renderHero() {
    var filterBtns = "";
    if (SITE.categories && SITE.categories.length > 0) {
      filterBtns = SITE.categories.map(function(cat) {
        return "<button class=\"filter-btn\" data-category=\"" + cat + "\">" + cat + "</button>";
      }).join("");
    }

    return ""
      + "<section class=\"hero\">"
      +   "<span class=\"hero-greeting\">✺ 探索 · 思考 · 记录</span>"
      +   "<h1 class=\"hero-title\">" + SITE.title + "</h1>"
      +   "<p class=\"hero-subtitle\">" + SITE.subtitle + "</p>"
      +   (filterBtns ? "<div class=\"hero-filter\">" + filterBtns + "</div>" : "")
      + "</section>";
  }

  /** 文章卡片 */
  function renderArticleCard(article) {
    var tagsHtml = "";
    if (article.tags && article.tags.length > 0) {
      tagsHtml = article.tags.map(function(t) { return "<span class=\"tag\">" + t + "</span>"; }).join("");
    }

    return ""
      + "<li class=\"article-item\">"
      +   "<a href=\"#/article/" + article.id + "\" class=\"article-card\">"
      +     "<div class=\"card-icon\">" + categoryIcon(article.category) + "</div>"
      +     "<h3 class=\"card-title\">" + article.title + "</h3>"
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
    var articles = ARTICLES.slice().sort(function(a,b) { return new Date(b.date) - new Date(a.date); });

    if (category && category !== "全部") {
      articles = articles.filter(function(a) { return a.category === category; });
    }

    // 高亮当前筛选按钮
    var activeCat = category || "全部";

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
  function renderArticle(article) {
    if (!article) return render404();

    var tagsHtml = article.tags
      ? article.tags.map(function(t) { return "<span class=\"tag\">" + t + "</span>"; }).join("")
      : "";

    return ""
      + "<main class=\"main\">"
      +   "<div class=\"article-detail-wrapper\">"
      +     "<article class=\"article-detail\">"
      +       "<a href=\"#/\" class=\"back-link\"><span class=\"arrow\">←</span> 返回首页</a>"
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

  /** 游戏页面 */
  function renderGame(gameId) {
    var gameMap = {
      "snake": { init: "initSnake", title: "贪吃蛇" },
      "rolling-sky": { init: "initRollingSky", title: "滚动的天空" },
      "space-shooter": { init: "initSpaceShooter", title: "星际战机" },
    };
    var cfg = gameMap[gameId];
    if (!cfg) return render404();

    // 返回一个带标记的容器，由 render() 特殊处理
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
      // 清理上一个游戏
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
  // 4. 路由系统
  // ============================================================

  function parseRoute(hash) {
    var path = hash.replace(/^#\/?/, "");
    if (!path || path === "/") return { page: "home" };

    var m = path.match(/^article\/(.+)/);
    if (m) return { page: "article", id: m[1] };

    m = path.match(/^category\/(.+)/);
    if (m) return { page: "home", category: decodeURIComponent(m[1]) };

    if (path === "about") return { page: "about" };
    if (path === "profile") return { page: "profile" };
    if (path === "games") return { page: "games" };

    m = path.match(/^game\/(.+)/);
    if (m) return { page: "game", id: m[1] };

    return { page: "404" };
  }

  function getNavKey(route) {
    if (route.page === "home") return "/";
    if (route.page === "about") return "/about";
    if (route.page === "profile") return "/profile";
    if (route.page === "games" || route.page === "game") return "/games";
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
        var article = ARTICLES.find(function(a) { return a.id === route.id; });
        pageHtml = renderArticle(article);
        break;
      case "about":
        pageHtml = renderAbout();
        break;
      case "profile":
        pageHtml = renderProfile();
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

    if (route.page === "game") {
      mountGame(route.id);
    }

    if (route.page === "home") {
      highlightFilter(activeCategory || "全部");
      bindFilterEvents();
    }

    window.scrollTo(0, 0);
  }

  // ============================================================
  // 5. 事件绑定
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
  // 6. 启动
  // ============================================================

  window.addEventListener("hashchange", render);

  if (!window.location.hash) window.location.hash = "#/";
  render();

})();
