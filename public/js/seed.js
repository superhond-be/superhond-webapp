(function(){
  const FLAG='SH_SEEDED_v0181'; if(localStorage.getItem(FLAG)) return;
  function id(p){return p+Math.random().toString(36).slice(2,10)}
  const K1=id('K'),K2=id('K'),K3=id('K');
  const H1=id('H'),H2=id('H'),H3=id('H');
  const customers=[
    {id:K1,voornaam:'Jan',achternaam:'Janssens',honden:[{id:H1,naam:'Bello',credits:5,geldigheid:5}]},
    {id:K2,voornaam:'Marie',achternaam:'Peeters',honden:[{id:H2,naam:'Luna',credits:3,geldigheid:4}]},
    {id:K3,voornaam:'Tom',achternaam:'Vermeulen',honden:[{id:H3,naam:'Rex',credits:7,geldigheid:6}]}
  ];
  localStorage.setItem('SH_CUSTOMERS', JSON.stringify(customers));
  function les(d,t,loc,theme,trainer,price){return {id:id('L'),date:d,time:t,loc,theme,trainer,price}}
  const C1=id('C'),C2=id('C');
  const classes=[
    {id:C1,naam:'Puppypack maandag',type:'Puppy',cap:2,thema:'Socialisatie',trainer:'Sarah',prijs:15,lessen:[
      les('2025-10-01','18:00','Retie','Intro','Sarah',15),
      les('2025-10-08','18:00','Retie','Leiband','Sarah',15)
    ]},
    {id:C2,naam:'Agility woensdag',type:'Agility',cap:3,thema:'Behendigheid',trainer:'Tom',prijs:20,lessen:[
      les('2025-10-02','19:00','Dessel','Intro','Tom',20),
      les('2025-10-09','19:00','Dessel','Sprongen','Tom',20)
    ]}
  ];
  localStorage.setItem('SH_CLASSES', JSON.stringify(classes));
  const enrolls=[
    {id:id('E'),klantId:K1,hondId:H1,classId:C1,phase:'goedgekeurd'},
    {id:id('E'),klantId:K2,hondId:H2,classId:C1,phase:'aanvraag'},
    {id:id('E'),klantId:K3,hondId:H3,classId:C2,phase:'goedgekeurd'}
  ];
  localStorage.setItem('SH_ENROLL', JSON.stringify(enrolls));
  const res={};
  res[enrolls[0].id]={[classes[0].lessen[0].id]:'confirmed'};
  res[enrolls[1].id]={[classes[0].lessen[0].id]:'pending'};
  res[enrolls[2].id]={[classes[1].lessen[0].id]:'cancelled'};
  localStorage.setItem('SH_RES', JSON.stringify(res));
  localStorage.setItem(FLAG,'1');
})();