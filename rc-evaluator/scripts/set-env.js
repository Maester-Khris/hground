const fs = require('fs');
const path = require('path');

const envPath = path.resolve(__dirname, '../.env.production');

const content = `VITE_API_HOST=${process.env.VITE_API_HOST || ''}
VITE_PYTHON_SERVICE_HOST=${process.env.VITE_PYTHON_SERVICE_HOST || ''}
`;

fs.writeFileSync(envPath, content);

console.log('Env injected for Vite build:');
console.log('  VITE_API_HOST:', process.env.VITE_API_HOST || 'MISSING');
console.log('  VITE_PYTHON_SERVICE_HOST:', process.env.VITE_PYTHON_SERVICE_HOST || 'MISSING');