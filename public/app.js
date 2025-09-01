/* Superhond – eenvoudige client-side router + schermen */

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

// Mini "views"
const VIEWS = {
  dashboard() {
    return /*html*/`
      <h2>Welkom bij Superhond</h2>
      <p>Kies een onderdeel in het menu of gebruik de knoppen hieronder.</p>
      <div class="toolbar">
        <button class="btn" data-view="customers">➕ Nieuwe klant</button>
        <button class="btn" data-view="dogs">➕ Nieuwe hond</button>
        <button class="btn" data-view="passes">🎫 Strip verbruiken</button>
      </div>
      <div class="card">
        <h3>Snelle statistieken</h3>
        <ul>
          <li>Klanten (demo): 1</li>
          <li>Honden (demo): 1</li>
          <li>Openstaande lessen (demo): 5</li>
        </ul>
      </div>
    `;
  },

  customers() {
    return /*html*/`
      <h2>Klanten</h2>
      <p>Zoeken / toevoegen van klanten (demo-scherm).</p>
      <div class="card">
        <label>Zoek klant</label>
        <input placeholder="Naam, e-mail of telefoon…" />
        <div class="muted" style="margin-top:8px">Voorbeeldresultaat:</div>
        <table class="table" style="margin-top:8px">
          <thead><tr><th>Naam</th><th>E-mail</th><th>Telefoon</th></tr></thead>
          <tbody><tr><td>Paul Thijs</td><td>paul@example.com</td><td>0476 12 34 56</td></tr></tbody>
        </table>
      </div>
    `;
  },

  dogs() {
    return /*html*/`
      <h2>Honden</h2>
      <p>Beheer honden en koppelingen aan klanten (demo-scherm).</p>
      <div class="card">
        <label>Naam hond</label>
        <input placeholder="Bv. Seda" />
        <div class="toolbar"><button class="btn">Opslaan</button></div>
      </div>
    `;
  },

  passes() {
    return /*html*/`
      <h2>Strippenkaarten</h2>
      <p>Hier verbruik je een strip of maak je een kaart aan op basis van een lespakket.</p>
      <div class="card">
        <div class="grid">
          <div>
            <label>Klant of hond</label>
            <input placeholder="Zoek 'Paul' of 'Seda' (demo)" />
          </div>
          <div>
            <label>Lespakket</label>
            <select>
              <option>Puppy – 9 lessen</option>
              <option>Puber – 5 lessen</option>
            </select>
          </div>
        </div>
        <div class="toolbar"><button class="btn">🎫 Strip verbruiken</button></div>
      </div>
    `;
  },

  lessons() {
    return /*html*/`
      <h2>Lessen</h2>
      <p>Plan lessen, voeg deelnemers toe, registreer aanwezigheid (demo-scherm).</p>
      <div class="card">
        <label>Nieuwe les</label>
        <div class="grid">
          <input type="date" />
          <input type="time" />
          <input placeholder="Locatie" />
        </div>
        <div class="toolbar"><button class="btn">Les toevoegen</button></div>
      </div>
    `;
  },

  settings() {
    return /*html*/`
      <h2>Instellingen</h2>
      <div class="card">
        <label>Organisatie-naam</label>
        <input value="Superhond.be" />
        <label style="margin-top:10px">Kleur (primaire)</label>
        <input value="#FFC107" />
        <div class="toolbar"><button class="btn">Opslaan</button></div>
      </div>
    `;
  }
};

// Router
function render(viewName) {
  const view = VIEWS[viewName] ? viewName : 'dashboard';
  // Active link wisselen
  $$('#side a[data-view]').forEach(a =>
    a.classList.toggle('active', a.dataset.view === view)
  );
  // Inhoud plaatsen
  $('#app').innerHTML = VIEWS[view]();
  // Buttons binnen content die ook een data-view hebben, laten navigeren
  $$('#app [data-view]').forEach(btn =>
    btn.addEventListener('click', () => navigate(btn.dataset.view))
  );
  // URL updaten voor back/forward
  history.replaceState({ view }, '', `#${view}`);
}

function navigate(viewName) {
  render(viewName);
}

function initNav() {
  // Menuklikken
  $$('#side a[data-view]').forEach(a => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      navigate(a.dataset.view);
    });
  });

  // Hamburger (optioneel)
  $('#menuBtn').addEventListener('click', () => {
    $('#side').classList.toggle('open');
  });

  // Startview uit hash
  const start = (location.hash || '#dashboard').replace('#', '');
  render(start);

  // Laatst geladen
  const now = new Date();
  $('#loadedAt').textContent = now.toLocaleString();
}

document.addEventListener('DOMContentLoaded', initNav);
