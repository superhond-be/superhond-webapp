const { read: readCredits } = require('./credits');
const Dogs = require('./dogs');
const { readCustomers } = require('./customers');

function daysLeft(ts){ if(!ts) return null; return Math.ceil((ts - Date.now())/(1000*60*60*24)); }

function buildSegments(course_id){
  const credits = readCredits();
  const dogs = Dogs.read();
  const customers = readCustomers();
  const dogById = new Map(dogs.map(d=>[d.id,d]));
  const custById = new Map(customers.map(c=>[c.id,c]));
  const rel = credits.filter(c=> c.course_id===course_id);
  const byDog = new Map();
  rel.forEach(c=>{ if(!c.dog_id) return; if(!byDog.has(c.dog_id)) byDog.set(c.dog_id,[]); byDog.get(c.dog_id).push(c); });

  const seg = { active_member:[], nearly_expiring:[], completed:[], pending_approval:[], inactive:[] };
  const seenOwners = new Set();

  function pushSeg(key, cust, dog, agg){
    seg[key].push({
      customer_id:cust?.id||null, customer_name:cust?.naam||'', email:(cust?.email||'').toLowerCase(),
      dog_id:dog?.id||null, dog_name:dog?.naam||'', course_id:course_id, ...agg
    });
  }

  for(const [dog_id,list] of byDog){
    const dog = dogById.get(dog_id);
    const cust = custById.get(dog?.eigenaar_id); seenOwners.add(cust?.id);
    const remainingTotal = list.reduce((s,c)=>s+(c.remaining||0),0);
    const hadApproved = list.some(c=>c.approved===true);
    const hasApprovedRemainingValid = list.some(c=>c.approved===true && c.remaining>0 && c.valid_until && c.valid_until>=Date.now());
    const maxValidUntil = list.reduce((m,c)=>Math.max(m||0, c.valid_until||0), 0) || null;
    const dLeft = daysLeft(maxValidUntil);

    if(hasApprovedRemainingValid){
      pushSeg('active_member', cust, dog, {remaining_total:remainingTotal, valid_until:maxValidUntil, days_left:dLeft});
      if(dLeft!==null && dLeft>0 && dLeft<=14){ pushSeg('nearly_expiring', cust, dog, {remaining_total:remainingTotal, valid_until:maxValidUntil, days_left:dLeft}); }
    } else if (hadApproved && remainingTotal===0){
      pushSeg('completed', cust, dog, {remaining_total:0, valid_until:maxValidUntil, days_left:dLeft});
    } else {
      const hasPending = list.some(c=>c.approved!==true && c.remaining>0);
      if(hasPending){ pushSeg('pending_approval', cust, dog, {remaining_total:remainingTotal, valid_until:maxValidUntil, days_left:dLeft}); }
    }
  }

  customers.forEach(c=>{
    if(seenOwners.has(c.id)) return;
    const dogsOf = dogs.filter(d=>d.eigenaar_id===c.id);
    if(dogsOf.length>0){
      const hasAnyForCourse = rel.some(cr=> dogsOf.some(d=>d.id===cr.dog_id));
      if(!hasAnyForCourse){ pushSeg('inactive', c, null, {remaining_total:0, valid_until:null, days_left:null}); }
    }
  });

  return seg;
}
module.exports = { buildSegments };
