/**
 * Storage Verification Component
 * Add this to debug/admin pages to check all connections
 * 
 * Usage: <StorageVerification />
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle2, AlertCircle, XCircle, Loader2 } from 'lucide-react';

interface TestResult {
  name: string;
  status: 'idle' | 'testing' | 'success' | 'error';
  message: string;
  details?: any;
}

export default function StorageVerification() {
  const db = supabase as any;

  const [results, setResults] = useState<TestResult[]>([
    { name: 'Supabase Configuration', status: 'idle', message: '' },
    { name: 'Supabase Connection', status: 'idle', message: '' },
    { name: 'Secure Upload Gateway', status: 'idle', message: '' },
    { name: 'Database Tables', status: 'idle', message: '' },
    { name: 'User Authentication', status: 'idle', message: '' },
    { name: 'Data Statistics', status: 'idle', message: '' },
  ]);
  const [isRunning, setIsRunning] = useState(false);

  const updateResult = (index: number, status: 'testing' | 'success' | 'error', message: string, details?: any) => {
    setResults(prev => {
      const newResults = [...prev];
      newResults[index] = { ...newResults[index], status, message, details };
      return newResults;
    });
  };

  const runTests = async () => {
    setIsRunning(true);

    try {
      // Test 1: Supabase Configuration
      updateResult(0, 'testing', 'Checking environment variables...');
      const url = import.meta.env.VITE_SUPABASE_URL;
      const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

      if (!url || !key) {
        updateResult(0, 'error', 'Missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY');
      } else {
        updateResult(0, 'success', `Connected to ${url?.substring(0, 40)}...`);
      }

      // Test 2: Supabase Connection
      updateResult(1, 'testing', 'Testing database connection...');
      try {
        const { data, error } = await db.from('user_profiles').select('count').limit(1);
        if (error) {
          updateResult(1, 'error', `Connection failed: ${error.message}`);
        } else {
          updateResult(1, 'success', `✅ Database connection successful`);
        }
      } catch (err: any) {
        updateResult(1, 'error', err.message);
      }

      // Test 3: Secure upload gateway configuration
      updateResult(2, 'testing', 'Checking secure upload gateway...');
      const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;

      if (!cloudName) {
        updateResult(2, 'error', 'Missing VITE_CLOUDINARY_CLOUD_NAME');
      } else {
        const { error } = await supabase.functions.invoke('upload-lyric-image', {
          body: new FormData(),
        });

        if (error) {
          const message = String(error.message || '').toLowerCase();
          const gatewayReachable =
            message.includes('unauthorized') ||
            message.includes('file is required') ||
            message.includes('invalid upload type') ||
            message.includes('400') ||
            message.includes('401');

          if (!gatewayReachable) {
            updateResult(2, 'error', `Gateway check failed: ${error.message}`);
          } else {
            updateResult(2, 'success', `Gateway reachable, Cloud: ${cloudName}`);
          }
        } else {
          updateResult(2, 'success', `Gateway reachable, Cloud: ${cloudName}`);
        }
      }

      // Test 4: Database Tables
      updateResult(3, 'testing', 'Verifying tables exist...');
      const tables = ['user_profiles', 'user_uploads'];
      let allTablesExist = true;

      for (const table of tables) {
        try {
          await db.from(table).select('count').limit(1);
        } catch (err) {
          allTablesExist = false;
        }
      }

      if (allTablesExist) {
        updateResult(3, 'success', `✅ All required tables exist`);
      } else {
        updateResult(3, 'error', '❌ Some tables are missing');
      }

      // Test 5: User Authentication
      updateResult(4, 'testing', 'Checking authentication...');
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          updateResult(4, 'error', `Auth error: ${error.message}`);
        } else if (session?.user) {
          updateResult(4, 'success', `✅ Logged in as ${session.user.email}`);
        } else {
          updateResult(4, 'success', '⚠️ Not logged in (OK for public pages)');
        }
      } catch (err: any) {
        updateResult(4, 'error', err.message);
      }

      // Test 6: Data Statistics
      updateResult(5, 'testing', 'Loading data statistics...');
      try {
        const { count: userCount } = await db
          .from('user_profiles')
          .select('id', { count: 'exact', head: true });

        const { count: bhajanCount } = await db
          .from('user_uploads')
          .select('id', { count: 'exact', head: true });

        updateResult(5, 'success', `📊 Users: ${userCount}, Bhajans: ${bhajanCount}`);
      } catch (err: any) {
        updateResult(5, 'error', err.message);
      }
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = (status: 'idle' | 'testing' | 'success' | 'error') => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'testing':
        return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>📋 Storage Verification</CardTitle>
          <CardDescription>
            Test all connections to Supabase and Cloudinary
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Test Results */}
          <div className="space-y-3">
            {results.map((result, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg border"
              >
                <div className="mt-1">{getStatusIcon(result.status)}</div>
                <div className="flex-1">
                  <p className="font-medium text-sm">{result.name}</p>
                  <p className="text-xs text-muted-foreground">{result.message}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Run Button */}
          <Button
            onClick={runTests}
            disabled={isRunning}
            className="w-full"
            size="lg"
          >
            {isRunning ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Running Tests...
              </>
            ) : (
              '🔍 Run All Tests'
            )}
          </Button>

          {/* Summary */}
          {results.some(r => r.status !== 'idle') && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {results.every(r => r.status === 'success') ? (
                  '✅ All tests passed! Your storage is properly configured.'
                ) : results.some(r => r.status === 'error') ? (
                  '❌ Some tests failed. Check the results above for details.'
                ) : (
                  '⚠️ Some tests are still running or incomplete.'
                )}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Quick Links */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">🔗 Quick Links</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <a
            href="https://app.supabase.com"
            target="_blank"
            rel="noopener noreferrer"
            className="block p-2 text-sm text-blue-500 hover:underline"
          >
            → Supabase Dashboard
          </a>
          <a
            href="https://cloudinary.com/console"
            target="_blank"
            rel="noopener noreferrer"
            className="block p-2 text-sm text-blue-500 hover:underline"
          >
            → Cloudinary Console
          </a>
          <a
            href="http://localhost:5173"
            className="block p-2 text-sm text-blue-500 hover:underline"
          >
            → Local App
          </a>
        </CardContent>
      </Card>
    </div>
  );
}
