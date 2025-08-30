/* ------------------ Lessen ------------------ */
async function loadLessons() {
  const list = document.getElementById("lessons-list");
  if (!list) return;
  list.innerHTML = `<div class="muted">Laden…</div>`;

  const lessons = await api("/api/lessons");
  if (!lessons.length) {
    list.innerHTML = `<div class="muted">Nog geen lessen gepland.</div>`;
    return;
  }

  list.innerHTML = "";
  lessons.forEach((l) => {
    const el = document.createElement("div");
    el.className = "card";

    // deelnemerslijst met status + knop "Bevestig"
    const deelnemersHTML = (l.participants && l.participants.length)
      ? `<ul class="bullets">
          ${l.participants.map((p, idx) => `
            <li>
              Klant #${p.customerId}${p.dogId ? ` · Hond #${p.dogId}` : ""}
              ${p.status === "bevestigd"
                ? ` <span class="muted">— bevestigd ✅</span>`
                : ` <button class="btn small" data-act="confirm" data-lesson="${l.id}" data-customer="${p.customerId}">Bevestig</button>`}
            </li>
          `).join("")}
         </ul>`
      : `<div class="muted">Nog geen deelnemers</div>`;

    el.innerHTML = `
      <div class="card-head">
        <div>
          <strong>${escapeHTML(l.title)}</strong>
          <div class="sub">${escapeHTML(l.date)} ${escapeHTML(l.time)} · Plaatsen: ${l.participants.length}/${l.capacity || "∞"}</div>
        </div>
        <div class="actions">
          <button class="btn small" data-act="enroll" data-id="${l.id}">Inschrijven</button>
        </div>
      </div>
      <div class="card-body">
        ${deelnemersHTML}
      </div>
    `;

    el.addEventListener("click", async (e) => {
      const btn = e.target.closest("button");
      if (!btn) return;

      // Inschrijven (plant deelname; verbruikt nog geen strip)
      if (btn.dataset.act === "enroll") {
        const custId = Number(prompt("Geef klantId om in te schrijven:"));
        if (!custId) return;
        const dogId = Number(prompt("Geef hondId (optioneel, leeg laten = geen):", "")) || null;
        try {
          await api(`/api/lessons/${btn.dataset.id}/enroll`, {
            method: "POST",
            body: JSON.stringify({ customerId: custId, dogId }),
          });
          await loadLessons();
          await loadCustomers(); // voor het geval UI elders afhankelijk is
        } catch (err) {
          alert("Inschrijven mislukt: " + err.message);
        }
      }

      // ✅ Bevestigen (verbruikt 1 strip)
      if (btn.dataset.act === "confirm") {
        const lessonId = Number(btn.dataset.lesson);
        const customerId = Number(btn.dataset.customer);
        try {
          await api(`/api/lessons/${lessonId}/confirm`, {
            method: "POST",
            body: JSON.stringify({ customerId }),
          });
          await loadLessons();
          await loadCustomers(); // update strippenkaarten in klantenlijst
        } catch (err) {
          alert("Bevestigen mislukt: " + err.message);
        }
      }
    });

    list.appendChild(el);
  });
}
