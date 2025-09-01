// public/app.js (ES module)
import { els } from "./components/cards.js";

const $ = (s, r=document) => r.querySelector(s);

const app = $("#app");

// --- mini router (client side) ---
const routes = {
  "/": renderDashboard,
  "/customers": renderCustomers,
  "/dogs": renderDogs,
  "/passes": renderPasses,
  "/lessons": renderLessons,
  "/settings": renderSettings,
};

window.addEventListener("popstate", render);
document.addEventListener("click", (e) => {
  const a = e.target.closest("a[data-link]");
  if (!a) return;
  e.preventDefault();
  history.pushState(null, "", a.getAttribute("href"));
  render();
});

async function render(){
  const path = location.pathname;
  const fn = routes[path] || routes["/"];
  await fn();
}

// --- helpers ---
async function fetchJSON(url){
  const r = await fetch(url);
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

// --- screens ---
async function renderDashboard(){
  app.innerHTML = `
    <h1>Dashboard</h1>
    <div class="section">
      <div class="sectionTitle">Snel zoeken</div>
      <div class="searchbar">
        <input id="q" class="input" type="search" placeholder="Paul, Sofie, Diva, Rocky, Puppycursus…" />
        <button class="btn" id="go">Zoek</button>
      </div>
      <div class="status" id="msg">Typ een zoekterm en druk op Zoek.</div>
    </div>
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
      msg.textContent = "Zoeken mislukt. Controleer /api/search en logs.";
    }
  }

  go.addEventListener("click", run);
  q.addEventListener("keydown", e => { if(e.key==="Enter"){ e.preventDefault(); run(); } });
}

async function renderCustomers(){
  app.innerHTML = `<h1>Klanten</h1><div class="status">In ontwikkeling – we tonen hier straks een lijst uit /api/customers.</div>`;
}
async function renderDogs(){
  app.innerHTML = `<h1>Honden</h1><div class="status">In ontwikkeling – lijst uit /api/dogs.</div>`;
}
async function renderPasses(){
  app.innerHTML = `<h1>Strippenkaarten</h1><div class="status">In ontwikkeling – lijst uit /api/passes.</div>`;
}
async function renderLessons(){
  app.innerHTML = `<h1>Lessen</h1><div class="status">In ontwikkeling – agenda en beheer.</div>`;
}
async function renderSettings(){
  app.innerHTML = `<h1>Instellingen</h1><div class="status">In ontwikkeling – trainingen, lestypes, thema’s, locaties.</div>`;
}

// start
render();
