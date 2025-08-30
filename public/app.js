/* ------------------ Helpers ------------------ */

// Simpele API-helper
async function api(url, options = {}) {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || res.statusText);
  }
  return res.json();
}

// HTML-escaper
function escapeHTML(str) {
  if (str == null) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// Update label “Laatst bijgewerkt”
function setUpdated() {
  const el = document.getElementById("last-updated");
  if (el) {
    const now = new Date();
    el.textContent =
      "Laatst bijgewerkt op " + now.toLocaleDateString() + " " + now.toLocaleTimeString();
  }
}

/* ------------------ Customers + Honden + Strippenkaarten ------------------ */

async function loadCustomers() {
  const list = document.getElementById("customers-list");
  list.innerHTML = `<div class="muted">Laden…</div>`;

  const customers = await api("/api/customers");
  if (!customers.length) {
    list.innerHTML = `<div class="muted">Geen klanten gevonden.</div>`;
    fillCustomerSelect(customers);
    return;
  }

  list.innerHTML = "";
  customers.forEach((c) => {
    const passes = c.passes || [];
    const dogs = c.dogs || [];

    const el = document.createElement("div");
    el.className = "card";
    el.innerHTML = `
      <div class="card-head">
        <div>
          <strong>${escapeHTML(c.name)}</strong>
          <div class="sub">${escapeHTML(c.email || "—")} · ${escapeHTML(c.phone || "—")}</div>
        </div>
        <div class="actions">
          <button class="btn" data-act="newpass">+ Strippenkaart</button>
          <button class="btn" data-act="claimpkg">Pakket koppelen</button>
          <button class="btn" data-act="refresh">↻</button>
        </div>
      </div>

      <div class="card-body">
        <div class="grid-two">
          <div>
            <h4>Honden</h4>
            ${
              dogs.length
                ? `<ul class="bullets">${dogs
                    .map(
                      (d) =>
                        `<li>#${d.id} ${escapeHTML(d.name)} <span class="muted">(${escapeHTML(
                          d.breed || "-"
                        )})</span></li>`
                    )
                    .join("")}</ul>`
                : `<div class="muted">Nog geen honden</div>`
            }
          </div>
          <div>
            <h4>Strippenkaarten</h4>
            ${
              passes.length
                ? `<ul class="passes">${passes
                    .map(
                      (p) => `
                  <li>
                    <div>
                      <strong>${escapeHTML(p.type)}</strong>
                      <div class="sub">${p.remaining}/${p.totalStrips} over</div>
                    </div>
                    <div>
                      <button class="btn small" data-act="use" data-pass="${p.id}">Gebruik strip</button>
                    </div>
                  </li>`
                    )
                    .join("")}</ul>`
                : `<div class="muted">Geen strippenkaarten</div>`
            }
          </div>
        </div>
      </div>
    `;

    // Event-handlers voor de knoppen
    el.addEventListener("click", async (e) => {
      const btn = e.target.closest("button");
      if (!btn) return;

      // ↻ herladen
      if (btn.dataset.act === "refresh") {
        await loadCustomers();
        return;
      }

      // + Strippenkaart (handmatig)
      if (btn.dataset.act === "newpass") {
        const total = Number(prompt("Aantal strippen (bv. 10):", "10"));
        if (!total || total < 1) return;
        const type = prompt("Type (vrije tekst):", `${total}-beurten`) || `${total}-beurten`;
        try {
          await api(`/api/passes/${c.id}`, {
            method: "POST",
            body: JSON.stringify({ totalStrips: total, type }),
          });
          await loadCustomers();
        } catch (err) {
          alert("Mislukt: " + err.message);
        }
        return;
      }

      // Gebruik strip
      if (btn.dataset.act === "use") {
        const passId = btn.dataset.pass;
        try {
          await api(`/api/passes/${c.id}/${passId}/use`, { method: "POST" });
          await loadCustomers();
        } catch (err) {
          alert("Mislukt: " + err.message);
        }
        return;
      }

      // Pakket koppelen (Google → strippenkaart)
      if (btn.dataset.act === "claimpkg") {
        const email = c.email;
        if (!email) {
          alert("Deze klant heeft geen e-mail. Vul eerst een e-mail in bij de klant.");
          return;
        }

        const pending = await loadPendingForEmail(email);
        if (!pending.length) {
          alert(`Geen pending aankopen gevonden voor ${email}.`);
          return;
        }

        // keuze aankoop
        let pick = pending[0];
        if (pending.length > 1) {
          const idTxt = prompt(
            `Er zijn ${pending.length} aankopen. Geef purchaseId om te koppelen:\n` +
              pending.map((p) => `#${p.id} ${p.packageKey || "pakket"} (${p.lessons} lessen)`).join("\n"),
            String(pending[0].id)
          );
          if (!idTxt) return;
          const idNum = Number(idTxt);
          pick = pending.find((p) => p.id === idNum);
          if (!pick) {
            alert("Ongeldig purchaseId.");
            return;
          }
        }

        // hond kiezen
        const ds = c.dogs || [];
        let dogId = null;
        if (ds.length) {
          const sel = prompt(
            "Koppel aan hond-id (leeg laten = geen hond koppelen):\n" +
              ds.map((d) => `#${d.id} ${d.name}`).join("\n"),
            String(ds[0].id)
          );
          if (sel) dogId = Number(sel);
        }

        try {
          await claimPurchase({
            email,
            purchaseId: pick.id,
            customerId: c.id,
            dogId,
          });
          await loadCustomers();
          alert(`Pakket gekoppeld: ${pick.packageKey || pick.lessons + "-beurten"}`);
        } catch (e) {
          alert("Koppelen mislukt: " + e.message);
        }
      }
    });

    list.appendChild(el);
  });

  fillCustomerSelect(customers);
  setUpdated();
}

/* ------------------ Dogs ------------------ */
function fillCustomerSelect(customers) {
  const sel = document.getElementById("dog-customer");
  if (!sel) return;
  sel.innerHTML =
    `<option value="">– Kies klant –</option>` +
    customers.map((c) => `<option value="${c.id}">${escapeHTML(c.name)}</option>`).join("");
}

/* ------------------ Purchases (Google) ------------------ */
async function loadPendingForEmail(email) {
  if (!email) return [];
  const res = await fetch(`/api/purchases/pending?email=${encodeURIComponent(email)}`);
  if (!res.ok) return [];
  return res.json();
}

async function claimPurchase({ email, purchaseId, customerId, dogId }) {
  const r = await fetch("/api/purchases/claim", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, purchaseId, customerId, dogId }),
  });
  if (!r.ok) {
    const t = await r.text().catch(() => "");
    throw new Error(t || r.statusText);
  }
  return r.json();
}

/* ------------------ Init ------------------ */
document.addEventListener("DOMContentLoaded", () => {
  loadCustomers();
});
