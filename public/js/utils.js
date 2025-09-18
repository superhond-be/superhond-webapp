
function formatTrainerNames(ids, trainers){
  const byId = (arr,id)=>arr.find(x=>x.id===id)||{};
  return (ids||[]).map(id=>byId(trainers,id).naam).filter(Boolean).join(', ');
}
function saveFile(name, text){
  const a=document.createElement('a');
  a.href='data:text/csv;charset=utf-8,'+encodeURIComponent(text);
  a.download=name; a.style.display='none'; document.body.appendChild(a); a.click(); a.remove();
}
