// public/app.js (ES module)
import { els } from "./components/cards.js";

const $ = (s, r=document) => r.querySelector(s);
const app = $("#app");

/* ---------------- Router (simpel SPA) ---------------- */
const routes = {
  "/": renderDashboard,
  "/customers": renderCustomers,
  "/customers/new": renderCustomerNew,
  "/dogs": renderDogs,
  "/dogs/new": renderDogNew,
  "/passes": renderPasses,
  "/lessons": renderLessons,
  "/lessons/new": renderLessonNew,
  "/settings": renderSettings,
  "/settings/branding": renderBranding,
  "/settings/locations": renderLocations,
};

window.addEventListener("popstate", render);
document.addEventListener("click", (e) => {
  const a = e.target.closest("a[data-link]");
  if (!a) return;
  e.preventDefault();
  history.pushState(null, "", a.getAttribute("href"));
  render();
});

async function render() {
  const path = location.pathname;
  const fn = routes[path] || routes["/"];
  await fn();
}

/* ---------------- Helpers ---------------- */
async function fetchJSON(url, opts) {
  const r = await fetch(url, opts);
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
}

function section(title){
  const tmp = document.createElement("div");
  tmp.innerHTML = els.section(title);
  return tmp.firstElementChild;
}
function pushCards(container, cards){
  const grid = container.querySelector('[data-slot="grid"]');
  grid.innerHTML = cards.join("");
}

/* ---------------- Menu + overlay + submenu's ---------------- */
document.addEventListener("DOMContentLoaded", () => {
  const menuButton = document.querySelector(".menu-toggle");
  const sideMenu   = document.getElementById("sideMenu");
  const overlay    = document.getElementById("menuOverlay");

  function openMenu() {
    sideMenu.classList.add("open");
    overlay.classList.add("show");
    overlay.hidden = false;
    document.body.classList.add("noscroll");
  }
  function closeMenu() {
    sideMenu.classList.remove("open");
    overlay.classList.remove("show");
    setTimeout(() => { overlay.hidden = true; }, 250);
    document.body.classList.remove("noscroll");
  }
  function toggleMenu() {
    sideMenu.classList.contains("open") ? closeMenu() : openMenu();
  }

  if (menuButton) menuButton.addEventListener("click", toggleMenu);
  if (overlay) overlay.addEventListener("click", closeMenu);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && sideMenu.classList.contains("open")) closeMenu();
  });

  // Submenu toggle + state
  const SUB_KEY = "sh_submenu_state";
  try {
    const saved = JSON.parse(sessionStorage.getItem(SUB_KEY) || "{}");
    // herstellen
    Object.entries(saved).forEach(([id, isOpen]) => {
      const btn = sideMenu.querySelector(`.sub-toggle[aria-controls="${id}"]`);
      const panel = document.getElementById(id);
      if (btn && panel && isOpen) {
        btn.setAttribute("aria-expanded", "true");
        panel.hidden = false;
        panel.classList.add("show");
      }
    });
    // live toggle
    sideMenu.addEventListener("click", (e) => {
      // links -> sluiten + router laten werken
      const link = e.target.closest("a[data-link]");
      if (link) { closeMenu(); return; }

      const btn = e.target.closest(".sub-toggle");
      if (!btn) return;

      const id = btn.getAttribute("aria-controls");
      const panel = document.getElementById(id);
      const willOpen = btn.getAttribute("aria-expanded") !== "true";

      btn.setAttribute("aria-expanded", String(willOpen));
      if (willOpen) {
        panel.hidden = false;
        requestAnimationFrame(() => panel.classList.add("show"));
      } else {
        panel.classList.remove("show");
        setTimeout(() => { panel.hidden = true; }, 250);
      }

      const state = JSON.parse(sessionStorage.getItem(SUB_KEY) || "{}");
      state[id] = willOpen;
      sessionStorage.setItem(SUB_KEY, JSON.stringify(state));
    });
  } catch {/* ignore */}
});

/* ---------------- Screens ---------------- */
async function renderDashboard(){
  app.innerHTML = `
    <h1>Dashboard</h1>
    <section class="section">
      <div class="sectionTitle">Snel zoeken</div>
      <div class="searchbar">
        <input id="q" class="input" type="search" placeholder="Paul, Sofie, Diva, Rocky, Puppycursus…" />
        <button class="btn" id="go" type="button">Zoek</button>
      </div>
      <div class="status" id="msg">Typ een zoekterm en druk op Zoek.</div>
    </section>
    <div id="results"></div>
  `;

  const q = $("#q", app);
  const go = $("#go", app);
  const msg = $("#msg", app);
  const results = $("#results", app);

  async function run(){
    const term = (q.value||"").trim();
    if (!term){ msg.textContent = "Typ eerst een zoekterm."; results.innerHTML=""; return; }
    msg.textContent = "Zoeken…";
    results.innerHTML = "";

    try{
      // Back-end: /api/search moet { ok:true, results:{ customers, dogs, passes } } teruggeven.
      const data = await fetchJSON(`/api/search?q=${encodeURIComponent(term)}`);
      const r = data?.results || {};

      if(!(r.customers?.length || r.dogs?.length || r.passes?.length)){
        msg.textContent = `Geen resultaten voor “${term}”.`;
        return;
      }
      msg.textContent = `Resultaten voor “${term}”`;

      if (r.customers?.length){
        const sec = section("Klanten");
        pushCards(sec, r.customers.map(els.cardCustomer));
        results.appendChild(sec);
      }
      if (r.dogs?.length){
        const sec = section("Honden");
        pushCards(sec, r.dogs.map(els.cardDog));
        results.appendChild(sec);
      }
      if (r.passes?.length){
        const sec = section("Strippenkaarten");
        pushCards(sec, r.passes.map(els.cardPass));
        results.appendChild(sec);
      }
    }catch(err){
      console.error(err);
      msg.textContent = "Zoeken mislukt. Controleer /api/search en server logs.";
    }
  }

  go.addEventListener("click", run);
  q.addEventListener("keydown", e => { if(e.key==="Enter"){ e.preventDefault(); run(); } });
}

async function renderCustomers(){
  app.innerHTML = `
    <h1>Klanten</h1>
    <section class="section">
      <div class="sectionTitle">Overzicht (demo)</div>
      <div class="grid" id="custGrid"></div>
    </section>
  `;
  try{
    const data = await fetchJSON("/api/search?q=paul"); // demo: haal Paul via search
    const cust = data?.results?.customers || [];
    $("#custGrid", app).innerHTML = cust.map(els.cardCustomer).join("") || "<p class='status'>Geen klanten gevonden.</p>";
  }catch{
    $("#custGrid", app).innerHTML = "<p class='status'>Kon klanten niet laden.</p>";
  }
}
async function renderCustomerNew(){
  app.innerHTML = `
    <h1>Nieuwe klant</h1>
    <section class="section"><p class="status">Formulier volgt.</p></section>
  `;
}
async function renderDogs(){
  app.innerHTML = `
    <h1>Honden</h1>
    <section class="section">
      <div class="sectionTitle">Overzicht (demo)</div>
      <div class="grid" id="dogGrid"></div>
    </section>
  `;
  try{
    const data = await fetchJSON("/api/search?q=diva"); // demo
    const dogs = data?.results?.dogs || [];
    $("#dogGrid", app).innerHTML = dogs.map(els.cardDog).join("") || "<p class='status'>Geen honden gevonden.</p>";
  }catch{
    $("#dogGrid", app).innerHTML = "<p class='status'>Kon honden niet laden.</p>";
  }
}
async function renderDogNew(){
  app.innerHTML = `
    <h1>Nieuwe hond</h1>
    <section class="section"><p class="status">Formulier volgt.</p></section>
  `;
}
async function renderPasses(){
  app.innerHTML = `
    <h1>Strippenkaarten</h1>
    <section class="section">
      <div class="sectionTitle">Overzicht (demo)</div>
      <div class="grid" id="passGrid"></div>
    </section>
  `;
  try{
    const data = await fetchJSON("/api/search?q=puppy"); // demo
    const passes = data?.results?.passes || [];
    $("#passGrid", app).innerHTML = passes.map(els.cardPass).join("") || "<p class='status'>Geen strippenkaarten gevonden.</p>";
  }catch{
    $("#passGrid", app).innerHTML = "<p class='status'>Kon strippenkaarten niet laden.</p>";
  }
}
async function renderLessons(){
  app.innerHTML = `<h1>Lessen</h1><section class="section"><p class="status">Agenda en beheer volgen.</p></section>`;
}
async function renderLessonNew(){
  app.innerHTML = `<h1>Nieuwe les</h1><section class="section"><p class="status">Formulier volgt.</p></section>`;
}
async function renderSettings(){
  app.innerHTML = `<h1>Instellingen</h1><section class="section"><p class="status">Algemene instellingen volgen.</p></section>`;
}
async function renderBranding(){
  app.innerHTML = `<h1>Logo & stijl</h1><section class="section"><p class="status">Branding-instellingen volgen.</p></section>`;
}
async function renderLocations(){
  app.innerHTML = `<h1>Locaties</h1><section class="section"><p class="status">Locatiebeheer volgt.</p></section>`;
}

/* Init */
render();
