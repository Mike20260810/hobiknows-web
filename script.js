/* ===========================
   GitHub Auto Feed
   ===========================
   아래 값만 실제 저장소 정보로 교체하면 됩니다.
*/

const GITHUB_USER = "YOUR_GITHUB_USERNAME";
const REPO_NAME = "YOUR_REPO_NAME";
const POSTS_FOLDER = "posts";

async function loadGitHubPosts() {
  const container = document.getElementById("github-posts-container");

  if (!container) return;

  // GitHub 정보가 아직 설정되지 않은 경우
  if (
    GITHUB_USER === "YOUR_GITHUB_USERNAME" ||
    REPO_NAME === "YOUR_REPO_NAME"
  ) {
    return;
  }

  try {
    // GitHub 저장소의 posts 폴더 조회
    const response = await fetch(
      `https://api.github.com/repos/${GITHUB_USER}/${REPO_NAME}/contents/${POSTS_FOLDER}`
    );

    if (!response.ok) {
      throw new Error(`GitHub API ${response.status}`);
    }

    const files = await response.json();

    // Markdown 파일만 추출
    const mdFiles = Array.isArray(files)
      ? files.filter((file) =>
          file.name.toLowerCase().endsWith(".md")
        )
      : [];

    // Markdown 파일이 없는 경우
    if (!mdFiles.length) {
      container.innerHTML = `
        <div class="github-card">
          <p>No Markdown posts found.</p>
        </div>
      `;
      return;
    }

    // 최대 6개의 Markdown 게시물 불러오기
    const posts = await Promise.all(
      mdFiles.slice(0, 6).map(async (file) => {
        const res = await fetch(file.download_url);
        const markdown = await res.text();

        return {
          name: file.name,
          markdown
        };
      })
    );

    // Markdown → HTML 변환 후 출력
    container.innerHTML = posts
      .map(
        (post) => `
          <article class="github-card">
            ${marked.parse(post.markdown)}
          </article>
        `
      )
      .join("");

  } catch (error) {
    console.error(error);

    container.innerHTML = `
      <div class="github-card">
        <p>
          GitHub feed를 불러오지 못했습니다.
          저장소 공개 여부와 API 경로를 확인해주세요.
        </p>
      </div>
    `;
  }
}


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


/* ===========================
   Page Init
   =========================== */

document.addEventListener("DOMContentLoaded", () => {
  loadGitHubPosts();
  initDropdownMenus();
});