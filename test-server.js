const http = require('http');

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/',
  method: 'GET'
};

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  console.log(`Headers: ${JSON.stringify(res.headers)}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log(`Content length: ${data.length}`);
    if (data.length < 500) {
      console.log('Content preview:', data.substring(0, 200));
    } else {
      console.log('Content received (truncated):', data.substring(0, 200) + '...');
    }
  });
});

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
});

req.end();
