// Simple debug page with minimal dependencies
export default function DebugPage() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f7fafc', padding: '2rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem' }}>
          🔍 Production Debug Information
        </h1>
        
        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
            Environment Check
          </h2>
          <div style={{ fontSize: '0.875rem', fontFamily: 'monospace' }}>
            <div>NODE_ENV: {process.env.NODE_ENV || 'not set'}</div>
            <div>NEXT_RUNTIME: {process.env.NEXT_RUNTIME || 'not set'}</div>
          </div>
        </div>

        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
            Environment Variables Status
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '0.5rem' }}>
            {[
              'MAPBOX_API',
              'UNSPLASH_ACCESS_KEY', 
              'SERP_API_KEY',
              'AIRTABLE_TOKEN',
              'AIRTABLE_BASE_ID'
            ].map(envVar => {
              const isSet = !!process.env[envVar];
              return (
                <div key={envVar} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.75rem',
                  backgroundColor: '#f7fafc',
                  borderRadius: '4px'
                }}>
                  <span style={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
                    {envVar}
                  </span>
                  <span style={{
                    padding: '0.25rem 0.5rem',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    backgroundColor: isSet ? '#c6f6d5' : '#fed7d7',
                    color: isSet ? '#22543d' : '#742a2a'
                  }}>
                    {isSet ? '✓ Set' : '❌ Missing'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
            Quick Test
          </h2>
          <div style={{ marginBottom: '1rem' }}>
            <strong>Test URLs:</strong>
          </div>
          <ul style={{ listStyleType: 'disc', paddingLeft: '2rem' }}>
            <li><a href="/api/health" target="_blank">Health Check API</a></li>
            <li><a href="/coffee-store" target="_blank">Coffee Store Main Page</a></li>
            <li><a href="/" target="_blank">Home Page</a></li>
          </ul>
        </div>

        <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#bee3f8', borderRadius: '8px' }}>
          <h3 style={{ color: '#2a69ac', fontWeight: '600', marginBottom: '0.5rem' }}>
            🔧 Fix Missing Environment Variables:
          </h3>
          <ol style={{ color: '#2c5aa0', paddingLeft: '1.5rem' }}>
            <li>Go to Vercel dashboard → Project → Settings → Environment Variables</li>
            <li>Add any missing variables shown above</li>
            <li>Redeploy the project</li>
          </ol>
        </div>
      </div>
    </div>
  );
}