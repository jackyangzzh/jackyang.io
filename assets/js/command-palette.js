// The ⌘K command menu. site-polish.js imports this on first use and calls
// toggle(); see "Command menu" there and in my-style.scss.
//
// A native <dialog> opened with showModal(), so the page behind is inert,
// focus is trapped, and focus goes back to wherever it was on close. The
// input is a combobox over a listbox of options: arrow keys move a highlight
// that slides between them (the same motion as the site's other highlights),
// Enter runs the active one, ⌘/Ctrl+Enter opens a link in a new tab.

const CATEGORY_LABELS = { professional: "Professional", personal: "Personal", research: "Research" };

const ICON_PATHS = {
  page: '<path d="M5.5 2.5h6l3.5 3.5v11.5h-9.5z"/><path d="M11.5 2.5V6H15"/>',
  project:
    '<rect x="3" y="3" width="6" height="6" rx="1.5"/><rect x="11" y="3" width="6" height="6" rx="1.5"/>' +
    '<rect x="3" y="11" width="6" height="6" rx="1.5"/><rect x="11" y="11" width="6" height="6" rx="1.5"/>',
  post: '<path d="M4 16.5 5 12l8-8 3.5 3.5-8 8z"/><path d="M11 6l3.5 3.5"/>',
  action: '<path d="M11.5 2 4.5 11h5l-1 7 7-9h-5z"/>',
  link: '<path d="M8 4.5H4.5v11h11V12"/><path d="M11.5 3.5h5v5"/><path d="M16.5 3.5 9.5 10.5"/>',
  search: '<circle cx="8.5" cy="8.5" r="5"/><path d="m12.5 12.5 4 4"/>',
};

const icon = (name) =>
  `<svg viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.6" ` +
  `stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${ICON_PATHS[name]}</svg>`;

const GROUP_ORDER = ["Pages", "Projects", "Writing", "Actions", "Elsewhere", "Search"];

// How long "Copied" shows in the row before the menu closes.
const COPIED_MS = 650;
const CLOSE_MS = 130;

let ctx;
let dialog;
let input;
let list;
let highlight;
let commands = [];
let rows = [];
let active = -1;
let closing = false;
let uid = 0;

const reduced = () => Boolean(ctx.reducedMotion && ctx.reducedMotion.matches);
const normalizePath = (pathname) => pathname.replace(/\/$/, "") || "/";

const isDark = () => {
  const body = document.body;
  if (body.classList.contains("dark-mode")) return true;
  if (body.classList.contains("light-mode")) return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
};

/* ------------------------------------------------------------------- data */

const buildCommands = (index) => {
  const here = normalizePath(location.pathname);
  const page = (label, url, keywords) => ({ group: "Pages", label, url, icon: "page", keywords });
  const items = [
    page("About", "/", "home résumé resume cv experience"),
    page("Projects", "/projects/", "work portfolio"),
    page("Writing", "/writing/", "blog posts medium articles"),
    ...index.projects.map((project) => ({
      group: "Projects",
      label: project.title,
      hint: [CATEGORY_LABELS[project.category] || project.category, project.years].filter(Boolean).join(" · "),
      url: project.url,
      icon: "project",
      keywords: project.tagline,
    })),
    ...index.posts.map((post) => ({
      group: "Writing",
      label: post.title,
      hint: post.date,
      url: post.url,
      external: true,
      icon: "post",
    })),
  ];

  if (index.email) {
    items.push({
      group: "Actions",
      label: "Copy email address",
      hint: index.email,
      icon: "action",
      keywords: "contact mail reach",
      run: (row) => copyEmail(index.email, row),
    });
  }
  items.push({
    group: "Actions",
    label: isDark() ? "Switch to light theme" : "Switch to dark theme",
    hint: "or press T",
    icon: "action",
    keywords: "theme dark light mode appearance colour color",
    run: switchTheme,
  });
  if (index.resume) {
    items.push({ group: "Actions", label: "Open résumé PDF", url: index.resume, external: true, icon: "page", keywords: "resume cv download pdf" });
  }
  if (index.schedule) {
    items.push({ group: "Actions", label: "Schedule a call", url: index.schedule, external: true, icon: "action", keywords: "meeting chat calendly book" });
  }
  for (const profile of index.profiles || []) {
    items.push({ group: "Elsewhere", label: profile.network, url: profile.url, external: true, icon: "link", keywords: "profile social" });
  }

  for (const command of items) {
    if (command.url && !command.external && normalizePath(command.url) === here) command.hint = "You are here";
  }
  return items;
};

/* ---------------------------------------------------------------- filtering */

// Label prefix > word prefix > label substring > keywords/hint substring >
// the query's letters in order, close together. Every word must match.
const scoreTerm = (command, term) => {
  const label = command.label.toLowerCase();
  if (label.startsWith(term)) return 5;
  if (label.split(/[\s\-–—&·:,]+/).some((word) => word.startsWith(term))) return 4;
  if (label.includes(term)) return 3;
  const extra = `${command.keywords || ""} ${command.hint || ""} ${command.group}`.toLowerCase();
  if (extra.includes(term)) return 2;
  return looseMatch(label, term) ? 1 : 0;
};

// The query's letters in order and close together, so "msh" finds "Mesh",
// but a long title doesn't match just by containing the letters somewhere:
// a match may span at most twice the query's length plus two characters.
const looseMatch = (label, term) => {
  const reach = term.length * 2 + 2;
  for (let start = label.indexOf(term[0]); start !== -1; start = label.indexOf(term[0], start + 1)) {
    let i = 1;
    let at = start + 1;
    while (i < term.length && at < label.length && at - start < reach) {
      if (label[at] === term[i]) i += 1;
      at += 1;
    }
    if (i === term.length) return true;
  }
  return false;
};

const scoreCommand = (command, terms) => {
  let total = 0;
  for (const term of terms) {
    const score = scoreTerm(command, term);
    if (!score) return 0;
    total += score;
  }
  return total;
};

/* ---------------------------------------------------------------- rendering */

const render = () => {
  const query = input.value.trim();
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  const groups = new Map();

  for (const command of commands) {
    const score = terms.length ? scoreCommand(command, terms) : 1;
    if (!score) continue;
    if (!groups.has(command.group)) groups.set(command.group, []);
    groups.get(command.group).push({ command, score });
  }
  if (query) {
    groups.set("Search", [{
      command: {
        group: "Search",
        label: `Search the site for “${query}”`,
        icon: "search",
        run: () => searchSite(query),
      },
      score: 0,
    }]);
  }

  // With a query, the best matches lead within each group and the group
  // holding the best match leads overall; Search always comes last.
  const ordered = [...groups.entries()].map(([name, entries]) => {
    if (terms.length) entries.sort((a, b) => b.score - a.score);
    return { name, entries, best: name === "Search" ? -1 : Math.max(...entries.map((e) => e.score)) };
  });
  ordered.sort((a, b) =>
    terms.length && a.best !== b.best ? b.best - a.best : GROUP_ORDER.indexOf(a.name) - GROUP_ORDER.indexOf(b.name)
  );

  list.replaceChildren(highlight);
  rows = [];
  for (const { name, entries } of ordered) {
    const group = document.createElement("div");
    const heading = document.createElement("div");
    const headingId = `cmdk-group-${uid++}`;
    group.className = "cmdk__group";
    group.setAttribute("role", "group");
    group.setAttribute("aria-labelledby", headingId);
    heading.className = "cmdk__heading";
    heading.id = headingId;
    heading.textContent = name;
    group.appendChild(heading);

    for (const { command } of entries) {
      const row = document.createElement("div");
      row.className = "cmdk__item";
      row.id = `cmdk-option-${uid++}`;
      row.setAttribute("role", "option");
      row.setAttribute("aria-selected", "false");
      row.innerHTML = `<span class="cmdk__icon">${icon(command.icon)}</span><span class="cmdk__label"></span>`;
      row.querySelector(".cmdk__label").textContent = command.label;
      if (command.hint || command.external) {
        const hint = document.createElement("span");
        hint.className = "cmdk__hint";
        hint.textContent = command.hint || "";
        if (command.external) hint.insertAdjacentHTML("beforeend", '<span class="cmdk__external" aria-hidden="true">↗</span>');
        row.appendChild(hint);
      }
      if (command.external) {
        const note = document.createElement("span");
        note.className = "sr-only";
        note.textContent = " (opens in a new tab)";
        row.appendChild(note);
      }
      row.addEventListener("pointermove", () => {
        const at = rows.indexOf(row);
        if (at !== active) setActive(at, false);
      });
      row.addEventListener("click", (event) => runRow(row, event.metaKey || event.ctrlKey));
      row.command = command;
      group.appendChild(row);
      rows.push(row);
    }
    list.appendChild(group);
  }

  list.classList.add("is-instant");
  setActive(rows.length ? 0 : -1, false);
  // Let the jump to the first row land before slides are allowed again.
  requestAnimationFrame(() => list.classList.remove("is-instant"));
};

const setActive = (index, scroll = true) => {
  if (rows[active]) rows[active].setAttribute("aria-selected", "false");
  active = index;
  const row = rows[active];
  if (!row) {
    input.removeAttribute("aria-activedescendant");
    highlight.hidden = true;
    return;
  }
  row.setAttribute("aria-selected", "true");
  input.setAttribute("aria-activedescendant", row.id);
  highlight.hidden = false;
  highlight.style.transform = `translateY(${row.offsetTop}px)`;
  highlight.style.height = `${row.offsetHeight}px`;
  if (scroll) row.scrollIntoView({ block: "nearest" });
};

/* ------------------------------------------------------------------ actions */

const navigate = (url, newTab) => {
  if (newTab) {
    window.open(url, "_blank", "noopener,noreferrer");
    close();
    return;
  }
  close();
  if (normalizePath(new URL(url, location.href).pathname) === normalizePath(location.pathname)) return;
  if (ctx.pushState && typeof ctx.pushState.assign === "function") ctx.pushState.assign(url);
  else location.assign(url);
};

const runRow = (row, newTab = false) => {
  const command = row && row.command;
  if (!command) return;
  if (command.run) command.run(row);
  else navigate(command.url, newTab || command.external);
};

const setHint = (row, text) => {
  let hint = row.querySelector(".cmdk__hint");
  if (!hint) {
    hint = document.createElement("span");
    hint.className = "cmdk__hint";
    row.appendChild(hint);
  }
  hint.textContent = text;
};

const copyEmail = async (address, row) => {
  try {
    await navigator.clipboard.writeText(address);
  } catch {
    setHint(row, "Couldn’t copy · it’s selected above");
    input.value = address;
    input.select();
    return;
  }
  row.classList.add("is-done");
  setHint(row, "Copied");
  setTimeout(close, COPIED_MS);
};

// The theme's own button does the switch (and site-polish.js turns it into
// the circle reveal); the menu gets out of the way first so the reveal is
// seen, and so the button is not inert behind the modal when clicked.
const switchTheme = () => {
  close(() => {
    const button = document.getElementById("_dark-mode");
    if (button) button.click();
  });
};

// Hydejack's search lives in the top bar: open it and hand over the query.
const searchSite = (query) => {
  close(() => {
    const button = document.getElementById("_search");
    const field = document.getElementById("_search-input");
    if (!button || !field) return;
    button.click();
    requestAnimationFrame(() => {
      field.value = query;
      field.dispatchEvent(new Event("input", { bubbles: true }));
      field.focus();
    });
  });
};

/* -------------------------------------------------------------- open/close */

const onKeydown = (event) => {
  if (event.isComposing) return;
  const last = rows.length - 1;
  switch (event.key) {
    case "ArrowDown":
      event.preventDefault();
      if (rows.length) setActive(active >= last ? 0 : active + 1);
      break;
    case "ArrowUp":
      event.preventDefault();
      if (rows.length) setActive(active <= 0 ? last : active - 1);
      break;
    case "Home":
    case "End":
      if (!event.ctrlKey && !event.metaKey) return;
      event.preventDefault();
      if (rows.length) setActive(event.key === "Home" ? 0 : last);
      break;
    case "Enter":
      event.preventDefault();
      runRow(rows[active], event.metaKey || event.ctrlKey);
      break;
    default:
  }
};

const build = () => {
  dialog = document.createElement("dialog");
  dialog.className = "cmdk";
  dialog.setAttribute("aria-label", "Command menu");
  dialog.innerHTML =
    '<div class="cmdk__panel">' +
    '<div class="cmdk__search">' + icon("search") +
    '<input class="cmdk__input" type="text" role="combobox" aria-expanded="true" aria-controls="cmdk-list" ' +
    'aria-autocomplete="list" aria-label="Search pages, projects and actions" placeholder="Where to? Type a page, project or action…" ' +
    'autocomplete="off" autocapitalize="off" spellcheck="false" enterkeyhint="go">' +
    '<kbd class="cmdk__esc">esc</kbd></div>' +
    '<div class="cmdk__list" id="cmdk-list" role="listbox" aria-label="Results"><div class="cmdk__highlight" aria-hidden="true" hidden></div></div>' +
    '<div class="cmdk__footer" aria-hidden="true"><span><kbd>↑</kbd><kbd>↓</kbd> move</span>' +
    '<span><kbd>↵</kbd> open</span><span><kbd>esc</kbd> close</span></div>' +
    "</div>";
  input = dialog.querySelector(".cmdk__input");
  list = dialog.querySelector(".cmdk__list");
  highlight = dialog.querySelector(".cmdk__highlight");

  input.addEventListener("input", render);
  input.addEventListener("keydown", onKeydown);
  // Escape: animate out instead of the dialog's instant close.
  dialog.addEventListener("cancel", (event) => {
    event.preventDefault();
    close();
  });
  // A click on the backdrop lands on the <dialog> itself.
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) close();
  });
  document.body.appendChild(dialog);
};

const open = async () => {
  if (!dialog) build();
  closing = false;
  dialog.classList.remove("is-closing");
  input.value = "";
  dialog.showModal();
  input.focus();

  // The first open waits on the index; the panel is already up and the
  // input already takes typing, and the list fills in when it arrives.
  try {
    commands = buildCommands(await ctx.loadSiteIndex());
  } catch {
    commands = buildCommands({ projects: [], posts: [], profiles: [] });
  }
  if (dialog.open) render();
};

const close = (after) => {
  if (!dialog || !dialog.open || closing) {
    if (typeof after === "function") after();
    return;
  }
  closing = true;
  const done = () => {
    dialog.classList.remove("is-closing");
    dialog.close();
    closing = false;
    if (typeof after === "function") after();
  };
  if (reduced()) {
    done();
    return;
  }
  dialog.classList.add("is-closing");
  setTimeout(done, CLOSE_MS);
};

export const toggle = (context) => {
  ctx = context;
  if (dialog && dialog.open) close();
  else open();
};
