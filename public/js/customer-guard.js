// Guard for customer pages
(function(){
  const token = localStorage.getItem('sh_token');
  const here = (location.pathname.split('/').pop() || '').toLowerCase();
  const protectedPages = ['klantenportaal.html'];
  if(protectedPages.includes(here) && !token){
    location.replace('customer-login.html');
  }
})();