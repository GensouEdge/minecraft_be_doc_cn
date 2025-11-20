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
const cssPath = "../styles/styles.css";

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
        const items = docs.map(d => `<li><a href="${d.path}" target="docFrame" data-path="${d.path}">${d.name}</a></li>`).join("");
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
}
async function loadDocIntoIframe(path) {
    const iframe = document.getElementById("docFrame");
    try {
        const res = await fetch(path);
        const html = await res.text();
        const abs = new URL(path, window.location.href);
        const baseHref = abs.href.substring(0, abs.href.lastIndexOf("/") + 1);

        iframe.srcdoc = `
        <!doctype html>
        <html>
            <head>
                <meta charset="utf-8">
                <base href="${baseHref}">
                <link rel="stylesheet" href="${cssPath}">
            </head>
            <body>
                ${html}
            </body>
        </html>
        `;

        iframe.onload = () => {
            const doc = iframe.contentDocument;
            if (!doc) return;
            const links = doc.querySelectorAll("a[href]");
            links.forEach(a => {
                const href = a.getAttribute("href");
                if (!href) return;

                if (href.startsWith("#")) {
                    a.addEventListener("click", ev => {
                        ev.preventDefault();
                        const target = doc.getElementById(href.slice(1));
                        if (target) target.scrollIntoView();
                        else iframe.contentWindow.location.hash = href;
                    });
                    return;
                }
                if (href.trim().toLowerCase().startsWith("javascript:")) return;

                let url;
                try {
                    url = new URL(href, baseHref);
                } catch (e) {
                    return;
                }
                if (url.origin !== window.location.origin) return;
                if (!url.pathname.toLowerCase().endsWith(".html")) return;

                a.addEventListener("click", (ev) => {
                    ev.preventDefault();
                    const nextPath = url.pathname + url.search + url.hash;
                    loadDocIntoIframe(nextPath);
                });
            });
        };
    } catch (err) {
        iframe.srcdoc = `<p style="color:red;">加载失败：${path}</p>`;
    }
}

if ('requestIdleCallback' in window) {
    requestIdleCallback(buildMenu);
} else {
    buildMenu();
}