(function(){
  const tabs = document.querySelectorAll('.tab-btn');
  const sections = document.querySelectorAll('.tab-content');
  function activate(id){
    tabs.forEach(t=>t.classList.toggle('active', t.dataset.target===id));
    sections.forEach(s=>{s.hidden = (s.id !== id)});
    document.querySelector('main').scrollTop = 0;
  }
  tabs.forEach(btn=>{
    btn.addEventListener('click', ()=> activate(btn.dataset.target));
  });
  // init
  if (tabs[0]) activate(tabs[0].dataset.target);
})();