/* ===========================
   Header Dropdown Menu
   =========================== */

function initDropdownMenus() {
  const dropdowns = document.querySelectorAll(".dropdown");

  if (!dropdowns.length) return;

  dropdowns.forEach((dropdown) => {
    const toggle = dropdown.querySelector(".dropdown-toggle");
    const menu = dropdown.querySelector(".dropdown-menu");

    if (!toggle || !menu) return;

    // 클릭 / 터치로 열기
    toggle.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();

      const isOpen = dropdown.classList.contains("open");

      // 다른 드롭다운 닫기
      dropdowns.forEach((item) => {
        item.classList.remove("open");
      });

      // 현재 메뉴 토글
      if (!isOpen) {
        dropdown.classList.add("open");
      }
    });

    // 메뉴 내부 클릭은 바깥 클릭으로 처리하지 않음
    menu.addEventListener("click", (event) => {
      event.stopPropagation();
    });
  });

  // 메뉴 밖 클릭 시 모두 닫기
  document.addEventListener("click", () => {
    dropdowns.forEach((dropdown) => {
      dropdown.classList.remove("open");
    });
  });

  // ESC 키로 모두 닫기
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      dropdowns.forEach((dropdown) => {
        dropdown.classList.remove("open");
      });
    }
  });
}


/* =========================================================
   Decap CMS Markdown Fetcher for Highlight Page
   ========================================================= */

// Front Matter 및 Markdown 파서 (정규식 오타 수정완료)
function parseMarkdown(text) {
  const frontMatterRegex = /^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/;
  const match = frontMatterRegex.exec(text);

  if (!match) return { meta: {}, body: text };

  const rawMeta = match[1];
  const body = match[2];
  const meta = {};

  rawMeta.split("\n").forEach((line) => {
    const parts = line.split(":");
    if (parts.length >= 2) {
      const key = parts[0].trim();
      let value = parts.slice(1).join(":").trim();
      // 따옴표 제거
      value = value.replace(/^["'](.*)["']$/, "$1");
      meta[key] = value;
    }
  });

  return { meta, body };
}

// GitHub API로 posts/highlight/ 내의 기사들을 로드하는 함수
async function loadHighlightPosts() {
  const leadContainer = document.querySelector(".lead-story");
  const newsGridContainer = document.querySelector(".highlight-news-grid");

  if (!leadContainer || !newsGridContainer) return;

  try {
    const response = await fetch("https://api.github.com/repos/Mike20260810/hobiknows-web/contents/posts/highlight");
    
    if (!response.ok) {
      console.warn("No dynamic CMS posts found or API limit reached.");
      return;
    }

    const files = await response.json();
    const mdFiles = files.filter(file => file.name.endsWith(".md"));

    if (mdFiles.length === 0) return;

    // 각 마크다운 파일 내용 가져오기
    const posts = await Promise.all(
      mdFiles.map(async (file) => {
        const res = await fetch(file.download_url);
        const text = await res.text();
        const { meta, body } = parseMarkdown(text);
        return { ...meta, body, downloadUrl: file.download_url };
      })
    );

    // 날짜 기준 내림차순 정렬 (최신순)
    posts.sort((a, b) => {
      const dateA = a.date ? new Date(a.date).getTime() : 0;
      const dateB = b.date ? new Date(b.date).getTime() : 0;
      return dateB - dateA;
    });

    // 1. Today's Lead Story (가장 최신글 1개) 렌더링
    const lead = posts[0];
    if (lead) {
      const formattedDate = lead.date ? new Date(lead.date).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }).toUpperCase() : "RECENT";
      
      leadContainer.innerHTML = `
        <div class="lead-story-image" style="background-image: url('${lead.image || 'https://images.unsplash.com/photo-1521295121783-8a321d551ad2?auto=format&fit=crop&w=1600&q=85'}');">
          <div class="lead-story-badge">TOP STORY</div>
        </div>
        <div class="lead-story-content">
          <div class="story-meta">
            ${lead.category || 'GLOBAL'} <span>·</span> ${formattedDate}
          </div>
          <h3>${lead.title || 'Untitled'}</h3>
          <p>${lead.summary || (lead.body ? lead.body.slice(0, 150) + '...' : '')}</p>
          <a href="${lead.downloadUrl}" target="_blank" class="read-story">Read Full Story <span>→</span></a>
        </div>
      `;
    }

    // 2. What Matters Today (그 다음 최신글들 렌더링)
    if (posts.length > 1) {
      const otherPosts = posts.slice(1, 4); // 최대 3개
      newsGridContainer.innerHTML = otherPosts.map(post => {
        return `
          <article class="highlight-news-card">
            <a href="${post.downloadUrl}" target="_blank" class="highlight-news-image">
              <img src="${post.image || 'https://images.unsplash.com/photo-1494412651409-8963ce7935a7?auto=format&fit=crop&w=800&q=80'}" alt="${post.title}">
            </a>
            <div class="highlight-news-body">
              <div class="news-category">${post.category || 'NEWS'}</div>
              <h3>${post.title || 'Untitled'}</h3>
              <p>${post.summary || (post.body ? post.body.slice(0, 100) + '...' : '')}</p>
              <div class="news-footer">
                <span>${post.date ? new Date(post.date).toLocaleDateString("en-US", { month: "short", day: "2-digit" }).toUpperCase() : 'RECENT'}</span>
                <a href="${post.downloadUrl}" target="_blank">→</a>
              </div>
            </div>
          </article>
        `;
      }).join('');
    }

  } catch (error) {
    console.error("Error loading CMS posts:", error);
  }
}

/* ===========================
   Page Init
   =========================== */

document.addEventListener("DOMContentLoaded", () => {
  initDropdownMenus();
  loadHighlightPosts();
});






/* =========================================================
   Decap CMS Markdown Fetcher for Highlight Page
   ========================================================= */

// Front Matter 및 Markdown 파서
function parseMarkdown(text) {
  const frontMatterRegex = /^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/;
  const match = frontMatterRegex.exec(text);

  if (!match) return { meta: {}, body: text };

  const rawMeta = match[1];
  const body = match[2];
  const meta = {};

  rawMeta.split("\n").forEach((line) => {
    const parts = line.split(":");
    if (parts.length >= 2) {
      const key = parts[0].trim();
      let value = parts.slice(1).join(":").trim();
      // 따옴표 제거
      value = value.replace(/^["'](.*)["']$/, "$1");
      meta[key] = value;
    }
  });

  return { meta, body };
}

// GitHub API를 통해 posts/highlight/ 목록을 읽어오는 함수
async function loadHighlightPosts() {
  const leadContainer = document.querySelector(".lead-story");
  const newsGridContainer = document.querySelector(".highlight-news-grid");

  if (!leadContainer || !newsGridContainer) return;

  try {
    const response = await fetch("https://api.github.com/repos/Mike20260810/hobiknows-web/contents/posts/highlight");
    
    if (!response.ok) {
      console.log("No dynamic CMS posts found or API limit reached.");
      return;
    }

    const files = await response.json();
    const mdFiles = files.filter(file => file.name.endsWith(".md"));

    if (mdFiles.length === 0) return;

    // 각 마크다운 파일의 내용 가져오기
    const posts = await Promise.all(
      mdFiles.map(async (file) => {
        const res = await fetch(file.download_url);
        const text = await res.text();
        const { meta, body } = parseMarkdown(text);
        return { ...meta, body, downloadUrl: file.download_url };
      })
    );

    // 날짜 기준 내림차순 정렬 (최신순)
    posts.sort((a, b) => {
      const dateA = a.date ? new Date(a.date).getTime() : 0;
      const dateB = b.date ? new Date(b.date).getTime() : 0;
      return dateB - dateA;
    });

    // 1. Today's Lead Story (가장 최신글 1개) 렌더링
    const lead = posts[0];
    if (lead) {
      const formattedDate = lead.date ? new Date(lead.date).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }).toUpperCase() : "RECENT";
      // 상세 페이지 URL 생성 (path 파라미터 전달)
      const detailUrl = `article.html?path=${encodeURIComponent(lead.downloadUrl)}`;

      leadContainer.innerHTML = `
        <div class="lead-story-image" style="background-image: url('${lead.image || 'https://images.unsplash.com/photo-1521295121783-8a321d551ad2?auto=format&fit=crop&w=1600&q=85'}');">
          <div class="lead-story-badge">TOP STORY</div>
        </div>
        <div class="lead-story-content">
          <div class="story-meta">
            ${lead.category || 'GLOBAL'} <span>·</span> ${formattedDate}
          </div>
          <h3><a href="${detailUrl}" style="color: inherit; text-decoration: none;">${lead.title || 'Untitled'}</a></h3>
          <p>${lead.summary || (lead.body ? lead.body.slice(0, 150) + '...' : '')}</p>
          <a href="${detailUrl}" class="read-story">Read Full Story <span>→</span></a>
        </div>
      `;
    }

    // 2. What Matters Today (그 다음 최신글들 렌더링)
    if (posts.length > 1) {
      const otherPosts = posts.slice(1, 4); // 최대 3개
      newsGridContainer.innerHTML = otherPosts.map(post => {
        const cardDetailUrl = `article.html?path=${encodeURIComponent(post.downloadUrl)}`;
        return `
          <article class="highlight-news-card">
            <a href="${cardDetailUrl}" class="highlight-news-image">
              <img src="${post.image || 'https://images.unsplash.com/photo-1494412651409-8963ce7935a7?auto=format&fit=crop&w=800&q=80'}" alt="${post.title}">
            </a>
            <div class="highlight-news-body">
              <div class="news-category">${post.category || 'NEWS'}</div>
              <h3><a href="${cardDetailUrl}" style="color: inherit; text-decoration: none;">${post.title || 'Untitled'}</a></h3>
              <p>${post.summary || (post.body ? post.body.slice(0, 100) + '...' : '')}</p>
              <div class="news-footer">
                <span>${post.date ? new Date(post.date).toLocaleDateString("en-US", { month: "short", day: "2-digit" }).toUpperCase() : 'RECENT'}</span>
                <a href="${cardDetailUrl}">→</a>
              </div>
            </div>
          </article>
        `;
      }).join('');
    }

  } catch (error) {
    console.error("Error loading CMS posts:", error);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  if (typeof initDropdownMenus === "function") {
    initDropdownMenus();
  }
  loadHighlightPosts();
});







