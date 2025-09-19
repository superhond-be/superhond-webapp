
(function(){
  const FLAG='SH_SEEDED_v0173_DEMO';
  if(localStorage.getItem(FLAG)) return;
  function id(p){return p+Math.random().toString(36).slice(2,10)}
  // basis klanten/honden/klassen simulatie
  const K1=id('K'),H1=id('H'),K2=id('K'),H2=id('H'),K3=id('K'),H3=id('H'),K4=id('K'),H4=id('H');
  const customers=[
    {id:K1,voornaam:'Test1',achternaam:'Demo',honden:[{id:H1,naam:'Dog1',credits:2, geldigheid:5}]},
    {id:K2,voornaam:'Test2',achternaam:'Demo',honden:[{id:H2,naam:'Dog2',credits:2, geldigheid:5}]},
    {id:K3,voornaam:'Test3',achternaam:'Demo',honden:[{id:H3,naam:'Dog3',credits:2, geldigheid:5}]},
    {id:K4,voornaam:'Test4',achternaam:'Demo',honden:[{id:H4,naam:'Dog4',credits:2, geldigheid:5}]}
  ];
  localStorage.setItem('SH_CUSTOMERS',JSON.stringify(customers));

  const Cwait=id('C');
  const waitClass={id:Cwait,naam:'Basisgroep vrijdag',type:'Basis',themas:'Volgzaamheid',cap:3,
    lessen:[{id:id('L'),date:'2025-10-05',time:'18:00',loc:'Dessel',strippen:1},{id:id('L'),date:'2025-10-12',time:'18:00',loc:'Dessel',strippen:1}]};
  waitClass.startAuto=waitClass.lessen[0].date;
  localStorage.setItem('SH_CLASSES',JSON.stringify([waitClass]));

  const enrolls=[
    {id:id('E'),klantId:K1,hondId:H1,classId:Cwait,start:waitClass.startAuto,validMonths:5,phase:'goedgekeurd'},
    {id:id('E'),klantId:K2,hondId:H2,classId:Cwait,start:waitClass.startAuto,validMonths:5,phase:'goedgekeurd'},
    {id:id('E'),klantId:K3,hondId:H3,classId:Cwait,start:waitClass.startAuto,validMonths:5,phase:'goedgekeurd'},
    {id:id('E'),klantId:K4,hondId:H4,classId:Cwait,start:waitClass.startAuto,validMonths:5,phase:'wachtlijst'}
  ];
  localStorage.setItem('SH_ENROLL',JSON.stringify(enrolls));

  localStorage.setItem(FLAG,'1');
})();