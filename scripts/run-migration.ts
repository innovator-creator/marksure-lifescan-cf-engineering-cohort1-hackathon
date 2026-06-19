import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function runMigration() {
  console.log('Running migration 002_add_alert_types...');

  try {
    // Try adding 'new_product' to alert_type enum
    const { error: err1 } = await supabase.rpc('exec_sql' as never, {
      sql: "DO $$ BEGIN ALTER TYPE alert_type ADD VALUE IF NOT EXISTS 'new_product'; EXCEPTION WHEN duplicate_object THEN NULL; END $$;",
    } as never);

    if (err1) {
      // Fallback: try direct query via the REST API
      console.log('RPC method not available, trying alternative...');
      console.log('⚠️  Please run this SQL manually in the Supabase SQL Editor:');
      console.log('');
      console.log('ALTER TYPE alert_type ADD VALUE IF NOT EXISTS \'new_product\';');
      console.log('ALTER TYPE alert_type ADD VALUE IF NOT EXISTS \'comment\';');
      console.log('');
      console.log('Go to: https://supabase.com/dashboard/project/excgjidcuqqorgffmgox/sql/new');
    } else {
      console.log('✅ Migration completed successfully');
    }
  } catch (error) {
    console.log('⚠️  Could not run migration automatically.');
    console.log('Please run this SQL manually in the Supabase SQL Editor:');
    console.log('');
    console.log('ALTER TYPE alert_type ADD VALUE IF NOT EXISTS \'new_product\';');
    console.log('ALTER TYPE alert_type ADD VALUE IF NOT EXISTS \'comment\';');
    console.log('');
    console.log('Go to: https://supabase.com/dashboard/project/excgjidcuqqorgffmgox/sql/new');
  }
}

runMigration();
