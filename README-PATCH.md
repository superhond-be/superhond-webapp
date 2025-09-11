# Patch — zichtbare versie op dashboard
Deze patch toont **v15** zichtbaar op je dashboard en voorziet een gedeelde loader
die de versie uit `/version.json` haalt.

## Bestanden
```
public/
  index.html          ← vernieuwd skelet met versie-chip en links
  version.json        ← { "version": "v15", "build_date": "2025-09-11" }
  js/version.js       ← laadt en toont versie
  css/app.css         ← basisstijl incl. versie-chip
```

## Installatie
- Kopieer deze bestanden naar je `public/` map (overschrijf je oude `index.html` alleen als jij dat wil).  
- Als je al een eigen `app.css` hebt, kun je de `.version-chip` en basisregels kopiëren.

De versie-chip werkt ook zonder `version.json` (fallback toont `v15`). 
