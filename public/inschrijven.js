(async () => {
  const $ = s => document.querySelector(s);
  const notice = (msg, type='ok') => $('#notice').innerHTML = `<div class="notice ${type}">${msg}</div>`;
  const api = async (path, opt={}) => {
    const res = await fetch(path, { headers:{'Content-Type':'application/json'}, ...opt });
    if(!res.ok){ throw new Error(await res.text()); }
    const ct = res.headers.get('content-type')||'';
    return ct.includes('application/json') ? res.json() : res.text();
  };

  // --- Load courses + sessions
  const courses = await api('/api/courses');
  $('#course').innerHTML = courses.map(c=>`<option value="${c.id}">${c.naam}</option>`).join('');
  const allSessions = await api('/api/sessions');

  async function refreshSessions(){
    const id = $('#course').value;
    const sess = allSessions.filter(s => s.sjabloon_id === id && !s.geannuleerd);
    $('#session').innerHTML = sess.map(s=>`<option value="${s.id}">${s.datum} ${s.tijd}</option>`).join('');
    const c = courses.find(x=>x.id===id);
    $('#courseInfo').textContent = c ? `Max ${c.max} deelnemers · ${c.requires_pass ? 'Strippenkaart vereist' : 'Geen strippenkaart vereist'}` : '';
  }
  $('#course').onchange = refreshSessions;
  await refreshSessions();

  // --- Load existing clients + dogs
  let clients = await api('/api/clients');
  async function refreshDogs(){
    const cid = $('#client').value;
    const list = await api('/api/dogs?client_id='+encodeURIComponent(cid));
    $('#dog').innerHTML = list.map(d=>`<option value="${d.id}">${d.naam} ${d.ras?`(${d.ras})`:''}</option>`).join('');
  }
  function refreshClientsSelect(){
    $('#client').innerHTML = clients.map(c=>`<option value="${c.id}">${c.naam} (${c.email})</option>`).join('');
  }
  refreshClientsSelect();
  $('#client').onchange = refreshDogs;
  await refreshDogs();

  // --- Switchers
  $('#switchToNew').onclick = () => { $('#existingBlock').style.display='none'; $('#newBlock').style.display='block'; };
  $('#switchToExisting').onclick = () => { $('#newBlock').style.display='none'; $('#existingBlock').style.display='block'; };

  // --- Create client + dog if needed
  async function ensureClientAndDog(){
    // If using existing:
    if ($('#existingBlock').style.display !== 'none'){
      const client_id = $('#client').value;
      const dog_id = $('#dog').value;
      if (!client_id || !dog_id) throw new Error('Selecteer een klant en hond.');
      return { client_id, dog_id };
    }
    // Otherwise create new:
    const naam  = $('#newName').value.trim();
    const email = $('#newEmail').value.trim();
    const tel   = $('#newPhone').value.trim();
    const hond  = $('#newDogName').value.trim();
    const ras   = $('#newBreed').value.trim();
    const dob   = $('#newDob').value || null;

    if (!naam || !email || !hond) throw new Error('Naam, e-mail en naam van de hond zijn verplicht.');

    // 1) Client aanmaken
    const client = await api('/api/clients', {
      method:'POST',
      body: JSON.stringify({ naam, email, telefoon: tel })
    });

    // 2) Hond aanmaken
    const dog = await api('/api/dogs', {
      method:'POST',
      body: JSON.stringify({ naam: hond, ras, geboortedatum: dob, client_id: client.id })
    });

    // update local cache & selects
    clients = await api('/api/clients');
    refreshClientsSelect();
    $('#client').value = client.id;
    await refreshDogs();
    $('#dog').value = dog.id;

    // switch back to existing view
    $('#newBlock').style.display='none';
    $('#existingBlock').style.display='block';

    return { client_id: client.id, dog_id: dog.id };
  }

  // --- Submit
  $('#submitBtn').onclick = async () => {
    notice('Bezig met inschrijven…');
    try{
      const { client_id, dog_id } = await ensureClientAndDog();
      const body = {
        sessie_id: $('#session').value,
        client_id,
        dog_id
      };
      const enr = await api('/api/enrollments', { method:'POST', body: JSON.stringify(body) });
      const statusTxt = enr.status === 'aangemeld' ? '✅ Bevestigd' : 'ℹ️ Wachtlijst';
      notice(`${statusTxt}: ${enr.client?.naam} met ${enr.dog?.naam}.`, 'ok');
    }catch(e){
      // Probeer nette foutjes uit backend te tonen
      let msg = e.message || 'Onbekende fout';
      try{
        const parsed = JSON.parse(e.message);
        msg = parsed.message || parsed.error || msg;
      }catch(_){}
      notice('❌ '+msg, 'err');
    }
  };
})();
