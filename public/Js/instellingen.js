document.addEventListener("DOMContentLoaded", () => {
  const trainingForm = document.getElementById("training-form");
  const registrationForm = document.getElementById("registration-form");
  const output = document.getElementById("output");

  // sync zichtbaarheidslogica
  function syncOnline() {
    const actief = trainingForm.actief.value === "J";
    [...trainingForm.online].forEach(input => {
      input.disabled = !actief;
      if (!actief && input.value === "N") input.checked = true;
    });
  }
  trainingForm.actief.forEach(radio => radio.addEventListener("change", syncOnline));
  syncOnline();

  // opslaan training
  trainingForm.addEventListener("submit", e => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(trainingForm).entries());

    // validatie: aantal <= max
    const aantal = parseInt(data.aantal || 0, 10);
    const max = parseInt(data.max || 0, 10);
    if (data.max && aantal > max) {
      alert("Aantal mag niet groter zijn dan Max deelnemers.");
      return;
    }
    if (data.online === "J" && data.actief !== "J") {
      alert("Online zichtbaar kan alleen als Actief = Ja.");
      return;
    }

    localStorage.setItem("trainingSettings", JSON.stringify(data));
    output.textContent = "Training opgeslagen:\n" + JSON.stringify(data, null, 2);
  });

  // opslaan registratie
  registrationForm.addEventListener("submit", e => {
    e.preventDefault();
    const data = {};
    registrationForm.querySelectorAll("input[type=checkbox]").forEach(cb => {
      data[cb.name] = cb.checked;
    });
    localStorage.setItem("registrationSettings", JSON.stringify(data));
    output.textContent = "Registratie opgeslagen:\n" + JSON.stringify(data, null, 2);
  });

  // laad eerdere data uit localStorage
  const trainingData = localStorage.getItem("trainingSettings");
  if (trainingData) {
    const parsed = JSON.parse(trainingData);
    for (let k in parsed) {
      if (trainingForm[k]) {
        if (trainingForm[k].type === "radio") {
          trainingForm[k].forEach(r => r.checked = (r.value === parsed[k]));
        } else {
          trainingForm[k].value = parsed[k];
        }
      }
    }
  }
  const regData = localStorage.getItem("registrationSettings");
  if (regData) {
    const parsed = JSON.parse(regData);
    for (let k in parsed) {
      const cb = registrationForm.querySelector(`[name=${k}]`);
      if (cb) cb.checked = parsed[k];
    }
  }
});
