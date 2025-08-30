<!doctype html>
<html lang="nl">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>Superhond Coach Portaal</title>
    <link rel="stylesheet" href="/styles.css" />
  </head>
  <body>
    <header class="app-header">
      <div class="brand">
        <span class="logo">🐾</span>
        <h1>Superhond Coach Portaal</h1>
      </div>

      <!-- Tab-menu -->
      <nav class="tabs">
        <button class="tab-btn active" data-tab="customers">Klanten</button>
        <button class="tab-btn" data-tab="dogs">Honden</button>
        <button class="tab-btn" data-tab="passes">Strippenkaarten</button>
        <button class="tab-btn" data-tab="bookings">Inschrijvingen</button>
        <button class="tab-btn" data-tab="settings">Instellingen</button>
        <button class="tab-btn" data-tab="overview">Overzicht</button>
      </nav>
    </header>

    <main class="container">
      <!-- PANEL: Klanten (registratie klant + hond) -->
      <section id="customers" class="tab-panel">
        <form id="registerForm" class="card">
          <h2>Registratie: Klant + Hond</h2>

          <fieldset>
            <legend>Klantgegevens</legend>
            <div class="grid-2">
              <label>Naam
                <input name="customer_name" required />
              </label>
              <label>E-mail
                <input name="customer_email" type="email" required />
              </label>
              <label>Telefoon
                <input name="customer_phone" />
              </label>
              <label>Adres (optioneel)
                <input name="customer_address" />
              </label>
            </div>
          </fieldset>

          <fieldset>
            <legend>Hond</legend>
            <div class="grid-2">
              <label>Naam hond
                <input name="dog_name" required />
              </label>
              <label>Ras
                <input name="dog_breed" />
              </label>
              <label>Geboortedatum
                <input name="dog_birthdate" type="date" />
              </label>
              <label>Geslacht
                <select name="dog_gender">
                  <option value="">—</option>
                  <option value="teef">Teef</option>
                  <option value="reu">Reu</option>
                </select>
              </label>
            </div>
          </fieldset>

          <fieldset>
            <legend>Inentingen & Dierenarts</legend>
            <div class="grid-2">
              <label>Vaccinatiestatus
                <input name="vaccination_status" />
              </label>
              <label>Inentingsboekje ref.
                <input name="vaccination_book_ref" />
              </label>
              <label>Dierenarts — telefoon
                <input name="vet_phone" />
              </label>
              <label>Noodnummer
                <input name="emergency_phone" />
              </label>
              <label class="full">Dierenarts — naam
                <input name="vet_name" />
              </label>
            </div>
          </fieldset>

          <div class="actions">
            <button type="submit" class="btn-primary">Registreren</button>
            <button type="button" id="reloadCustomers" class="btn-secondary">Herlaad</button>
          </div>

          <p id="registerMsg" class="muted"></p>
        </form>

        <div class="card" id="customersListCard">
          <h3>Bestaande klanten</h3>
          <ul id="customersList" class="list"></ul>
        </div>
      </section>

      <!-- PANEL: Honden -->
      <section id="dogs" class="tab-panel" hidden>
        <div class="card">
          <h2>Honden</h2>
          <p class="muted">Overzicht honden (gekoppeld aan klanten).</p>
          <ul id="dogsList" class="list"></ul>
          <div class="actions">
            <button id="reloadDogs" class="btn-secondary">Herlaad</button>
          </div>
        </div>
      </section>

      <!-- PANEL: Strippenkaarten -->
      <section id="passes" class="tab-panel" hidden>
        <div class="card">
          <h2>Strippenkaarten</h2>
          <p class="muted">Basisstructuur klaar. Koppeling klant ↔ strippenkaart volgt.</p>
          <ul id="passesList" class="list"></ul>
          <div class="actions">
            <button id="reloadPasses" class="btn-secondary">Herlaad</button>
          </div>
        </div>
      </section>

      <!-- PANEL: Inschrijvingen -->
      <section id="bookings" class="tab-panel" hidden>
        <div class="card">
          <h2>Inschrijvingen</h2>
          <p class="muted">Placeholder; later koppelen we lessen en strippenkaart-verbruik.</p>
          <ul id="bookingsList" class="list"></ul>
          <div class="actions">
            <button id="reloadBookings" class="btn-secondary">Herlaad</button>
          </div>
        </div>
      </section>

      <!-- PANEL: Instellingen -->
      <section id="settings" class="tab-panel" hidden>
        <div class="card">
          <h2>Instellingen (alleen lezen)</h2>
          <dl id="settingsDl" class="deflist"></dl>
          <div class="actions">
            <button id="reloadSettings" class="btn-secondary">Herlaad</button>
          </div>
        </div>
      </section>

      <!-- PANEL: Overzicht -->
      <section id="overview" class="tab-panel" hidden>
        <div class="card">
          <h2>Overzicht</h2>
          <div id="overviewStats" class="grid-3 small-cards"></div>
          <div class="actions">
            <button id="reloadOverview" class="btn-secondary">Herlaad</button>
          </div>
        </div>
      </section>
    </main>

    <footer class="app-footer">
      <span id="lastUpdated"></span>
    </footer>

    <script src="/app.js" defer></script>
  </body>
</html>
