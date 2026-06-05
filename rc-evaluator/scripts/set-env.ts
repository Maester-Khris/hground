import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, '../.env.production');

const content = `VITE_API_HOST=${process.env.VITE_API_HOST || ''}
VITE_PYTHON_SERVICE_HOST=${process.env.VITE_PYTHON_SERVICE_HOST || ''}
`;

fs.writeFileSync(envPath, content);

console.log('Env injected for Vite build:');
console.log('  VITE_API_HOST:', process.env.VITE_API_HOST || 'MISSING');
console.log('  VITE_PYTHON_SERVICE_HOST:', process.env.VITE_PYTHON_SERVICE_HOST || 'MISSING');