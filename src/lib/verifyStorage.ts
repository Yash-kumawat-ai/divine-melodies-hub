/**
 * Storage Verification Test Script
 * Run this in the browser console or as a test file
 * 
 * Usage:
 * 1. Copy this file to src/lib/verifyStorage.ts
 * 2. Import in your component: import { verifyAllConnections } from '@/lib/verifyStorage'
 * 3. Call in console: verifyAllConnections()
 */

import { supabase } from '@/integrations/supabase/client';
import { uploadToCloudinary } from '@/lib/cloudinary';

export interface VerificationResult {
  component: string;
  status: 'success' | 'error' | 'warning';
  message: string;
  details?: any;
}

/**
 * Verify Supabase Configuration
 */
export async function verifySub(): Promise<VerificationResult> {
  try {
    const url = import.meta.env.VITE_SUPABASE_URL;
    const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

    if (!url || !key) {
      return {
        component: 'Supabase Config',
        status: 'error',
        message: 'Missing Supabase credentials in .env.local',
        details: { hasUrl: !!url, hasKey: !!key }
      };
    }

    // Test connection
    const { data, error } = await supabase.from('user_profiles').select('count').limit(1);
    
    if (error) {
      return {
        component: 'Supabase Connection',
        status: 'error',
        message: `Failed to connect: ${error.message}`,
        details: error
      };
    }

    return {
      component: 'Supabase Connection',
      status: 'success',
      message: '✅ Connected to Supabase database',
      details: { url: url.substring(0, 20) + '...', hasKey: true }
    };
  } catch (error: any) {
    return {
      component: 'Supabase Config',
      status: 'error',
      message: error.message,
      details: error
    };
  }
}

/**
 * Verify Cloudinary Configuration
 */
export async function verifyCloudinary(): Promise<VerificationResult> {
  try {
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;

    if (!cloudName) {
      return {
        component: 'Cloudinary Config',
        status: 'error',
        message: 'Missing VITE_CLOUDINARY_CLOUD_NAME in .env.local',
        details: { hasCloudName: !!cloudName }
      };
    }

    // Probe secure upload edge function and treat expected validation/auth failures as reachable.
    const { error } = await supabase.functions.invoke('upload-lyric-image', {
      body: new FormData(),
    });

    if (error) {
      const message = String(error.message || '').toLowerCase();
      const reachable =
        message.includes('unauthorized') ||
        message.includes('file is required') ||
        message.includes('invalid upload type') ||
        message.includes('400') ||
        message.includes('401');

      if (!reachable) {
        return {
          component: 'Cloudinary Connection',
          status: 'error',
          message: `Secure upload gateway failed: ${error.message}`,
          details: error,
        };
      }
    }

    return {
      component: 'Cloudinary Connection',
      status: 'success',
      message: '✅ Secure upload gateway is configured',
      details: { cloudName, gateway: 'upload-lyric-image' }
    };
  } catch (error: any) {
    return {
      component: 'Cloudinary Config',
      status: 'error',
      message: error.message,
      details: error
    };
  }
}

async function createOnePixelPngBlob(): Promise<Blob | null> {
  return await new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    canvas.toBlob((blob) => resolve(blob), 'image/png');
  });
}

/**
 * Sample Image Upload (requires user logged in)
 */
export async function testImageUpload(): Promise<VerificationResult> {
  try {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user) {
      return {
        component: 'Image Upload Test',
        status: 'warning',
        message: 'Cannot test - user not logged in',
        details: { requiresAuth: true }
      };
    }

    const blob = await createOnePixelPngBlob();
    if (!blob) {
      return {
        component: 'Image Upload Test',
        status: 'error',
        message: 'Failed to generate test image blob',
        details: {},
      };
    }

    const file = new File([blob], 'test.png', { type: 'image/png' });
    const url = await uploadToCloudinary(file, 'lyrics');

    return {
      component: 'Image Upload Test',
      status: 'success',
      message: '✅ Image uploaded successfully via secure gateway',
      details: { url, size: blob.size },
    };
  } catch (error: any) {
    return {
      component: 'Image Upload Test',
      status: 'error',
      message: error.message,
      details: error
    };
  }
}

/**
 * Verify Supabase Tables Exist
 */
export async function verifyTables(): Promise<VerificationResult[]> {
  const results: VerificationResult[] = [];
  const requiredTables = ['user_profiles', 'user_uploads', 'bhajan_ratings'];

  for (const table of requiredTables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('count')
        .limit(1);

      if (error && error.code === 'PGRST116') {
        results.push({
          component: `Table: ${table}`,
          status: 'warning',
          message: `Table exists but empty`,
          details: { table }
        });
      } else if (error) {
        results.push({
          component: `Table: ${table}`,
          status: 'error',
          message: `Table not found: ${error.message}`,
          details: error
        });
      } else {
        results.push({
          component: `Table: ${table}`,
          status: 'success',
          message: `✅ Table exists and is accessible`,
          details: { table, hasData: !!data }
        });
      }
    } catch (error: any) {
      results.push({
        component: `Table: ${table}`,
        status: 'error',
        message: error.message,
        details: error
      });
    }
  }

  return results;
}

/**
 * Check Current User Authentication
 */
export async function verifyAuth(): Promise<VerificationResult> {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) {
      return {
        component: 'Authentication',
        status: 'error',
        message: `Auth error: ${error.message}`,
        details: error
      };
    }

    if (!session?.user) {
      return {
        component: 'Authentication',
        status: 'warning',
        message: '⚠️ No user logged in (expected for public pages)',
        details: { user: null }
      };
    }

    return {
      component: 'Authentication',
      status: 'success',
      message: `✅ Logged in as ${session.user.email}`,
      details: { userId: session.user.id, email: session.user.email }
    };
  } catch (error: any) {
    return {
      component: 'Authentication',
      status: 'error',
      message: error.message,
      details: error
    };
  }
}

/**
 * Count Data in Each Table
 */
export async function getDataCounts(): Promise<VerificationResult[]> {
  const results: VerificationResult[] = [];
  const tables = ['user_profiles', 'user_uploads'];

  for (const table of tables) {
    try {
      const { count, error } = await supabase
        .from(table)
        .select('id', { count: 'exact', head: true });

      if (error) {
        results.push({
          component: `Count: ${table}`,
          status: 'error',
          message: `Failed to count: ${error.message}`,
          details: error
        });
      } else {
        results.push({
          component: `Count: ${table}`,
          status: 'success',
          message: `${count} records found`,
          details: { table, count }
        });
      }
    } catch (error: any) {
      results.push({
        component: `Count: ${table}`,
        status: 'error',
        message: error.message,
        details: error
      });
    }
  }

  return results;
}

/**
 * Run All Verification Tests
 */
export async function verifyAllConnections(): Promise<void> {
  console.clear();
  console.log('🔍 Starting Storage Verification Tests...\n');

  const allResults: VerificationResult[] = [];

  // Test 1: Configuration
  console.log('1️⃣ Testing Supabase Configuration...');
  const subResult = await verifySub();
  allResults.push(subResult);
  logResult(subResult);

  console.log('\n2️⃣ Testing Cloudinary Configuration...');
  const cloudResult = await verifyCloudinary();
  allResults.push(cloudResult);
  logResult(cloudResult);

  // Test 2: Tables
  console.log('\n3️⃣ Checking Database Tables...');
  const tableResults = await verifyTables();
  allResults.push(...tableResults);
  tableResults.forEach(logResult);

  // Test 3: Authentication
  console.log('\n4️⃣ Checking Authentication...');
  const authResult = await verifyAuth();
  allResults.push(authResult);
  logResult(authResult);

  // Test 4: Data Counts
  console.log('\n5️⃣ Data Statistics...');
  const countResults = await getDataCounts();
  allResults.push(...countResults);
  countResults.forEach(logResult);

  // Summary
  console.log('\n' + '='.repeat(60));
  const successCount = allResults.filter(r => r.status === 'success').length;
  const errorCount = allResults.filter(r => r.status === 'error').length;
  const warningCount = allResults.filter(r => r.status === 'warning').length;

  console.log(`\n📊 SUMMARY:`);
  console.log(`✅ Success: ${successCount}`);
  console.log(`⚠️ Warnings: ${warningCount}`);
  console.log(`❌ Errors: ${errorCount}`);
  console.log(`\n📋 Total: ${allResults.length} tests`);

  if (errorCount === 0) {
    console.log('\n🎉 All systems operational! ✅');
  } else {
    console.log('\n⚠️ Please fix the errors above before production use.');
  }

  // Return results for programmatic use
  return;
}

/**
 * Helper function to log results with colors
 */
function logResult(result: VerificationResult): void {
  const icon = result.status === 'success' ? '✅' : result.status === 'error' ? '❌' : '⚠️';
  const style = result.status === 'success' ? 'color: green; font-weight: bold' :
                result.status === 'error' ? 'color: red; font-weight: bold' : 'color: orange; font-weight: bold';

  console.log(`%c${icon} ${result.component}`, style);
  console.log(`   Message: ${result.message}`);
  if (result.details) {
    console.log(`   Details:`, result.details);
  }
}

// Export for use in console
export default verifyAllConnections;
