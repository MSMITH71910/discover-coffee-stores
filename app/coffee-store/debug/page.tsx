// Debug page to test coffee store functions in production
'use client';

import { useState, useEffect } from 'react';

export default function DebugPage() {
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function runDebugTests() {
      try {
        setLoading(true);
        
        // Test 1: Health check
        const healthResponse = await fetch('/api/health');
        const healthData = await healthResponse.json();
        
        // Test 2: Try to fetch coffee stores
        let coffeeStoreTest = { error: 'Not tested' };
        try {
          const storeResponse = await fetch('/api/getCoffeeStoresByLocation?latLong=40.7589,-73.9851&limit=2');
          coffeeStoreTest = {
            status: storeResponse.status,
            ok: storeResponse.ok,
            data: storeResponse.ok ? await storeResponse.json() : 'Failed to parse'
          };
        } catch (error: any) {
          coffeeStoreTest = { error: error.message };
        }

        setDebugInfo({
          health: healthData,
          coffeeStoreTest,
          clientInfo: {
            userAgent: navigator.userAgent,
            url: window.location.href,
            timestamp: new Date().toISOString()
          }
        });
      } catch (error: any) {
        setDebugInfo({
          error: 'Debug test failed',
          message: error.message,
          stack: error.stack
        });
      } finally {
        setLoading(false);
      }
    }

    runDebugTests();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-3xl font-bold mb-8">🔍 Debug Mode</h1>
          <div className="bg-white p-6 rounded-lg shadow">
            <p>Running diagnostic tests...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">🔍 Production Debug Information</h1>
        
        <div className="space-y-6">
          {/* Environment Variables Status */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Environment Variables</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {debugInfo?.health?.envVariables && Object.entries(debugInfo.health.envVariables).map(([key, value]: [string, any]) => (
                <div key={key} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="font-mono text-sm">{key}</span>
                  <span className={`px-2 py-1 rounded text-xs ${value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {value ? '✓ Set' : '❌ Missing'}
                  </span>
                </div>
              ))}
            </div>
            
            {debugInfo?.health?.missingEnvVars?.length > 0 && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded">
                <h3 className="text-red-800 font-semibold">Missing Environment Variables:</h3>
                <ul className="list-disc list-inside mt-2 text-red-700">
                  {debugInfo.health.missingEnvVars.map((env: string) => (
                    <li key={env} className="font-mono text-sm">{env}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Coffee Store API Test */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Coffee Store API Test</h2>
            <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
              {JSON.stringify(debugInfo?.coffeeStoreTest, null, 2)}
            </pre>
          </div>

          {/* Full Debug Data */}
          <details className="bg-white p-6 rounded-lg shadow">
            <summary className="text-xl font-semibold cursor-pointer mb-4">Full Debug Data</summary>
            <pre className="bg-gray-100 p-4 rounded overflow-auto text-xs">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </details>
        </div>

        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded">
          <h3 className="text-blue-800 font-semibold mb-2">🔧 How to Fix Missing Environment Variables:</h3>
          <ol className="list-decimal list-inside text-blue-700 space-y-1">
            <li>Go to your Vercel dashboard</li>
            <li>Select your project</li>
            <li>Go to Settings → Environment Variables</li>
            <li>Add the missing variables shown above</li>
            <li>Redeploy the project</li>
          </ol>
        </div>
      </div>
    </div>
  );
}