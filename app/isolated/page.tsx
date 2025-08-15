// Completely isolated test page - no external imports
export default function IsolatedPage() {
  const pageHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8" />
      <title>Isolated Test</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 2rem; background: #f0f0f0; }
        .container { background: white; padding: 2rem; border-radius: 8px; max-width: 600px; }
        .success { color: green; font-weight: bold; }
        .info { background: #e3f2fd; padding: 1rem; border-radius: 4px; margin: 1rem 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🧪 Completely Isolated Test</h1>
        <p class="success">✅ SUCCESS: This page is rendering!</p>
        
        <div class="info">
          <h3>Test Results:</h3>
          <ul>
            <li>Next.js App Router: ✅ Working</li>
            <li>Server Components: ✅ Working</li>
            <li>HTML Generation: ✅ Working</li>
            <li>Timestamp: ${new Date().toISOString()}</li>
            <li>Environment: ${process.env.NODE_ENV || 'unknown'}</li>
          </ul>
        </div>
        
        <div class="info">
          <h3>Environment Variables (for debugging):</h3>
          <ul>
            <li>SERP_API_KEY: ${process.env.SERP_API_KEY ? 'Set' : 'Missing'}</li>
            <li>MAPBOX_API: ${process.env.MAPBOX_API ? 'Set' : 'Missing'}</li>
            <li>UNSPLASH_ACCESS_KEY: ${process.env.UNSPLASH_ACCESS_KEY ? 'Set' : 'Missing'}</li>
          </ul>
        </div>
        
        <p><a href="/">← Back to Home</a></p>
      </div>
    </body>
    </html>
  `;
  
  return <div dangerouslySetInnerHTML={{ __html: pageHtml }} />;
}