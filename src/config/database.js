import 'dotenv/config';
import { neon, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

// Configure for local development vs production
if (process.env.NODE_ENV === 'development') {
  // For local PostgreSQL, we'll still use neon driver but configure it
  // The DATABASE_URL format is compatible with both
} else {
  // When running against Neon Local (e.g. via Docker Compose),
  // configure the Neon serverless driver to talk to the local proxy
  // instead of the cloud HTTP endpoint.
  if (process.env.NEON_LOCAL === 'true') {
    neonConfig.fetchEndpoint =
      process.env.NEON_LOCAL_FETCH_ENDPOINT || 'http://neon-local:5432/sql';
    neonConfig.useSecureWebSocket = false;
    neonConfig.poolQueryViaFetch = true;
  }
}

const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql);

export { db, sql };
