document.addEventListener("DOMContentLoaded", () => {
    const menu = document.getElementById("menu");

    menu.querySelectorAll(".version-title").forEach(title => {
        const ul = title.nextElementSibling;
        ul.classList.add("version-list");

        title.classList.add("version-title");
        title.addEventListener("click", () => {
            ul.classList.toggle("visible");
            title.classList.toggle("expanded");
        });
    });

    menu.addEventListener("click", (e) => {
        const link = e.target.closest("a[data-path]");
        if (!link) return;

        menu.querySelectorAll("a.active").forEach(a => a.classList.remove("active"));
        link.classList.add("active");
    });
});

document.getElementById('menu-toggle').addEventListener('click', function() {
    document.getElementById('menu').classList.toggle('active');
    document.getElementById('docFrame').classList.toggle('active');
});
