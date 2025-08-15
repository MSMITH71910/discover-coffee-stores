// Absolute minimal page - no imports, no CSS, no dependencies
export default function MinimalPage() {
  return (
    <html>
      <body>
        <h1>Minimal Test</h1>
        <p>If you can see this, the app is working.</p>
        <p>Timestamp: {new Date().toString()}</p>
        <p>Node ENV: {process.env.NODE_ENV}</p>
      </body>
    </html>
  );
}