// Minimal test page with zero dependencies
export default function TestPage() {
  const timestamp = new Date().toISOString();
  
  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui' }}>
      <h1>🧪 Minimal Test Page</h1>
      <p><strong>Status:</strong> ✅ Page rendering successfully</p>
      <p><strong>Timestamp:</strong> {timestamp}</p>
      <p><strong>Node Environment:</strong> {process.env.NODE_ENV || 'unknown'}</p>
      
      <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#f0f0f0', borderRadius: '8px' }}>
        <h2>Environment Variables Check:</h2>
        <ul>
          <li>MAPBOX_API: {process.env.MAPBOX_API ? '✅ Set' : '❌ Missing'}</li>
          <li>UNSPLASH_ACCESS_KEY: {process.env.UNSPLASH_ACCESS_KEY ? '✅ Set' : '❌ Missing'}</li>
          <li>SERP_API_KEY: {process.env.SERP_API_KEY ? '✅ Set' : '❌ Missing'}</li>
          <li>AIRTABLE_TOKEN: {process.env.AIRTABLE_TOKEN ? '✅ Set' : '❌ Missing'}</li>
          <li>AIRTABLE_BASE_ID: {process.env.AIRTABLE_BASE_ID ? '✅ Set' : '❌ Missing'}</li>
        </ul>
      </div>

      <div style={{ marginTop: '2rem' }}>
        <h2>Test Links:</h2>
        <ul>
          <li><a href="/api/health">Health API Test</a></li>
          <li><a href="/coffee-store">Coffee Store Main</a></li>
          <li><a href="/">Home Page</a></li>
        </ul>
      </div>
    </div>
  );
}