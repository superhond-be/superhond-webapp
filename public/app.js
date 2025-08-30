// === helpers ===
async function api(url, options) {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
function byId(id){ return document.getElementById(id); }
function setRows(tbodyId, rowsHtml){ byId(tbodyId).innerHTML = rowsHtml; }

// === tabs (zorg dat je tab-buttons data-tab attribuut hebben) ===
document.querySelectorAll("button.tab").forEach(btn=>{
  btn.addEventListener("click", ()=>{
    const tab = btn.dataset.tab;
    document.querySelectorAll(".view").forEach(v=>v.hidden = v.id !== tab);
    // lazy load per tab
    if (tab === "lesson-types") loadLessonTypes();
    if (tab === "themes") loadThemes();
    if (tab === "locations") loadLocations();
  });
});

// === Lestypes ===
async function loadLessonTypes(){
  const data = await api("/api/lesson-types");
  const rows = data.map(x=>`<tr><td>${x.id}</td><td>${x.name}</td><td>${x.description||""}</td><td>${x.active?"Ja":"Nee"}</td></tr>`).join("");
  setRows("lt-body", rows);
}
byId("lt-form")?.addEventListener("submit", async e=>{
  e.preventDefault();
  const f = new FormData(e.target);
  await api("/api/lesson-types", {
    method:"POST",
    body: JSON.stringify({
      name: f.get("name"),
      description: f.get("description"),
      active: f.get("active") === "on",
    })
  });
  e.target.reset(); 
  await loadLessonTypes();
});

// === Thema's ===
async function loadThemes(){
  const data = await api("/api/themes");
  const rows = data.map(x=>`<tr><td>${x.id}</td><td>${x.name}</td><td>${x.description||""}</td></tr>`).join("");
  setRows("th-body", rows);
}
byId("th-form")?.addEventListener("submit", async e=>{
  e.preventDefault();
  const f = new FormData(e.target);
  await api("/api/themes", {
    method:"POST",
    body: JSON.stringify({ name: f.get("name"), description: f.get("description") })
  });
  e.target.reset(); 
  await loadThemes();
});

// === Locaties ===
async function loadLocations(){
  const data = await api("/api/locations");
  const rows = data.map(x=>`<tr><td>${x.id}</td><td>${x.name}</td><td>${x.address||""}</td><td>${x.postal||""}</td><td>${x.city||""}</td></tr>`).join("");
  setRows("loc-body", rows);
}
byId("loc-form")?.addEventListener("submit", async e=>{
  e.preventDefault();
  const f = new FormData(e.target);
  await api("/api/locations", {
    method:"POST",
    body: JSON.stringify({
      name: f.get("name"),
      address: f.get("address"),
      postal: f.get("postal"),
      city: f.get("city"),
    })
  });
  e.target.reset(); 
  await loadLocations();
});
