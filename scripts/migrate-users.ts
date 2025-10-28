/**
 * User Migration Script for Web3 Authentication
 * 
 * This script helps migrate existing email-only users to the new
 * wallet authentication system.
 * 
 * Usage:
 *   ts-node scripts/migrate-users.ts
 * 
 * What it does:
 * 1. Identifies users without wallet addresses
 * 2. Flags them for wallet connection requirement
 * 3. Generates migration report
 */

import { createClient } from '@supabase/supabase-js';

// Load environment variables
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing required environment variables:');
  console.error('   - NEXT_PUBLIC_SUPABASE_URL');
  console.error('   - SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

interface MigrationReport {
  totalUsers: number;
  usersWithWallet: number;
  usersWithoutWallet: number;
  flaggedUsers: number;
  errors: string[];
}

/**
 * Main migration function
 */
async function migrateUsers() {
  console.log('🚀 Starting user migration to Web3 authentication...\n');

  const report: MigrationReport = {
    totalUsers: 0,
    usersWithWallet: 0,
    usersWithoutWallet: 0,
    flaggedUsers: 0,
    errors: [],
  };

  try {
    // Step 1: Get all users
    console.log('📊 Step 1: Fetching all users...');
    const { data: users, error: fetchError } = await supabase
      .from('users')
      .select('id, email, display_name, wallet_address, created_at');

    if (fetchError) {
      console.error('❌ Error fetching users:', fetchError);
      process.exit(1);
    }

    report.totalUsers = users?.length || 0;
    console.log(`   Found ${report.totalUsers} total users\n`);

    if (!users || users.length === 0) {
      console.log('✅ No users to migrate. Migration complete!');
      return report;
    }

    // Step 2: Analyze users
    console.log('🔍 Step 2: Analyzing users...');
    const usersWithoutWallet = users.filter(u => !u.wallet_address);
    const usersWithWallet = users.filter(u => u.wallet_address);

    report.usersWithWallet = usersWithWallet.length;
    report.usersWithoutWallet = usersWithoutWallet.length;

    console.log(`   Users with wallet: ${report.usersWithWallet}`);
    console.log(`   Users without wallet: ${report.usersWithoutWallet}\n`);

    // Step 3: Flag users needing wallet connection
    if (usersWithoutWallet.length > 0) {
      console.log('🏴 Step 3: Flagging users for wallet connection...');
      
      for (const user of usersWithoutWallet) {
        try {
          // Add a metadata flag (you may need to add a column for this)
          // For now, we'll just log them
          console.log(`   📧 ${user.email} - needs wallet connection`);
          report.flaggedUsers++;
        } catch (error: any) {
          const errorMsg = `Failed to flag user ${user.email}: ${error.message}`;
          report.errors.push(errorMsg);
          console.error(`   ❌ ${errorMsg}`);
        }
      }
      console.log(`   Flagged ${report.flaggedUsers} users\n`);
    }

    // Step 4: Generate migration CSV for manual processing
    console.log('📝 Step 4: Generating migration report...');
    generateCSVReport(usersWithoutWallet);

    // Step 5: Display summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 MIGRATION SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total Users:              ${report.totalUsers}`);
    console.log(`Users with Wallet:        ${report.usersWithWallet} ✅`);
    console.log(`Users without Wallet:     ${report.usersWithoutWallet} ⚠️`);
    console.log(`Flagged for Migration:    ${report.flaggedUsers} 🏴`);
    console.log(`Errors:                   ${report.errors.length}`);
    console.log('='.repeat(60) + '\n');

    if (report.usersWithoutWallet > 0) {
      console.log('⚠️  NEXT STEPS:');
      console.log('   1. Review migration_report.csv');
      console.log('   2. Contact users to connect wallets');
      console.log('   3. Users can connect wallets on next login');
      console.log('   4. Old email-only auth will be deprecated\n');
    }

    if (report.errors.length > 0) {
      console.log('❌ ERRORS ENCOUNTERED:');
      report.errors.forEach(err => console.log(`   - ${err}`));
      console.log('');
    }

    console.log('✅ Migration analysis complete!');
    return report;

  } catch (error: any) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

/**
 * Generate CSV report of users needing migration
 */
function generateCSVReport(users: any[]) {
  if (users.length === 0) {
    console.log('   No users to report\n');
    return;
  }

  const fs = require('fs');
  const csv = [
    'Email,Display Name,Created At,Status',
    ...users.map(u => 
      `${u.email},"${u.display_name}",${u.created_at},Needs Wallet`
    )
  ].join('\n');

  fs.writeFileSync('migration_report.csv', csv);
  console.log('   ✅ Report saved to migration_report.csv\n');
}

/**
 * Add wallet_required flag to users table (optional)
 * Run this if you want to add a database flag
 */
async function addWalletRequiredColumn() {
  console.log('🔧 Adding wallet_required column to users table...');
  
  // This would be a Supabase migration SQL
  const sql = `
    -- Add wallet_required column if it doesn't exist
    ALTER TABLE users 
    ADD COLUMN IF NOT EXISTS wallet_required BOOLEAN DEFAULT false;

    -- Flag existing users without wallets
    UPDATE users 
    SET wallet_required = true 
    WHERE wallet_address IS NULL;
  `;

  console.log('SQL to run in Supabase:');
  console.log(sql);
  console.log('\nRun this SQL manually in Supabase SQL Editor\n');
}

/**
 * Send email notifications to users (optional)
 * Requires email service setup
 */
async function notifyUsers(users: any[]) {
  console.log(`📧 Would notify ${users.length} users about wallet requirement`);
  console.log('   Email service not implemented - skipping\n');
  
  // TODO: Implement email notification
  // Example:
  // for (const user of users) {
  //   await sendEmail({
  //     to: user.email,
  //     subject: 'Action Required: Connect Your Wallet',
  //     body: `Hi ${user.display_name}, ...`
  //   });
  // }
}

// Run migration
if (require.main === module) {
  migrateUsers()
    .then(() => {
      console.log('\n✅ Migration script completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Migration script failed:', error);
      process.exit(1);
    });
}

export { migrateUsers, addWalletRequiredColumn, notifyUsers };
