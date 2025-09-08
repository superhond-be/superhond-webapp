document.getElementById('klantForm').addEventListener('submit', async e => {
  e.preventDefault();
  const data = {
    naam: document.getElementById('naam').value.trim(),
    email: document.getElementById('email').value.trim(),
    adres: document.getElementById('adres').value.trim(),
    hond: document.getElementById('hond').value.trim(),
    ras: document.getElementById('ras').value.trim(),
    dierenarts: document.getElementById('dierenarts').value.trim(),
    credits: document.getElementById('credits').value
  };
  document.getElementById('out').textContent = JSON.stringify(data,null,2);
  // Hier kan later een fetch naar backend komen, bv POST /api/klanten
});