async function mailSend({ to, subject, html, text }){
  console.log('=== MAIL (mock) ===');
  console.log('To:', to);
  console.log('Subject:', subject);
  console.log('Text:', text);
  console.log('HTML length:', html?.length||0);
  console.log('===================');
  return { ok:true };
}
module.exports = { mailSend };
