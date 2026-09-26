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
  initDropdownMenus();
});