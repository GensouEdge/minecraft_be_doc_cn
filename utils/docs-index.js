const versions = ["1.18.10",
                  "1.21.50.7",
                  "1.21.60.10",
                  "1.21.70.3",
                  "1.21.80.3",
                  "1.21.90.3",
                  "1.21.100.6",
                  "1.21.110.2",
                  "1.21.120.4",
                ];

const cssPath = new URL("styles/styles.css", document.baseURI).href;

const cache = new Map();

async function fetchDocs(version) {
    if (cache.has(version)) {
        return cache.get(version);
    }
    const res = await fetch(`${version}/`);
    const text = await res.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, "text/html");
    const links = [...doc.querySelectorAll("a")]
        .map(a => a.getAttribute("href"))
        .filter(h => h && h.endsWith(".html"))
        .map(h => h.split("/").pop());
    const docs = links.map(h => ({
        name: decodeURIComponent(h.replace(".html", "")),
        path: `${version}/${h}`
    }));
    cache.set(version, docs);
    return docs;
}

async function buildMenu() {
    const menu = document.getElementById("menu");

    const menuContent = await Promise.all(versions.map(async v => {
        const docs = await fetchDocs(v);
        const items = docs.map(d => `<li><a href="${d.path}"  data-path="${d.path}">${d.name}</a></li>`).join("");
        return `<li>
            <div class="version-title" tabindex="0">${v}</div>
            <ul class="version-list">${items}</ul>
        </li>`;
    }));
    menu.innerHTML = "<ul>" + menuContent.join("") + "</ul>";

    const expanded = JSON.parse(localStorage.getItem("docsMenu.expanded")||"[]");
    menu.querySelectorAll(".version-title").forEach(title => {
        const list = title.nextElementSibling;
        if(expanded.includes(title.textContent)){
            title.classList.add("expanded");
            list.classList.add("visible");
        }
        title.addEventListener("click", () => setTimeout(() => toggle(title), 0));
        title.addEventListener("keydown", e => {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setTimeout(() => toggle(title), 0);
            }
        });
    });

    function toggle(title) {
        const list = title.nextElementSibling;
        const isExpanded = title.classList.contains("expanded");
        if(isExpanded){
            title.classList.remove("expanded");
            list.classList.remove("visible");
        }else{
            title.classList.add("expanded");
            list.classList.add("visible");
        }
        saveState();
    }

    function saveState() {
        const expanded = [...menu.querySelectorAll(".version-title.expanded")].map(t=>t.textContent);
        localStorage.setItem("docsMenu.expanded", JSON.stringify(expanded));
    }
    menu.addEventListener("click", async e => {
        const link = e.target.closest("a[data-path]");
        if(!link) return;
        e.preventDefault();
        const path = link.dataset.path;
        menu.querySelectorAll("a.active").forEach(a=>a.classList.remove("active"));
        link.classList.add("active");
        await loadDocIntoIframe(path);
        document.getElementById('menu').classList.remove('active');
        document.getElementById('docFrame').classList.remove('active');

    });

    document.getElementById('menu-toggle').addEventListener('click', function() {
        requestAnimationFrame(() => {
            document.getElementById('menu').classList.toggle('active');
            document.getElementById('docFrame').classList.toggle('active');
        });
    });
}
async function loadDocIntoIframe(path) {
    const frame = document.getElementById("docFrame");
    frame.src = path;
}

function applyDocStyles() {
    const frame = document.getElementById("docFrame");

    try {
        const doc = frame.contentDocument;
        if (!doc || !doc.head) return;

        // 首页自带独立样式，正文和版本索引才使用公共文档样式
        const pathname = frame.contentWindow.location.pathname;
        if (pathname.endsWith("/initial-page.html")) return;

        if (doc.head.querySelector('link[data-doc-styles="true"]')) return;

        const link = doc.createElement("link");
        link.rel = "stylesheet";
        link.href = cssPath;
        link.dataset.docStyles = "true";
        doc.head.appendChild(link);
    } catch (error) {
        // 仅允许为同源文档注入样式；跨域页面保持默认
        console.warn("无法为文档加载样式：", error);
    }
}

const docFrame = document.getElementById("docFrame");
docFrame.addEventListener("load", applyDocStyles);
if (docFrame.contentDocument?.readyState === "complete") {
    applyDocStyles();
}

if ('requestIdleCallback' in window) {
    requestIdleCallback(buildMenu);
} else {
    buildMenu();
}
