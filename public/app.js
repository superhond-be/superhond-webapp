// public/app.js
// ============================================================
//  Superhond Coach Portaal - Frontend JS
//  - Foto preview
//  - Registratie klant + hond (multipart/form-data)
//  - Feedback & kleine UX-hulpen
// ============================================================

(function () {
  // ---- Helpers -------------------------------------------------------------

  /** Select helper */
  function $(sel, scope) {
    return (scope || document).querySelector(sel);
  }

  /** Maak element met attrs en children */
  function el(tag, attrs, children) {
    const n = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach((k) => {
        if (k === "style" && typeof attrs[k] === "object") {
          Object.assign(n.style, attrs[k]);
        } else if (k in n) {
          n[k] = attrs[k];
        } else {
          n.setAttribute(k, attrs[k]);
        }
      });
    }
    if (children) {
      (Array.isArray(children) ? children : [children]).forEach((c) =>
        n.appendChild(typeof c === "string" ? document.createTextNode(c) : c)
      );
    }
    return n;
  }

  /** Klein statusbadgetje */
  function badge(text, ok = true) {
    return el(
      "span",
      {
        className: ok ? "badge-ok" : "badge-err",
        style: {
          display: "inline-block",
          padding: "0.25rem 0.5rem",
          borderRadius: "999px",
          fontWeight: "600",
          marginRight: "8px",
        },
      },
      text
    );
  }

  /** Toon melding in resultBox */
  function showMessage(html, ok = true) {
    const box = $("#result");
    if (!box) return;
    box.innerHTML = "";
    box.appendChild(badge(ok ? "✔ Geregistreerd!" : "✖ Fout", ok));
    const wrap = el("div", { style: { marginTop: "8px" } });
    wrap.innerHTML = html;
    box.appendChild(wrap);
    box.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  /** Converteer File -> lokale preview URL */
  function fileToPreviewURL(file) {
    try {
      return URL.createObjectURL(file);
    } catch {
      return null;
    }
  }

  // ---- DOM refs ------------------------------------------------------------

  const formEl = $("#register-form"); // hele registratieform
  const dogFileEl = $("#dog-photo"); // <input type="file">
  const previewBox = $("#dog-preview"); // container voor preview
  const reloadBtn = $("#btn-reload"); // optioneel: herladen lijstje/overzicht

  // ---- Foto preview --------------------------------------------------------

  if (dogFileEl && previewBox) {
    dogFileEl.addEventListener("change", function () {
      const file = dogFileEl.files && dogFileEl.files[0];
      previewBox.innerHTML = "";
      if (!file) return;

      const url = fileToPreviewURL(file);
      if (!url) {
        previewBox.textContent = "Kon preview niet maken.";
        return;
      }

      const img = el("img", {
        src: url,
        alt: "Voorbeeldfoto van hond",
        style: {
          maxWidth: "160px",
          maxHeight: "160px",
          objectFit: "cover",
          borderRadius: "8px",
          border: "1px solid #2d3340",
          display: "block",
        },
      });
      previewBox.appendChild(img);
    });
  }

  // ---- Optioneel: simpele reloadknop --------------------------------------

  if (reloadBtn) {
    reloadBtn.addEventListener("click", function (e) {
      e.preventDefault();
      location.reload();
    });
  }

  // ---- Registratie submit --------------------------------------------------

  if (formEl) {
    formEl.addEventListener("submit", async function (e) {
      e.preventDefault();

      // Beveiliging: voorkom dubbelklikken
      const submitBtn = formEl.querySelector('button[type="submit"], input[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.dataset._origText = submitBtn.textContent || submitBtn.value || "";
        if ("textContent" in submitBtn) submitBtn.textContent = "Versturen…";
        if ("value" in submitBtn) submitBtn.value = "Versturen…";
      }

      // Bouw multipart/form-data op
      const fd = new FormData(formEl);

      // Als er een fotobestand is, voeg het toe onder sleutel 'dogPhoto'
      if (dogFileEl && dogFileEl.files && dogFileEl.files[0]) {
        fd.set("dogPhoto", dogFileEl.files[0]); // naam moet backend-veld matchen
      }

      // Optioneel: kleine client-side sanity checks
      // (we laten de backend de echte validatie doen)
      const name = (fd.get("customerName") || "").toString().trim();
      const email = (fd.get("customerEmail") || "").toString().trim();
      const dogName = (fd.get("dogName") || "").toString().trim();
      if (!name || !email || !dogName) {
        showMessage(
          "Vul minstens <strong>klantnaam</strong>, <strong>e-mail</strong> en <strong>naam hond</strong> in.",
          false
        );
        if (submitBtn) {
          submitBtn.disabled = false;
          if ("textContent" in submitBtn) submitBtn.textContent = submitBtn.dataset._origText || "Registreren";
          if ("value" in submitBtn) submitBtn.value = submitBtn.dataset._origText || "Registreren";
        }
        return;
      }
${photoHtml}
 Klant: ${customer.name || "-"} (${customer.email || "-"})<br>
 Telefoon: ${customer.phone || "-"}<br> Lestype: ${customer.lessonType || "-"}<br><br> Hond: ${dog.name || "-"} (${dog.breed || "-"})
         `;
      try {
         // Belangrijk: endpoint moet bestaan en multipart accepteren
        const res = await fetch("/api/customers/register", {
          method: "POST",
          body: fd, // browser zet boundary zelf
        });

        if (!res.ok) {
          let msg = "Registratie mislukt.";
          try {
            const err = await res.json();
            if (err && err.message) msg = err.message;
          } catch {}
          throw new Error(msg);
        }

        const data = await res.json();
        const customer = data && data.customer ? data.customer : {};
        const dog = data && data.dog ? data.dog : {};
       .badge-ok  { background:#1f8b4c; color:#fff; }
       .badge-err { background:#b3261e; color:#fff; }
       #result { padding: 12px; border:1px solid #2d3340; border-radius:8px; margin-top:12px; }
     `);
        // Foto tonen: backend zou een publiek toegankelijke URL moeten terugsturen
        const photoHtml =
          dog && dog.photoUrl
            ? `<img src="${dog.photoUrl}" alt="foto van hond" style="max-width:120px;display:block;margin:10px 0;border-radius:8px;border:1px solid #2d3340;">`
            : "<em>geen foto</em>";

        const html = `
${photoHtml}
<strong>Klant:</strong> ${customer.name || "-"} (${customer.email || "-"})<br>
<strong>Telefoon:</strong> ${customer.phone || "-"}<br>
<strong>Lestype:</strong> ${customer.lessonType || "-"}<br><br>
<strong>Hond:</strong> ${dog.name || "-"} (${dog.breed || "-"})
        `;

        showMessage(html, true);

        // Form resetten (laat preview staan zodat gebruiker weet wat is ingestuurd)
        // Verwijder hieronder // om óók de preview te wissen:
        formEl.reset();
        // previewBox.innerHTML = "";

      } catch (err) {
        showMessage(err.message || "Er ging iets mis bij het registreren.", false);
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          if ("textContent" in submitBtn) submitBtn.textContent = submitBtn.dataset._origText || "Registreren";
          if ("value" in submitBtn) submitBtn.value = submitBtn.dataset._origText || "Registreren";
        }
      }
    });
  }

  // ---- Klein stijltje voor badges (fallback als CSS ontbreekt) ------------
  (function injectBadgeCss() {
    if (document.getElementById("sh-badge-style")) return;
    const style = el("style", { id: "sh-badge-style" }, `
      .badge-ok  { background:#1f8b4c; color:#fff; }
      .badge-err { background:#b3261e; color:#fff; }
      #result { padding: 12px; border:1px solid #2d3340; border-radius:8px; margin-top:12px; }
    `);
    document.head.appendChild(style);
  })();
})();
