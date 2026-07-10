<<<<<<< HEAD
const versions = [
    "1.18.10",
    "1.21.50.7",
    "1.21.60.10",
    "1.21.70.3",
    "1.21.80.3",
    "1.21.90.3",
    "1.21.100.6",
    "1.21.110.2",
    "1.21.120.4",
];
=======
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
>>>>>>> 859f0465f3f59e975ffcd1e7407aff3dccefe39e

const menu = document.getElementById("menu");
const docContent = document.getElementById("doc-content");
const menuToggle = document.getElementById("menu-toggle");
const docsCache = new Map();
const htmlCache = new Map();

let currentDocUrl = new URL("initial-page.html", document.baseURI);
let loadController;

function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

async function fetchText(url, signal) {
    const key = url.href;
    if (htmlCache.has(key)) return htmlCache.get(key);

    const response = await fetch(url, { signal });
    if (!response.ok) {
        throw new Error(`HTTP ${response.status} ${response.statusText}`);
    }

    const text = await response.text();
    htmlCache.set(key, text);
    return text;
}

async function fetchDocs(version) {
    if (docsCache.has(version)) return docsCache.get(version);

    const indexUrl = new URL(`${version}/`, document.baseURI);
    const html = await fetchText(indexUrl);
    const parsed = new DOMParser().parseFromString(html, "text/html");
    const docs = [...parsed.querySelectorAll("a[href]")]
        .map(link => link.getAttribute("href"))
        .filter(href => href && href.toLowerCase().endsWith(".html"))
        .map(href => href.split("/").pop())
        .map(file => ({
            name: decodeURIComponent(file.replace(/\.html$/i, "")),
            path: `${version}/${file}`,
        }));

    docsCache.set(version, docs);
    return docs;
}

function toggleVersion(title) {
    const list = title.nextElementSibling;
    title.classList.toggle("expanded");
    list.classList.toggle("visible");

    const expanded = [...menu.querySelectorAll(".version-title.expanded")]
        .map(item => item.textContent);
    localStorage.setItem("docsMenu.expanded", JSON.stringify(expanded));
}

async function buildMenu() {
<<<<<<< HEAD
    try {
        const sections = await Promise.all(versions.map(async version => {
            const docs = await fetchDocs(version);
            const items = docs.map(doc => (
                `<li><a href="${encodeURI(doc.path)}" data-path="${escapeHtml(doc.path)}">${escapeHtml(doc.name)}</a></li>`
            )).join("");

            return `<li>
                <div class="version-title" tabindex="0" role="button" aria-expanded="false">${version}</div>
                <ul class="version-list">${items}</ul>
            </li>`;
        }));

        menu.innerHTML = `<ul>${sections.join("")}</ul>`;

        let expanded = [];
        try {
            expanded = JSON.parse(localStorage.getItem("docsMenu.expanded") || "[]");
        } catch {
            localStorage.removeItem("docsMenu.expanded");
        }

        menu.querySelectorAll(".version-title").forEach(title => {
            if (expanded.includes(title.textContent)) {
                title.classList.add("expanded");
                title.nextElementSibling.classList.add("visible");
                title.setAttribute("aria-expanded", "true");
            }

            title.addEventListener("click", () => {
                toggleVersion(title);
                title.setAttribute("aria-expanded", String(title.classList.contains("expanded")));
            });
            title.addEventListener("keydown", event => {
                if (event.key !== "Enter" && event.key !== " ") return;
                event.preventDefault();
                title.click();
            });
        });
    } catch (error) {
        menu.innerHTML = `<p class="load-error">目录加载失败：${escapeHtml(error.message)}</p>`;
    }
}

function updateActiveMenu(pathname) {
    menu.querySelectorAll("a.active").forEach(link => link.classList.remove("active"));
    menu.querySelectorAll("a[data-path]").forEach(link => {
        const linkUrl = new URL(link.dataset.path, document.baseURI);
        if (linkUrl.pathname === pathname) link.classList.add("active");
    });
}

async function loadDocument(target, options = {}) {
    const url = target instanceof URL ? target : new URL(target, currentDocUrl);
    const isInitialPage = url.pathname.endsWith("/initial-page.html");

    loadController?.abort();
    loadController = new AbortController();
    docContent.setAttribute("aria-busy", "true");
    docContent.innerHTML = '<p class="loading-message">正在加载文档…</p>';

    try {
        const html = await fetchText(url, loadController.signal);
        const parsed = new DOMParser().parseFromString(html, "text/html");
        const fragment = document.createDocumentFragment();

        [...parsed.body.childNodes].forEach(node => {
            fragment.appendChild(document.importNode(node, true));
        });

        currentDocUrl = url;
        docContent.classList.toggle("initial-page", isInitialPage);
        docContent.replaceChildren(fragment);
        docContent.scrollTop = 0;
        updateActiveMenu(url.pathname);

        if (url.hash) {
            requestAnimationFrame(() => {
                const targetElement = document.getElementById(decodeURIComponent(url.hash.slice(1)));
                targetElement?.scrollIntoView();
            });
        } else if (options.focus !== false) {
            docContent.focus({ preventScroll: true });
        }
    } catch (error) {
        if (error.name === "AbortError") return;
        docContent.innerHTML = `<div class="load-error">
            <h1>文档加载失败</h1>
            <p>${escapeHtml(url.pathname)}</p>
            <p>${escapeHtml(error.message)}</p>
        </div>`;
    } finally {
        docContent.removeAttribute("aria-busy");
    }
}

menu.addEventListener("click", event => {
    const link = event.target.closest("a[data-path]");
    if (!link) return;
    event.preventDefault();
    loadDocument(new URL(link.dataset.path, document.baseURI));
    menu.classList.remove("active");
});

docContent.addEventListener("click", event => {
    const link = event.target.closest("a[href]");
    if (!link) return;

    const href = link.getAttribute("href");
    if (!href || href.startsWith("#")) return;
    if (href.trim().toLowerCase().startsWith("javascript:")) {
        event.preventDefault();
        return;
    }

    const url = new URL(href, currentDocUrl);
    if (url.origin !== window.location.origin || !url.pathname.toLowerCase().endsWith(".html")) return;

    event.preventDefault();
    loadDocument(url);
});

menuToggle.addEventListener("click", () => {
    menu.classList.toggle("active");
});

loadDocument(new URL("initial-page.html", document.baseURI), { focus: false });
buildMenu();
=======
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
>>>>>>> 859f0465f3f59e975ffcd1e7407aff3dccefe39e
