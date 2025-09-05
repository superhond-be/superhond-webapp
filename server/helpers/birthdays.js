const { read: readDogs } = require('./dogs');
const { readCustomers } = require('./customers');
const { create: notify } = require('./notifications');
const { getPolicy } = require('./notification_policy');

function checkTodayBirthdays(){
  const today = new Date(); const day = today.getDate(); const month = today.getMonth()+1;
  const dogs = readDogs(); const customers = readCustomers();
  const birthdayDogs = dogs.filter(d=> d.gebdatum && (new Date(d.gebdatum).getDate()===day) && (new Date(d.gebdatum).getMonth()+1===month));
  birthdayDogs.forEach(d=>{
    const cust = customers.find(c=>c.id===d.eigenaar_id); if(!cust) return;
    const policy = getPolicy('dog_birthday') || { audience:'customer', delivery:['email'] };
    notify({ type:'dog_birthday', message:`🎂 Vandaag is ${d.naam} jarig!`, customer_id:cust.id, dog_id:d.id, audience:policy.audience, delivery:policy.delivery, email_to:cust.email });
  });
  return birthdayDogs.length;
}
module.exports = { checkTodayBirthdays };
