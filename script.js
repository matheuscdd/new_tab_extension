
const modals = Object.freeze({
    icon: document.querySelector('#modal-icon'),
    text: document.querySelector('#modal-text'),
    background: document.querySelector('#modal-background'),
    grid: document.querySelector('#modal-grid-system'),
    importer: document.querySelector('#modal-importer'),
});

const inputs = Object.freeze({
    hasFill: document.querySelector('.hasFill'),
    image: document.querySelector('.image'),
    fill: document.querySelector('.fill'),
    color: document.querySelector('.color'),
    size: document.querySelector('.size'),
    gapRow: document.querySelector('.gap-row'),
    gapColumn: document.querySelector('.gap-column'),
    importer: document.querySelector('.importer'),
    dimensions: document.querySelector('.dimensions'),
    icon: document.querySelector('.icon'),
});

const btns = Object.freeze({
    closers: Array.from(document.querySelectorAll('.close')),
    specific: Array.from(document.querySelectorAll('button.specific')),
    delBookmark: document.querySelector('.delBookmark'),
    configIcon: document.querySelector('.configIcon'),
    configBackground: document.querySelector('.configBackground'),
    insertIcon: document.querySelector('.insertIcon'),
    importIcons: document.querySelector('.importIcons'),
    sendImporter: document.querySelector('.sendImporter'),
    configGrid: document.querySelector('.configGrid'),
    configText: document.querySelector('.configText'),
});

const ctxMenu = document.querySelector('.context-menu');
const bookmarksList = document.querySelector('#bookmarks');
const ctx = {};

document.addEventListener('DOMContentLoaded', async function () {
    document.body.oncontextmenu = showContextMenuBody;
    btns.delBookmark.onclick = delBookmark;
    btns.configIcon.onclick = configIcon;
    btns.configBackground.onclick = insertBackground;
    btns.importIcons.onclick = prepareImportIcons;
    btns.insertIcon.onclick = insertIcon;
    btns.sendImporter.onclick = importIcons;
    btns.configGrid.onclick = configGrid;
    btns.configText.onclick = configText;
    btns.closers.forEach(btn => btn.onclick = closeAllModals);

    inputs.gapRow.oninput = prepareGap;
    inputs.gapColumn.oninput = prepareGap;
    inputs.dimensions.oninput = prepareGap;
    inputs.image.oninput = prepareBackground;
    inputs.fill.oninput = prepareBackground;
    inputs.color.oninput = prepareText;
    inputs.size.oninput = prepareText;
    inputs.hasFill.onchange = toggleFill;

    document.body.onclick = (e) => {
        e.stopPropagation();
        ctxMenu.classList.add('d-none');
    }

    initEvents();
});

function initEvents() {
    bookmarksList.innerHTML = '';
    if (!localStorage.getItem('background')) {
        localStorage.setItem('background', JSON.stringify({
            fill: '#d3d0c3',
            hasFill: true,
        }));
    }
    const background = JSON.parse(localStorage.getItem('background'));
    inputs.hasFill.checked = background.hasFill;
    inputs.hasFill.dispatchEvent(new Event('change'));
    inputs.image.value = background.image || '';
    inputs.fill.value = background.fill || '';
    applyBackground();

    if (!localStorage.getItem('grid')) {
        localStorage.setItem('grid', JSON.stringify({
            column: 40,
            row: 60,
            dimensions: 70,
        }));
    }
    const grid = JSON.parse(localStorage.getItem('grid'));
    inputs.gapColumn.value = grid.column;
    inputs.gapRow.value = grid.row;
    inputs.dimensions.value = grid.dimensions;
    Object.keys(grid)
        .forEach(type => document.querySelector(`[data-target='${type}']`).innerText = grid[type]);
    applyGrid();

    if (!localStorage.getItem('text')) {
        localStorage.setItem('text', JSON.stringify({
            size: 10,
            color: '#525252',
        }));
    }
    const text = JSON.parse(localStorage.getItem('text'));
    inputs.color.value = text.color;
    inputs.size.value = text.size;
    document.querySelector('[data-target="size"]').innerText = text.size;

    const icons = loadIcons().map;
    chrome.bookmarks.getTree((bookmarkTreeNodes) => {
        listBookmarks(bookmarkTreeNodes, icons);
    });
}

function listBookmarks(bookmarkNodes, icons) {
    const text = JSON.parse(localStorage.getItem('text'));
    const grid = JSON.parse(localStorage.getItem('grid'));

    bookmarkNodes.forEach(bookmark => {
        if (bookmark?.url) {
            const li = document.createElement('li');
            const img = document.createElement('img');
            const a = document.createElement('a');

            li.classList = 'bookmark';
            li.oncontextmenu = showContextMenuCard;
            li.dataset.id = bookmark.id;
            li.dataset.url = bookmark.url;
            
            img.onclick = () => window.location.href = bookmark.url;
            img.onerror = () => img.src = 'https://i.postimg.cc/Gp7HM7Sp/image.png';
            img.src = icons[bookmark.url] ?? new URL(bookmark.url).origin + '/favicon.ico'
            img.style.width = grid.dimensions + "px";
            img.style.maxWidth = grid.dimensions + "px";
            img.style.maxHeight = grid.dimensions + "px";

            a.href = bookmark.url;
            a.style.color = text.color;
            a.style.fontSize = text.size + "px";
            a.textContent = bookmark.title;
            a.target = '_blank';

            li.append(img, a);
            bookmarksList.appendChild(li);
        }
        if (bookmark?.children) {
            listBookmarks(bookmark.children, icons);
        }
    });
}

function closeAllModals() {
    Object.values(modals).forEach(modal => modal.close());
}

function toggleFill(e) {
    const container = document.querySelector('.container-image');
    container.classList[e.target.checked ? 'remove' : 'add']('d-none');
    const background = JSON.parse(localStorage.getItem('background'));
    background.hasFill = e.target.checked;
    localStorage.setItem('background', JSON.stringify(background));
    applyBackground();
}

function applyGrid() {
    const grid = JSON.parse(localStorage.getItem('grid'));
    bookmarksList.style.columnGap = grid.column + 'px';
    bookmarksList.style.rowGap = grid.row + 'px';
    const icons = Array.from(document.querySelectorAll('.bookmark img'));
    icons.forEach(icon => {
        icon.style.width = grid.dimensions + "px";
        icon.style.maxWidth = grid.dimensions + "px";
        icon.style.maxHeight = grid.dimensions + "px";
    });
}

function applyBackground() {
    const background = JSON.parse(localStorage.getItem('background'));    
    document.body.style.backgroundImage = `url('${background.image || ''}')`;
    document.body.style.backgroundColor = background.hasFill ? background.fill : '';
}

function applyText() {
    const links = Array.from(document.querySelectorAll('.bookmark a'));
    const text = JSON.parse(localStorage.getItem('text'));
    links.forEach(link => {
        link.style.color = text.color;
        link.style.fontSize = text.size + "px";
    });
}

function prepareGap(e) {
    const display = document.querySelector(`[data-target='${e.target.dataset.type}']`);
    display.innerText = e.target.value;
    const grid = JSON.parse(localStorage.getItem('grid'));
    grid[e.target.dataset.type] = Number(e.target.value);
    localStorage.setItem('grid', JSON.stringify(grid));
    applyGrid();
}

function prepareBackground() {
    const background = JSON.parse(localStorage.getItem('background'));
    background.image = inputs.image.value;
    background.fill = inputs.hasFill.checked ? inputs.fill.value : null;
    localStorage.setItem('background', JSON.stringify(background));
    applyBackground();
}

function prepareText() {
    const text = JSON.parse(localStorage.getItem('text'));
    text.color = inputs.color.value;
    text.size = Number(inputs.size.value);
    document.querySelector('[data-target="size"]').innerText = text.size;
    localStorage.setItem('text', JSON.stringify(text));
    applyText();
}

function showContextMenuBody(e) {
    e.preventDefault();
    closeAllModals();
    btns.specific.forEach(btn => btn.classList.add('d-none'));
    ctxMenu.style.top = (e.pageY - 10) + 'px';
    ctxMenu.style.left = (e.pageX - 10) + 'px';
    ctxMenu.classList.remove('d-none');
}

function showContextMenuCard(e) {
    e.stopPropagation();
    e.preventDefault();
    closeAllModals();
    btns.specific.forEach(btn => btn.classList.remove('d-none'));
    const card = e.target.closest('li');
    ctx.id = card.dataset.id;
    ctx.url = card.dataset.url;
    ctxMenu.style.top = (e.pageY - 10) + 'px';
    ctxMenu.style.left = (e.pageX - 10) + 'px';
    ctxMenu.classList.remove('d-none');
}

async function delBookmark() {
    chrome.bookmarks.remove(ctx.id);
    initEvents();
}

async function insertIcon() {
    const url = inputs.icon.value.trim();
    if (!url) return alert('Invalid url');
    const icons = localStorage.getItem('icons');
    if (!icons) {
        localStorage.setItem('icons', `${ctx.url} > ${url}`);
    } else {
        const rawIcons = loadIcons().list.filter(el => !el.startsWith(ctx.url));
        rawIcons.push(`${ctx.url} > ${url}`);
        localStorage.setItem('icons', rawIcons.join('\n'));
    }
    modals.icon.close();
    document.querySelector(`[data-id="${ctx.id}"] img`).src = url;
}

async function insertBackground() {
    modals.background.show();
    applyBackground();
}

function prepareImportIcons() {
    modals.importer.show();
}

function configGrid() {
    modals.grid.show();
}

function configText() {
    modals.text.show();
}

function configIcon() {
    modals.icon.show();
}

function importIcons() {
    if (inputs.importer.value.trim()) {
        localStorage.setItem('icons', inputs.importer.value.trim());
        initEvents();
    }
    modals.importer.close();
}

function loadIcons() {
    const rawestIcons = localStorage.getItem('icons');
    if (!rawestIcons) return {map: {}, list: []};

    const rawIcons = rawestIcons
        .split('\n')
        .filter(el => !el.startsWith('#'))
        .filter(Boolean);
    const handleIcons = {};
    rawIcons.forEach(el => {
        const [key, value] = el.split(' > ');
        handleIcons[key] = value;
    });

    return {map: handleIcons, list: rawIcons};
}

function sleep(time) {
    return new Promise((resolve) => setTimeout(resolve, time))
}
  
