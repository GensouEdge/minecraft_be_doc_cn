// menu-collapse.js
document.addEventListener("DOMContentLoaded", () => {
    const menu = document.getElementById("menu");
  
    menu.addEventListener("click", (e) => {
      const header = e.target.closest(".version-title");
      if (!header) return; // 不是版本标题就返回
  
      const versionList = header.nextElementSibling; // 紧跟标题的 ul
      if (!versionList) return;
  
      // 切换显示状态
      versionList.classList.toggle("visible");
      header.classList.toggle("expanded");
    });
  });
  