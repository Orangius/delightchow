import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import "dotenv/config";
// for migrations
async function makeMigration() {
    const migrationClient = postgres(process.env.DATABASE_URL, { max: 1 });
    await migrate(drizzle(migrationClient), {
        migrationsFolder: "./src/db/migrations"
    });
    await migrationClient.end();
}
makeMigration();
