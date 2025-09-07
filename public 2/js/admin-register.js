// public/js/admin-register.js
document.addEventListener('DOMContentLoaded',()=>{
  const form=document.getElementById('registerForm');
  if(!form) return;
  form.addEventListener('submit',async e=>{
    e.preventDefault();
    const name=document.getElementById('name').value;
    const email=document.getElementById('email').value;
    const password=document.getElementById('password').value;
    try{
      const res=await fetch('/api/admin/register',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name,email,password})});
      const data=await res.json();
      alert(data.ok?"Registratie geslaagd!":"Registratie mislukt!");
    }catch(err){ alert("Fout bij registratie: "+err.message); }
  });
});
