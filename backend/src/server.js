import app from './app.js';
import { config } from './config/index.js';
import { getDatabase } from './db/database.js';
import { runSeed } from './db/seed.js';

function startServer() {
  try {
    // Initialize database
    const db = getDatabase();
    console.log(`[Database] SQLite connected at ${config.dbPath}`);

    // Auto-seed if database is empty
    const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
    if (userCount === 0) {
      console.log('[Database] Database is empty. Running initial seed...');
      runSeed();
    }

    const server = app.listen(config.port, () => {
      console.log(`===============================================`);
      console.log(`  Trail India Backend API (Express & Node.js)   `);
      console.log(`  Running on: http://localhost:${config.port}       `);
      console.log(`  Environment: ${config.env}                     `);
      console.log(`===============================================`);
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

