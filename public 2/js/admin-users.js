// public/js/admin-users.js
(function(){
  const qs=(s,r=document)=>r.querySelector(s);
  const out=(msg)=>{const box=qs("#resultBox")||qs("pre"); if(box) box.textContent=JSON.stringify(msg,null,2);};

  async function loadUsers(){
    const box=qs("#adminUsersList"); if(!box) return;
    box.textContent="Laden...";
    try{
      const r=await fetch("/api/admin/users",{headers:{"Accept":"application/json"}});
      if(!r.ok) throw new Error("HTTP "+r.status);
      const data=await r.json();
      if(Array.isArray(data.users)&&data.users.length){
        box.innerHTML="";
        const ul=document.createElement("ul");
        data.users.forEach(u=>{const li=document.createElement("li"); li.textContent=`${u.name} – ${u.email} (${u.role})`; ul.appendChild(li);});
        box.appendChild(ul);
      } else {
        box.innerHTML="<div class='muted'>Geen gebruikers gevonden.</div>";
      }
    }catch(err){ box.innerHTML="<div class='error'>Fout bij laden</div>"; out({ok:false,error:String(err)}); }
  }

  async function addUser(ev){
    ev.preventDefault();
    const f=ev.target;
    const payload={name:f.name.value.trim(), email:f.email.value.trim(), password:f.password.value, role:f.role.value};
    try{
      const r=await fetch("/api/admin/users",{method:"POST",headers:{"Content-Type":"application/json","Accept":"application/json"},body:JSON.stringify(payload)});
      const data=await r.json();
      out(data);
      if(data.ok){ f.reset(); loadUsers(); }
    }catch(err){ out({ok:false,error:String(err)}); }
  }

  function init(){ const f=qs("#addAdminUserForm"); if(f) f.addEventListener("submit",addUser); loadUsers(); }
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",init); else init();
})();
