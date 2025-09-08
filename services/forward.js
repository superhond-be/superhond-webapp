const http=require('http'); const https=require('https'); const {URL}=require('url');
function postJson(url,data,headers={}){ const u=new URL(url); const isHttps=u.protocol==='https:'; const body=JSON.stringify(data);
 const opts={hostname:u.hostname,port:u.port||(isHttps?443:80),path:u.pathname+(u.search||''),method:'POST',headers:{'Content-Type':'application/json','Content-Length':Buffer.byteLength(body),...headers}};
 const client=isHttps?https:http; return new Promise((resolve,reject)=>{ const req=client.request(opts,res=>{ let buf=''; res.on('data',c=>buf+=c); res.on('end',()=>resolve({status:res.statusCode,headers:res.headers,body:buf})); }); req.on('error',reject); req.write(body); req.end(); });}
module.exports={ postJson };