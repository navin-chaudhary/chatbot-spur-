import { initializeDatabase, closeDatabase } from './database';

async function migrate() {
  try {
    await initializeDatabase();
    console.log('Database migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await closeDatabase();
  }
}

migrate();
