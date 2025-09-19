
(function(){
  const FLAG='SH_SEEDED_v0172_DEMO';
  if(localStorage.getItem(FLAG)) return;

  function id(p){return p+Math.random().toString(36).slice(2,10)}
  // Customers with dogs
  const K1=id('K'), K2=id('K'), K3=id('K'), K4=id('K'), K5=id('K');
  const H1=id('H'), H2=id('H'), H3=id('H'), H4=id('H'), H5=id('H'), H6=id('H');
  const customers=[
    {id:K1, voornaam:'Jan', achternaam:'Janssens', email:'jan@example.com', telefoon:'0470 11 22 33', honden:[{id:H1, naam:'Bello', ras:'Labrador', geboorte:'2023-06-01', credits:5, geldigheid:5, notes:''}]},
    {id:K2, voornaam:'An', achternaam:'De Smet', email:'an@example.com', telefoon:'0486 44 55 66', honden:[{id:H2, naam:'Luna', ras:'Border Collie', geboorte:'2022-04-12', credits:3, geldigheid:3}]},
    {id:K3, voornaam:'Pieter', achternaam:'Peeters', email:'pieter@example.com', telefoon:'0491 77 88 99', honden:[{id:H3, naam:'Max', ras:'Beagle', geboorte:'2021-09-20', credits:2, geldigheid:6},{id:H4, naam:'Nala', ras:'Mopshond', geboorte:'2024-01-05', credits:0, geldigheid:6}]},
    {id:K4, voornaam:'Maria', achternaam:'García', email:'maria@example.com', telefoon:'+34 600 123 456', honden:[{id:H5, naam:'Coco', ras:'Podenco', geboorte:'2020-07-11', credits:4, geldigheid:4}]},
    {id:K5, voornaam:'Tom', achternaam:'Vermeer', email:'tom@example.com', telefoon:'0473 12 34 56', honden:[{id:H6, naam:'Rex', ras:'Mechelaar', geboorte:'2022-11-30', credits:1, geldigheid:2}]}
  ];
  localStorage.setItem('SH_CUSTOMERS', JSON.stringify(customers));

  // Classes with lessons (dates in Oct 2025)
  function les(d,t,loc,strip){return {id:id('L'), date:d, time:t, loc:loc, strippen:strip}}
  const C1=id('C'), C2=id('C'), C3=id('C'), C4=id('C'), C5=id('C');
  const classes=[
    {id:C1, naam:'Puppypack maandag', type:'Puppy', themas:'Socialisatie, Basis', cap:8, lessen:[
      les('2025-10-01','18:00','Retie',1),
      les('2025-10-08','18:00','Retie',1),
      les('2025-10-15','18:00','Retie',1)
    ]},
    {id:C2, naam:'Gevorderden woensdag', type:'Gevorderd', themas:'Focus, Impulscontrole', cap:10, lessen:[
      les('2025-10-02','19:00','Turnhout',2),
      les('2025-10-09','19:00','Turnhout',2),
      les('2025-10-16','19:00','Turnhout',1),
      les('2025-10-23','19:00','Turnhout',1)
    ]},
    {id:C3, naam:'Agility zaterdag', type:'Agility', themas:'Behendigheid', cap:12, lessen:[
      les('2025-10-04','10:00','Mol',1),
      les('2025-10-11','10:00','Mol',1),
      les('2025-10-18','10:00','Mol',2),
      les('2025-10-25','10:00','Mol',1),
      les('2025-11-01','10:00','Mol',1)
    ]},
    {id:C4, naam:'Social Walk donderdag', type:'Wandeling', themas:'Omgeving, Rust', cap:15, lessen:[
      les('2025-10-03','17:00','Kasterlee',1),
      les('2025-10-10','17:00','Kasterlee',1),
      les('2025-10-17','17:00','Kasterlee',1)
    ]},
    {id:C5, naam:'Workshop Recall', type:'Workshop', themas:'Terugkomen', cap:20, lessen:[
      les('2025-10-12','14:00','Geel',2)
    ]}
  ];
  classes.forEach(c=>c.startAuto = (c.lessen && c.lessen[0]) ? c.lessen[0].date : '');
  localStorage.setItem('SH_CLASSES', JSON.stringify(classes));

  // Enrollments (mix of phases)
  const E1=id('E'), E2=id('E'), E3=id('E'), E4=id('E'), E5=id('E'), E6=id('E');
  const enrolls=[
    {id:E1, klantId:K1, hondId:H1, classId:C1, start:classes[0].startAuto, validMonths:5, phase:'aanvraag'},         // Bello aanvraag
    {id:E2, klantId:K2, hondId:H2, classId:C1, start:classes[0].startAuto, validMonths:3, phase:'goedgekeurd'},     // Luna goedgekeurd
    {id:E3, klantId:K3, hondId:H3, classId:C3, start:classes[2].startAuto, validMonths:6, phase:'goedgekeurd'},     // Max goedgekeurd
    {id:E4, klantId:K3, hondId:H4, classId:C2, start:classes[1].startAuto, validMonths:6, phase:'wachtlijst'},      // Nala wachtlijst
    {id:E5, klantId:K4, hondId:H5, classId:C5, start:classes[4].startAuto, validMonths:4, phase:'goedgekeurd'},     // Coco goedgekeurd
    {id:E6, klantId:K5, hondId:H6, classId:C4, start:classes[3].startAuto, validMonths:2, phase:'geannuleerd'}      // Rex geannuleerd
  ];
  localStorage.setItem('SH_ENROLL', JSON.stringify(enrolls));

  // Reservations: pending/confirmed with credit effects (we won't mutate credits here, UI will on approve/confirm)
  const res = {};
  // Bello (aanvraag) -> pending 2 lessen in C1
  res[E1] = {}; res[E1][classes[0].lessen[0].id] = 'pending'; res[E1][classes[0].lessen[1].id] = 'pending';
  // Luna (goedgekeurd) -> confirmed 1ste les, pending 2de
  res[E2] = {}; res[E2][classes[0].lessen[0].id] = 'confirmed'; res[E2][classes[0].lessen[1].id] = 'pending';
  // Max (goedgekeurd) -> confirmed 2 lessen, pending 1 met kost 2
  res[E3] = {}; res[E3][classes[2].lessen[0].id] = 'confirmed'; res[E3][classes[2].lessen[1].id] = 'confirmed'; res[E3][classes[2].lessen[2].id] = 'pending'; // kost 2
  // Coco (goedgekeurd) -> confirmed workshop (kost 2)
  res[E5] = {}; res[E5][classes[4].lessen[0].id] = 'confirmed';
  localStorage.setItem('SH_RES', JSON.stringify(res));

  // Seed mail log a little
  const log=[
    {ts:new Date().toISOString(), type:'inschrijving', klantNaam:'Jan Janssens', hondNaam:'Bello', classNaam:'Puppypack maandag', details:'Fase: aanvraag'},
    {ts:new Date().toISOString(), type:'status-wijziging', klantNaam:'An De Smet', hondNaam:'Luna', classNaam:'Puppypack maandag', details:'Fase: goedgekeurd'}
  ];
  localStorage.setItem('SH_MAILLOG', JSON.stringify(log));

  localStorage.setItem(FLAG,'1');
})();