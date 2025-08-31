const api = {
  list: async () => (await fetch("/api/passes")).json(),
  add: async (type, strips) => (await fetch("/api/passes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type, strips: Number(strips) })
  })).json(),
  useOne: async (id) => (await fetch(`/api/passes/${id}/use`, { method: "POST" })).json()
};

const $ = (sel) => document.querySelector(sel);
const tableBody = $("#passesBody");
const statusLine = $("#statusLine");

function setStatus(msg) {
  statusLine.textContent = msg;
}

async function refresh() {
  setStatus("Vernieuwen…");
  try {
    const data = await api.list();
    renderRows(data);
    setStatus(`Laatst geladen: ${new Date().toLocaleString()}`);
  } catch (e) {
    console.error(e);
    setStatus("Fout bij laden.");
  }
}

function renderRows(passes) {
  tableBody.innerHTML = "";
  if (!passes || passes.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="4" class="muted">Geen kaarten</td></tr>`;
    return;
  }

  for (const p of passes) {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${p.id}</td>
      <td>${p.type}</td>
      <td><span class="pill">${p.strips}</span></td>
      <td><button data-id="${p.id}" class="use-btn">Gebruik 1 strip</button></td>
    `;
    tableBody.appendChild(tr);
  }

  // Koppel events
  tableBody.querySelectorAll(".use-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.getAttribute("data-id");
      setStatus(`Strip gebruiken voor kaart #${id}…`);
      const res = await api.useOne(id);
      if (res.error) {
        setStatus(`Fout: ${res.error}`);
      } else {
        setStatus(`OK: ${res.message}`);
        refresh();
      }
    });
  });
}

$("#addBtn").addEventListener("click", async () => {
  const type = $("#typeInput").value.trim();
  const strips = $("#stripsInput").value;
  if (!type || !strips) {
    setStatus("Geef type én aantal strips in.");
    return;
  }
  setStatus("Kaart toevoegen…");
  const res = await api.add(type, strips);
  if (res.error) {
    setStatus(`Fout: ${res.error}`);
  } else {
    $("#typeInput").value = "";
    $("#stripsInput").value = "";
    setStatus(`Toegevoegd: ${res.type} (${res.strips} strips)`);
    refresh();
  }
});

refresh();
