
(async function(){
  const btn = document.getElementById('check');
  const out = document.getElementById('out');
  btn?.addEventListener('click', async()=>{
    out.textContent = "Bezig…";
    try{
      const data = await sh.$json('/api/admin/users/status');
      out.innerText = JSON.stringify(data);
    }catch(err){
      out.innerText = 'Fout: ' + err.message;
    }
  });
})();
