import 'dotenv/config';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { pool } from '../config/db.js';

const here = dirname(fileURLToPath(import.meta.url));
const schemaPath = resolve(here, '../sql/schema.sql');

try {
  const schema = await readFile(schemaPath, 'utf8');
  await pool.query(schema);
  console.log('Database schema applied successfully. Refresh public → Tables in pgAdmin.');
} catch (error) {
  console.error('Could not apply the database schema:', error.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
