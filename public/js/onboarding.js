
// Onboarding: load customer by ?customerId= and save missing fields
document.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(location.search);
  const id = Number(params.get('customerId') || 1); // fallback demo
  document.getElementById('cust-id').value = id;
  try{
    const res = await fetch('/api/customers/' + id);
    const c = await res.json();
    for (const k of ['name','email','phone','address','dogName','dogBreed','dogBirthdate']) {
      const el = document.getElementById(k);
      if (el && c[k] != null) el.value = c[k];
    }
  }catch(e){}

  document.getElementById('onb-form').addEventListener('submit', async (ev)=>{
    ev.preventDefault();
    const body = {};
    ['name','email','phone','address','dogName','dogBreed','dogBirthdate'].forEach(k=>{
      body[k] = document.getElementById(k).value;
    });
    try{
      const res = await fetch('/api/customers/' + id, {
        method:'PUT',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify(body)
      });
      if(!res.ok) throw new Error('HTTP '+res.status);
      document.getElementById('onb-status').textContent = 'Profiel opgeslagen. Je inschrijvingen zijn actief.';
    }catch(e){
      document.getElementById('onb-status').textContent = 'Opslaan mislukt: ' + e.message;
    }
  });
});
