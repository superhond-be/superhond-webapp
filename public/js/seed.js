
(function(){
  const FLAG='SH_SEEDED_v0174_DEMO';
  if(localStorage.getItem(FLAG)) return;
  function id(p){return p+Math.random().toString(36).slice(2,10)}

  // Klanten met honden
  const K1=id('K'),H1=id('H'),K2=id('K'),H2=id('H'),K3=id('K'),H3=id('H'),K4=id('K'),H4=id('H');
  const customers=[
    {id:K1,voornaam:'Jan',achternaam:'Janssens',honden:[{id:H1,naam:'Bello',credits:5, geldigheid:5}]},
    {id:K2,voornaam:'An',achternaam:'De Smet',honden:[{id:H2,naam:'Luna',credits:3, geldigheid:3}]},
    {id:K3,voornaam:'Pieter',achternaam:'Peeters',honden:[{id:H3,naam:'Max',credits:2, geldigheid:6}]},
    {id:K4,voornaam:'Tom',achternaam:'Vermeer',honden:[{id:H4,naam:'Rex',credits:1, geldigheid:2}]}
  ];
  localStorage.setItem('SH_CUSTOMERS',JSON.stringify(customers));

  // Klassen (incl. extra volzet met wachtlijst)
  function les(d,t,loc,strip){return {id:id('L'),date:d,time:t,loc:loc,strippen:strip}}
  const C1=id('C'),Cwait=id('C');
  const classes=[
    {id:C1,naam:'Puppypack maandag',type:'Puppy',themas:'Socialisatie',cap:8,lessen:[
      les('2025-10-01','18:00','Retie',1),
      les('2025-10-08','18:00','Retie',1)
    ]},
    {id:Cwait,naam:'Basisgroep vrijdag',type:'Basis',themas:'Volgzaamheid',cap:3,lessen:[
      les('2025-10-05','18:00','Dessel',1),
      les('2025-10-12','18:00','Dessel',1)
    ]}
  ];
  classes.forEach(c=>c.startAuto=(c.lessen&&c.lessen[0])?c.lessen[0].date:'');
  localStorage.setItem('SH_CLASSES',JSON.stringify(classes));

  // Inschrijvingen (incl. wachtlijst)
  const enrolls=[
    {id:id('E'),klantId:K1,hondId:H1,classId:C1,start:classes[0].startAuto,validMonths:5,phase:'aanvraag'},
    {id:id('E'),klantId:K2,hondId:H2,classId:C1,start:classes[0].startAuto,validMonths:3,phase:'goedgekeurd'},
    {id:id('E'),klantId:K3,hondId:H3,classId:Cwait,start:classes[1].startAuto,validMonths:6,phase:'goedgekeurd'},
    {id:id('E'),klantId:K2,hondId:H2,classId:Cwait,start:classes[1].startAuto,validMonths:3,phase:'goedgekeurd'},
    {id:id('E'),klantId:K1,hondId:H1,classId:Cwait,start:classes[1].startAuto,validMonths:5,phase:'goedgekeurd'},
    {id:id('E'),klantId:K4,hondId:H4,classId:Cwait,start:classes[1].startAuto,validMonths:2,phase:'wachtlijst'}
  ];
  localStorage.setItem('SH_ENROLL',JSON.stringify(enrolls));

  localStorage.setItem(FLAG,'1');
})();