import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { db } from '../lib/db';
import { config } from 'dotenv';
import path from 'path';

config();

async function runMigrations() {
  try {
    console.log('Running migrations...');
    
    const migrationsFolder = path.join(__dirname, '../../drizzle');
    await migrate(db, { migrationsFolder });
    
    console.log('✅ Migrations completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigrations();
