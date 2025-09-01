/* ===== Superhond UI – Clean Card Look ===== */
:root{
  --bg: #f6f8fb;
  --card: #ffffff;
  --text: #1f2937;
  --muted: #6b7280;
  --border: #e5e7eb;
  --primary: #2563eb;
  --accent: #f59e0b;
  --ok: #16a34a;
  --radius: 14px;
  --shadow: 0 10px 30px rgba(2, 6, 23, .06);
}

*{box-sizing:border-box}
html,body{height:100%}
body{
  margin:0;
  background: linear-gradient(180deg, #f8fbff 0%, #f3f6fc 100%);
  color:var(--text);
  font: 16px/1.5 system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial, "Noto Sans", "Apple Color Emoji","Segoe UI Emoji";
}

/* Top nav */
nav ul{
  list-style:none; padding:12px 20px; margin:0;
  display:flex; gap:16px; flex-wrap:wrap;
  background:#ffffffcc; backdrop-filter:saturate(1.2) blur(6px);
  border-bottom:1px solid var(--border)
}
nav a, nav li{color:var(--text); text-decoration:none; font-weight:600}

/* Page */
main{max-width:1100px; margin:24px auto; padding:0 20px}
h1{font-size: clamp(24px, 2.8vw, 36px); margin:0 0 8px}
h2{font-size: clamp(18px, 2.2vw, 24px); margin:18px 0 10px}
h3{font-size:18px; margin:0 0 6px}
.status{margin-top:8px; color:var(--muted)}

/* Search */
.search-wrap{
  margin-top:18px; display:flex; gap:10px; flex-wrap:wrap; align-items:center;
}
.search-input{
  flex:1; min-width:260px; padding:12px 14px;
  border:1px solid var(--border); border-radius: 12px; background:#fff; font-size:16px; outline:none;
  box-shadow: inset 0 1px 0 rgba(0,0,0,.02);
}
.search-input:focus{border-color:var(--primary)}
.btn{
  padding:10px 16px; border:0; border-radius:12px;
  background:var(--primary); color:#fff; font-weight:700; cursor:pointer;
  box-shadow: 0 6px 16px rgba(37,99,235,.25);
}
.btn:hover{filter:brightness(.98)}

/* Sections & cards */
.section{
  margin-top:18px;
  background: var(--card);
  border:1px solid var(--border);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding:14px;
}
.section-title{
  display:flex; align-items:center; gap:10px; margin:2px 0 10px; color:var(--muted);
  font-weight:800; letter-spacing:.02em; text-transform:uppercase; font-size:12px;
}

.cards{
  display:grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap:14px;
}

.card{
  background:#fff; border:1px solid var(--border); border-radius: 12px;
  padding:14px; box-shadow: 0 6px 16px rgba(2,6,23,.05);
  transition: transform .12s ease, box-shadow .12s ease;
}
.card:hover{ transform: translateY(-2px); box-shadow: 0 12px 28px rgba(2,6,23,.08); }

.card-head{display:flex; align-items:center; gap:10px; margin-bottom:8px}
.avatar{
  width:38px; height:38px; border-radius:10px; display:grid; place-items:center;
  color:#fff; font-weight:800; font-size:14px;
}
.avatar.customer{ background: linear-gradient(135deg, var(--primary), #5b8ef7);}
.avatar.dog{ background: linear-gradient(135deg, #10b981, #4ade80);}
.avatar.pass{ background: linear-gradient(135deg, var(--accent), #fbbf24);}

.card h3{margin:0; font-size:16px}
.meta{color:var(--muted); font-size:13px}
.row{display:flex; gap:8px; flex-wrap:wrap; margin-top:8px}
.badge{
  background:#eef2ff; color:#3730a3; border:1px solid #e0e7ff;
  padding:4px 8px; border-radius:999px; font-size:12px; font-weight:700;
}
.kv{font-size:13px; color:var(--text)}
.kv b{color:#111827}

/* Dark mode */
@media (prefers-color-scheme: dark){
  :root{ --bg:#0b1220; --card:#0f172a; --text:#e5e7eb; --muted:#94a3b8; --border:#1f2a44; --shadow: 0 10px 30px rgba(0,0,0,.45);}
  body{background:linear-gradient(180deg,#0b1220,#0e1424)}
  nav ul{background:#0f172acc; border-color:#1f2a44}
  .search-input{background:#0f172a; color:var(--text); border-color:#1f2a44}
  .card{background:#0f172a; border-color:#1f2a44}
  .section{background:#0f172a; border-color:#1f2a44}
  .badge{background:#172554; color:#c7d2fe; border-color:#1e3a8a}
}
