
window.SH = {
  today: () => { const d=new Date(); return d.toISOString().split('T')[0]; },
  customers:[
    { id:'c1', name:'An De Smet', email:'an@somedomain.be', phone:'+32 478 12 34 56',
      dogs:[ {id:'d1', name:'Loki'} ]
    },
    { id:'c2', name:'Tom Janssens', email:'tom@ex.be', phone:'+32 495 22 11 00',
      dogs:[ {id:'d2', name:'Nala'}, {id:'d3', name:'Rex'} ]
    }
  ],
  bookings:[
    { id:'b1', dogId:'d1', customerId:'c1', title:'Puppy Pack — Instap', date:'2025-09-17' },
    { id:'b2', dogId:'d2', customerId:'c2', title:'Basisgroep week 2', date:'2025-09-18' }
  ],
  cards:[
    { id:'s1', dogId:'d1', customerId:'c1', type:'Puppy Pack 10', total:10, used:3 },
    { id:'s2', dogId:'d2', customerId:'c2', type:'Basis 8', total:8, used:5 }
  ],
  archived:{ customers:[], dogs:[], cards:[] }
};
