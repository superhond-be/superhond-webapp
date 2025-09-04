(async () => {
  const $ = sel => document.querySelector(sel);
  const notice = (msg,type='ok')=>{
    $('#notice').innerHTML = `<div class="notice ${type}">${msg}</div>`;
  };
  async function api(path,opt={}){
    const res = await fetch(path,{headers:{'Content-Type':'application/json'},...opt});
    if(!res.ok) throw new Error(await res.text());
    return res.json();
  }

  // Laad cursussen
  const courses = await api('/api/courses');
  $('#course').innerHTML = courses.map(c=>`<option value="${c.id}">${c.naam}</option>`).join('');
  async function loadSessions(){
    const id = $('#course').value;
    const sessions = await api('/api/sessions');
    const list = sessions.filter(s=>s.sjabloon_id===id);
    $('#session').innerHTML = list.map(s=>`<option value="${s.id}">${s.datum} ${s.tijd}</option>`).join('');
  }
  $('#course').onchange = loadSessions;
  await loadSessions();

  // Laad klanten en honden
  const clients = await api('/api/clients');
  $('#client').innerHTML = clients.map(c=>`<option value="${c.id}">${c.naam} (${c.email})</option>`).join('');
  async function loadDogs(){
    const cid = $('#client').value;
    const dogs = await api('/api/dogs?client_id='+cid);
    $('#dog').innerHTML = dogs.map(d=>`<option value="${d.id}">${d.naam} (${d.ras||''})</option>`).join('');
  }
  $('#client').onchange = loadDogs;
  await loadDogs();

  // Form submit
  $('#form').onsubmit = async e=>{
    e.preventDefault();
    try{
      const body = {
        sessie_id: $('#session').value,
        client_id: $('#client').value,
        dog_id: $('#dog').value
      };
      const enr = await api('/api/enrollments',{method:'POST',body:JSON.stringify(body)});
      notice(`✅ Inschrijving gelukt voor ${enr.client?.naam} met hond ${enr.dog?.naam} (${enr.status})`,'ok');
    }catch(err){ notice('❌ Fout: '+err.message,'err'); }
  };
})();
