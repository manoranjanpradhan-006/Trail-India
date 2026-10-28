import app from './app.js';
import { config } from './config/index.js';
import { getDatabase, db } from './db/database.js';
import { runSeed } from './db/seed.js';

async function startServer() {
  try {
    // Initialize database (Neon PostgreSQL or SQLite fallback)
    await getDatabase();

    // Auto-seed if database is empty
    const userRow = await db.getOne('SELECT COUNT(*) as count FROM users');
    const userCount = Number(userRow?.count || 0);

    if (userCount === 0) {
      console.log('[Database] Database is empty. Running initial seed...');
      await runSeed();
    }

    const server = app.listen(config.port, () => {
      console.log(`===================================================`);
      console.log(`  Trail India API (Node.js & Express)              `);
      console.log(`  Database: ${db.isPostgres() ? 'Neon PostgreSQL' : 'Local SQLite'} `);
      console.log(`  URL: http://localhost:${config.port}                     `);
      console.log(`===================================================`);
    });

    const shutdown = () => {
      console.log('\n[Server] Shutting down gracefully...');
      server.close(() => {
        console.log('[Server] HTTP server closed.');
        process.exit(0);
      });
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  } catch (err) {
    console.error('[Server] Fatal startup error:', err);
    process.exit(1);
  }
}

startServer();
