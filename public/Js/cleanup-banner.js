/* cleanup-banner.js v0903m — verwijder elke debug/stylesheet banner */
(function () {
  // 1) Bekende selectors
  const selectors = [
    "#style-debug", ".env-banner", ".debug-banner", ".style-banner", ".dev-banner",
    ".render-banner", ".render-debug", ".top-banner", ".notice", ".alert"
  ];

  // 2) Tekstpatronen die vaak in zulke banners staan
  const textHints = [
    "stylesheet geladen",
    "stylesheets geladen",
    "versie",
    "debug",
    "development",
    "this service is currently unavailable",
    "render",
  ];

  // 3) Heuristiek: Hoge, volle-breedte balken aan de top met felle achtergrond
  function looksLikeBanner(el) {
    try {
      const rect = el.getBoundingClientRect();
      const style = getComputedStyle(el);
      const txt = (el.textContent || "").toLowerCase().trim();

      const brightBg = (() => {
        const bg = style.backgroundColor || "";
        // simpele check op opvallende kleuren (rood/roze/paars/geel)
        return /(rgb\((2(2[0-9]|[0-5][0-9]),\s?){2}\d+\))|#(ff|ee|dd|cc)/i.test(bg);
      })();

      const isTop = rect.top <= 0 || el === document.body.firstElementChild;

      const hasHint = textHints.some(h => txt.includes(h));
      const looksBannerish =
        rect.height >= 24 &&
        rect.width >= (window.innerWidth * 0.6) &&
        (isTop || brightBg || hasHint);

      return looksBannerish;
    } catch { return false; }
  }

  function kill(el) {
    try { el.remove(); } catch {}
  }

  function sweep(root = document) {
    // a) bekende selectors
    selectors.forEach(sel => root.querySelectorAll(sel).forEach(kill));

    // b) alle directe top-kinderen controleren
    Array.from(document.body.children).forEach(el => {
      if (looksLikeBanner(el)) kill(el);
    });

    // c) bovenaan geplaatste fixed/sticky elementen
    document.querySelectorAll("div,section,header,aside,nav").forEach(el => {
      const st = getComputedStyle(el);
      const posTop = (st.position === "fixed" || st.position === "sticky") && (parseInt(st.top || "0", 10) <= 0);
      if (posTop && looksLikeBanner(el)) kill(el);
    });
  }

  // Eerste sweep zodra DOM er is
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", sweep, { once: true });
  } else {
    sweep();
  }

  // Nog een sweep na load (sommige banners komen laat)
  window.addEventListener("load", () => setTimeout(sweep, 50), { once: true });

  // Fallback: observeer latere injecties (MutationObserver)
  const mo = new MutationObserver((muts) => {
    for (const m of muts) {
      m.addedNodes.forEach(node => {
        if (!(node instanceof HTMLElement)) return;
        if (looksLikeBanner(node)) kill(node);
        // ook binnenin nieuwe nodes
        sweep(node);
      });
    }
  });
  try {
    mo.observe(document.documentElement, { childList: true, subtree: true });
  } catch {}
})();
