const fs = require('fs');
const path = require('path');

const logFile = path.join(__dirname, 'api-calls.log');

function logAPICall(endpoint, method, data = {}) {
  const timestamp = new Date().toISOString();
  const logEntry = `${timestamp} - ${method} ${endpoint} - ${JSON.stringify(data)}\n`;
  
  fs.appendFileSync(logFile, logEntry);
  console.log(`API CALL LOGGED: ${method} ${endpoint}`);
}

module.exports = { logAPICall };