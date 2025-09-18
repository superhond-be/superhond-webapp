// v0.15.4 — Auto-wrap all .table in .table-wrapper if not already wrapped
document.addEventListener('DOMContentLoaded', ()=>{
  document.querySelectorAll('table.table').forEach(tbl=>{
    if(!tbl.closest('.table-wrapper')){
      const wrap=document.createElement('div');
      wrap.className='table-wrapper';
      tbl.parentNode.insertBefore(wrap, tbl);
      wrap.appendChild(tbl);
    }
  });
});
