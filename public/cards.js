// public/components/cards.js
export const els = {
  section: (title) => `
    <section class="section">
      <div class="sectionTitle">${title}</div>
      <div class="grid" data-slot="grid"></div>
    </section>
  `,

  cardCustomer: (c) => `
    <article class="card">
      <h3>${c.name || "Onbekende klant"}</h3>
      <p><b>Email:</b> ${c.email || "-"}</p>
      <p><b>Telefoon:</b> ${c.phone || "-"}</p>
      ${c.address ? `<p><b>Adres:</b> ${c.address}</p>` : ""}
    </article>
  `,

  cardDog: (d) => `
    <article class="card">
      <h3>${d.name || "Hond"}</h3>
      <p><b>Ras:</b> ${d.breed || "-"}</p>
      <p><b>Geboortedatum:</b> ${d.birthdate || "-"}</p>
      ${d.ownerId ? `<p><b>Eigenaar ID:</b> ${d.ownerId}</p>` : ""}
    </article>
  `,

  cardPass: (p) => `
    <article class="card">
      <h3>${p.type || "Strippenkaart"}</h3>
      <div class="row">
        <span class="badge">Totaal: ${p.total ?? "-"}</span>
        <span class="badge">Resterend: ${p.remaining ?? "-"}</span>
      </div>
      <p style="margin-top:6px;"><b>Hond ID:</b> ${p.dogId ?? "-"}</p>
      ${p.validUntil ? `<p><b>Geldig tot:</b> ${p.validUntil}</p>` : ""}
    </article>
  `,
};
