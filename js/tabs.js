
(function(){
  const tabs = document.querySelectorAll('.tab-btn');
  const sections = document.querySelectorAll('.tab-content');
  function activate(id){
    tabs.forEach(t=>t.classList.toggle('active', t.dataset.target===id));
    sections.forEach(s=>{s.hidden = (s.id !== id)});
    localStorage.setItem('sh_last_tab', id);
  }
  tabs.forEach(btn=>btn.addEventListener('click', ()=> activate(btn.dataset.target)));
  activate(localStorage.getItem('sh_last_tab') || tabs[0]?.dataset.target);
})();
