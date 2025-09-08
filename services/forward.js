const http = require('http');
const https = require('https');
const { URL } = require('url');
const logger = require('./logger');

function forwardJson(targetUrl, payload, headers={}) {
  const u = new URL(targetUrl);
  const isHttps = u.protocol === 'https:';
  const body = JSON.stringify(payload);
  const opts = {
    hostname: u.hostname,
    port: u.port || (isHttps ? 443 : 80),
    path: u.pathname + (u.search || ''),
    method: 'POST',
    headers: {
      'Content-Type':'application/json',
      'Content-Length': Buffer.byteLength(body),
      ...headers
    }
  };
  const client = isHttps ? https : http;
  return new Promise((resolve, reject) => {
    const req = client.request(opts, res => {
      let data='';
      res.on('data', c => data += c);
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: data }));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

module.exports = { forwardJson };
