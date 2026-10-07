import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import ws from 'ws';
import pg from 'pg';

// Load server environment
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://nkjldavltbmpbslxbcsd.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const DATABASE_URL = process.env.DATABASE_URL || '';
const SUPABASE_DB_PASSWORD = process.env.SUPABASE_DB_PASSWORD || '';

// Extract project ref from URL (e.g. nkjldavltbmpbslxbcsd)
const projectRefMatch = SUPABASE_URL.match(/https:\/\/([a-z0-9-]+)\.supabase\.co/);
const projectRef = projectRefMatch ? projectRefMatch[1] : 'nkjldavltbmpbslxbcsd';

const MIGRATION_PATH = path.resolve(process.cwd(), '..', 'supabase', 'migrations', '001_initial_schema.sql');

async function runMigration() {
  console.log('================================================================');
  console.log('🚀 HealTrack AI — Supabase Cloud Database & Storage Migration');
  console.log(`🌐 Project URL: ${SUPABASE_URL}`);
  console.log(`🔑 Project Ref: ${projectRef}`);
  console.log('================================================================\n');

  if (!SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ Error: SUPABASE_SERVICE_ROLE_KEY is required in server/.env');
    process.exit(1);
  }

  // Initialize Supabase admin client
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
    realtime: { transport: ws as any }
  });

  // --------------------------------------------------------------------------
  // Step 1: Storage Bucket Provisioning
  // --------------------------------------------------------------------------
  console.log('📦 [Step 1/3] Verifying / Provisioning Supabase Storage Buckets...');
  try {
    const { data: buckets, error: listErr } = await supabase.storage.listBuckets();
    if (listErr) {
      console.warn('⚠️  Could not list buckets:', listErr.message);
    } else {
      const exists = buckets?.some((b) => b.id === 'wound-records');
      if (exists) {
        console.log('✅ Bucket "wound-records" already exists on Supabase Cloud.');
      } else {
        const { data: created, error: createErr } = await supabase.storage.createBucket('wound-records', {
          public: true,
          fileSizeLimit: 10485760 // 10MB
        });
        if (createErr) {
          console.warn('⚠️  Bucket creation notice:', createErr.message);
        } else {
          console.log('✅ Successfully created storage bucket "wound-records" on Supabase Cloud!');
        }
      }
    }
  } catch (err: any) {
    console.warn('⚠️  Storage bucket check error:', err.message);
  }

  // --------------------------------------------------------------------------
  // Step 2: Read Migration SQL File
  // --------------------------------------------------------------------------
  console.log('\n📄 [Step 2/3] Loading Migration File: 001_initial_schema.sql...');
  if (!fs.existsSync(MIGRATION_PATH)) {
    console.error(`❌ Migration file not found at: ${MIGRATION_PATH}`);
    process.exit(1);
  }
  const sqlContent = fs.readFileSync(MIGRATION_PATH, 'utf-8');
  console.log(`✅ Loaded migration script (${Math.round(sqlContent.length / 1024)} KB)`);

  // --------------------------------------------------------------------------
  // Step 3: Apply Schema to PostgreSQL
  // --------------------------------------------------------------------------
  console.log('\n⚙️  [Step 3/3] Applying PostgreSQL Schema & RLS Policies...');

  let appliedViaDirectPg = false;
  const connectionString =
    DATABASE_URL ||
    (SUPABASE_DB_PASSWORD
      ? `postgres://postgres.${projectRef}:${encodeURIComponent(SUPABASE_DB_PASSWORD)}@aws-0-ap-south-1.pooler.supabase.com:6543/postgres`
      : '');

  if (connectionString) {
    console.log('🔌 Connecting directly to Supabase PostgreSQL via connection string...');
    const client = new pg.Client({
      connectionString,
      ssl: { rejectUnauthorized: false }
    });

    try {
      await client.connect();
      console.log('⚡ Connected to Supabase PostgreSQL! Executing migration script...');
      await client.query(sqlContent);
      console.log('✅ All SQL tables, enums, triggers, RLS policies, and seed data executed successfully!');
      appliedViaDirectPg = true;
    } catch (pgErr: any) {
      console.error('❌ PostgreSQL direct execution error:', pgErr.message);
    } finally {
      await client.end().catch(() => {});
    }
  }

  // Verify status via Supabase Client
  const { data: profiles, error: checkErr } = await supabase.from('profiles').select('id, full_name, role').limit(5);

  if (!checkErr && profiles) {
    console.log('\n🎉 SUCCESS: Supabase Cloud Database is Fully Initialized & Live!');
    console.log(`✅ Table "profiles" active (${profiles.length} sample records verified):`);
    profiles.forEach((p) => console.log(`   - [${p.role.toUpperCase()}] ${p.full_name} (${p.id})`));
  } else {
    if (!appliedViaDirectPg) {
      console.log('\n================================================================');
      console.log('📋 SUPABASE CLOUD SQL EDITOR INSTRUCTIONS (1-CLICK SETUP)');
      console.log('================================================================');
      console.log('Supabase Cloud protects DDL statements (CREATE TABLE / RLS) so they');
      console.log('must be executed in the Supabase Dashboard or via a direct DB connection:');
      console.log('');
      console.log(`1. Open the Supabase Cloud SQL Editor for your project:`);
      console.log(`   👉 https://supabase.com/dashboard/project/${projectRef}/sql/new`);
      console.log('');
      console.log(`2. Open the file in your workspace:`);
      console.log(`   👉 ${MIGRATION_PATH}`);
      console.log('');
      console.log(`3. Copy all contents, paste into the SQL editor, and click "Run".`);
      console.log('');
      console.log(`Optionally, to run automated CLI migrations, add your DB password to server/.env:`);
      console.log(`   DATABASE_URL=postgres://postgres.${projectRef}:[YOUR_PASSWORD]@aws-0-ap-south-1.pooler.supabase.com:6543/postgres`);
      console.log('   Then re-run: npm run db:migrate');
      console.log('================================================================\n');
    }
  }

  console.log('✅ Migration process finished.\n');
}

runMigration().catch((err) => {
  console.error('Fatal migration error:', err);
  process.exit(1);
});
