// public/components/cards.js
export const els = {
  section: (title) => `
    <section class="section">
      <div class="sectionTitle">${title}</div>
      <div class="grid" data-slot="grid"></div>
    </section>
  `,
  cardCustomer: (c) => {
    const init = (c.name||"?").trim().slice(0,1).toUpperCase();
    return `
      <article class="card">
        <div class="cardHead">
          <div class="avatar customer">${init}</div>
          <div>
            <h3>${c.name||"Onbekende klant"}</h3>
            <div class="meta">${[c.email,c.phone].filter(Boolean).join(" • ")}</div>
          </div>
        </div>
        ${c.address?`<div class="kv"><b>Adres:</b> ${c.address}</div>`:""}
      </article>
    `;
  },
  cardDog: (d) => {
    const init = (d.name||"?").trim().slice(0,1).toUpperCase();
    return `
      <article class="card">
        <div class="cardHead">
          <div class="avatar dog">${init}</div>
          <div>
            <h3>${d.name||"Hond"}</h3>
            <div class="meta">${[d.breed, d.birthdate].filter(Boolean).join(" • ")}</div>
          </div>
        </div>
        ${d.ownerId?`<div class="kv"><b>Eigenaar ID:</b> ${d.ownerId}</div>`:""}
      </article>
    `;
  },
  cardPass: (p) => `
    <article class="card">
      <div class="cardHead">
        <div class="avatar pass">SP</div>
        <div>
          <h3>${p.type||"Strippenkaart"}</h3>
          <div class="meta">Hond ID: ${p.dogId ?? "-"}</div>
        </div>
      </div>
      <div class="row">
        <span class="badge">Totaal: ${p.total ?? "-"}</span>
        <span class="badge">Resterend: ${p.remaining ?? "-"}</span>
      </div>
      ${p.validUntil?`<div class="kv" style="margin-top:6px;"><b>Geldig tot:</b> ${p.validUntil}</div>`:""}
    </article>
  `,
};
