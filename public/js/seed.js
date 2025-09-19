
(function(){
  const FLAG='SH_SEEDED_v0179_BASE'; if(localStorage.getItem(FLAG)) return;
  const K1='K1',H1='H1',C1='C1';
  const customers=[{id:K1,voornaam:'Jan',achternaam:'Janssens',honden:[{id:H1,naam:'Bello',ras:'Labrador',credits:5,geldigheid:5}]}];
  localStorage.setItem('SH_CUSTOMERS', JSON.stringify(customers));
  const classes=[{id:C1,naam:'Puppypack maandag',type:'Puppy',cap:8,lessen:[{id:'L1',date:'2025-10-01',time:'18:00',loc:'Retie',strippen:1}]}];
  localStorage.setItem('SH_CLASSES', JSON.stringify(classes));
  localStorage.setItem(FLAG,'1');
})();