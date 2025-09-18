# Superhond — v0.15.4 Global Scroll Patch

Maakt **alle tabellen** (Namen/Types/Locaties/Thema’s/Trainers/Beheer) horizontaal scrollbaar in Superhond-style.

## Installatie
1. Kopieer `public/css/app.css` over je bestaande CSS (of voeg de inhoud toe aan je huidige stylesheet).
2. Voeg in je `index.html` **onderaan** toe (na je andere scripts):

```html
<script src="js/auto-table-wrapper.js"></script>
```

Klaar. Alle `<table class="table">` krijgen automatisch een `.table-wrapper` en kunnen **links/rechts scrollen** op smalle schermen.

> Tip: als je al handmatig een `.table-wrapper` rond een tabel hebt, dan doet het script niets (veilig).
