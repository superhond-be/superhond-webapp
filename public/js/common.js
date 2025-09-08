
// Common helpers for auth, tabs, nav updates
const AUTH_KEY = 'superhond_token';

function setToken(token){ localStorage.setItem(AUTH_KEY, token); updateAuthLink(); }
function getToken(){ return localStorage.getItem(AUTH_KEY); }
function clearToken(){ localStorage.removeItem(AUTH_KEY); updateAuthLink(); }

function authHeaders(){
  const t = getToken();
  return t ? { 'Authorization': 'Bearer ' + t } : {};
}

function updateAuthLink(){
  const loginLink = document.querySelector('a[href="./admin-login.html"]');
  if(!loginLink) return;
  if(getToken()){
    loginLink.textContent = 'Logout';
    loginLink.addEventListener('click', (e) => {
      e.preventDefault();
      clearToken();
      window.location.href = './admin-login.html';
    }, { once: true });
  }else{
    loginLink.textContent = 'Login';
  }
}

function requireAuth(){
  if(!getToken()){
    window.location.href = './admin-login.html';
  }
}

document.addEventListener('DOMContentLoaded', updateAuthLink);

// Tabs
document.addEventListener('click', (e) => {
  const t = e.target;
  if (t.matches('.tab')) {
    const container = t.closest('main');
    container.querySelectorAll('.tab').forEach(btn => btn.classList.remove('active'));
    t.classList.add('active');
    const target = t.getAttribute('data-tab');
    container.querySelectorAll('.tabpanel').forEach(p => p.classList.remove('show'));
    const panel = container.querySelector('#tab-' + target);
    if (panel) panel.classList.add('show');
  }
});
