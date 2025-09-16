function openTab(tabId) {
  const sections = document.querySelectorAll('.tab-content');
  sections.forEach(sec => sec.style.display = 'none');
  document.getElementById(tabId).style.display = 'block';
}