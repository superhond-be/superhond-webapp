
(function(){
  const FLAG='SH_SEEDED_v0178_DEMO';
  if(localStorage.getItem(FLAG)) return;
  function id(p){return p+Math.random().toString(36).slice(2,10)}
  // Customers + dogs
  const K1=id('K'), H1=id('H'), K2=id('K'), H2=id('H');
  const customers=[
    {id:K1,voornaam:'Jan',achternaam:'Janssens',honden:[{id:H1,naam:'Bello',ras:'Labrador',geboorte:'2023-06-01',credits:5,geldigheid:5,notes:'Vindt water leuk'}]},
    {id:K2,voornaam:'An',achternaam:'De Smet',honden:[{id:H2,naam:'Luna',ras:'Border Collie',geboorte:'2022-04-12',credits:3,geldigheid:3}]}
  ];
  localStorage.setItem('SH_CUSTOMERS', JSON.stringify(customers));

  // Classes + lessons
  function les(d,t,loc,strip){return {id:id('L'),date:d,time:t,loc:loc,strippen:strip}}
  const C1=id('C'), C2=id('C');
  const classes=[
    {id:C1,naam:'Puppypack maandag',type:'Puppy',themas:'Socialisatie',cap:8,lessen:[
      les('2025-10-01','18:00','Retie',1),
      les('2025-10-08','18:00','Retie',1),
      les('2025-10-15','18:00','Retie',1)
    ]},
    {id:C2,naam:'Basisgroep vrijdag',type:'Basis',themas:'Volgzaamheid',cap:3,lessen:[
      les('2025-10-05','18:00','Dessel',1),
      les('2025-10-12','18:00','Dessel',1)
    ]}
  ];
  classes.forEach(c=>c.startAuto=c.lessen[0].date);
  localStorage.setItem('SH_CLASSES', JSON.stringify(classes));

  // Enrollments
  const E1=id('E'), E2=id('E');
  const enrolls=[
    {id:E1,klantId:K1,hondId:H1,classId:C1,start:classes[0].startAuto,validMonths:5,phase:'goedgekeurd'},
    {id:E2,klantId:K2,hondId:H2,classId:C2,start:classes[1].startAuto,validMonths:3,phase:'aanvraag'}
  ];
  localStorage.setItem('SH_ENROLL', JSON.stringify(enrolls));

  // Reservations
  const res={};
  res[E1] = {}; res[E1][classes[0].lessen[0].id]='confirmed';
  res[E2] = {}; res[E2][classes[1].lessen[0].id]='pending';
  localStorage.setItem('SH_RES', JSON.stringify(res));

  localStorage.setItem(FLAG,'1');
})();