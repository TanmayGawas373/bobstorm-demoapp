import React, { useState } from 'react';
import axios from 'axios';
import { useToast } from '../context/ToastContext';

const SAMPLE_YAML = `- name: Gaming Mouse
  category: Electronics
  price: 49.99
  image: https://picsum.photos/seed/gm/300/200
  description: High-DPI optical gaming mouse with RGB lighting.

- name: Wireless Charger
  category: Electronics
  price: 29.99
  image: https://picsum.photos/seed/wc/300/200
  description: 15W Qi-compatible wireless charging pad.`;

export default function Admin() {
  const [yaml, setYaml]       = useState(SAMPLE_YAML);
  const [result, setResult]   = useState(null);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  async function handleImport() {
    if (!yaml.trim()) { toast('Paste some YAML first', 'error'); return; }
    setLoading(true);
    setResult(null);
    try {
      const { data } = await axios.post('/api/admin/import', yaml, {
        headers: { 'Content-Type': 'text/plain' },
      });
      setResult({ success: true, msg: `✓ Inserted ${data.inserted} product(s) successfully.` });
      toast(`Imported ${data.inserted} product(s) ✓`);
    } catch (err) {
      const msg = err.response?.data?.error || 'Import failed';
      setResult({ success: false, msg });
      toast(msg, 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container" style={{ maxWidth: 820 }}>
      <div className="page-header">
        <h1>⚙️ Admin Panel</h1>
        <p>Import products from YAML. This endpoint uses <code>yaml.load()</code> — intentionally unsafe.</p>
      </div>

      <div className="admin-panel">
        <h3 style={{ marginBottom: '1rem', fontSize: '1rem' }}>Import Products via YAML</h3>

        <div style={{ background: '#fff3cd', border: '1px solid #ffc107', borderRadius: 8, padding: '.75rem 1rem', marginBottom: '1rem', fontSize: '.85rem', color: '#856404' }}>
          ⚠️ <strong>Vulnerability Demo:</strong> This endpoint calls <code>yaml.load(data)</code> without safe_load, enabling arbitrary Python object deserialization.
        </div>

        <div className="form-group">
          <label>YAML Payload</label>
          <textarea
            className="form-group"
            value={yaml}
            onChange={e => setYaml(e.target.value)}
            rows={12}
            style={{ fontFamily: 'monospace', fontSize: '.85rem', width: '100%', borderRadius: 8, border: '1.5px solid #d1d5db', padding: '.6rem .9rem', resize: 'vertical' }}
          />
        </div>

        <button className="btn btn-secondary" onClick={handleImport} disabled={loading}>
          {loading ? 'Importing…' : 'Import Products'}
        </button>

        {result && (
          <div
            style={{
              marginTop: '1rem', padding: '.75rem 1rem', borderRadius: 8,
              background: result.success ? '#dcfce7' : '#fee2e2',
              color:      result.success ? '#15803d'  : '#b91c1c',
              fontSize:   '.9rem',
            }}
          >
            {result.msg}
          </div>
        )}

        <hr style={{ margin: '1.8rem 0', borderColor: '#e5e7eb' }} />

        <h3 style={{ marginBottom: '.75rem', fontSize: '1rem' }}>Vulnerability Summary</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.87rem' }}>
          <thead>
            <tr style={{ background: '#f7f8fa' }}>
              <th style={{ padding: '.5rem .75rem', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>#</th>
              <th style={{ padding: '.5rem .75rem', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>Vulnerability</th>
              <th style={{ padding: '.5rem .75rem', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>Location</th>
              <th style={{ padding: '.5rem .75rem', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>Severity</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['1', 'Unsafe YAML Deserialization', 'backend/app.py · yaml.load()', 'Critical'],
              ['2', 'SQL Injection',               'backend/app.py · /api/products?search=', 'High'],
              ['3', 'Flask Debug Mode Enabled',    'backend/app.py · app.run(debug=True)', 'Medium'],
              ['4', 'Hardcoded Secret Key',        'backend/app.py · SECRET_KEY=…', 'High'],
              ['5', 'Outdated Flask 1.0',          'requirements.txt', 'High'],
              ['6', 'Outdated Jinja2 2.10',        'requirements.txt', 'High'],
              ['7', 'Outdated PyYAML 5.1',         'requirements.txt', 'High'],
              ['8', 'Outdated requests 2.19.1',    'requirements.txt', 'Medium'],
              ['9', 'Outdated urllib3 1.23',       'requirements.txt', 'Medium'],
            ].map(([n, v, loc, sev]) => (
              <tr key={n} style={{ borderBottom: '1px solid #f0f0f0' }}>
                <td style={{ padding: '.45rem .75rem', color: '#57606a' }}>{n}</td>
                <td style={{ padding: '.45rem .75rem', fontWeight: 600 }}>{v}</td>
                <td style={{ padding: '.45rem .75rem', fontFamily: 'monospace', fontSize: '.8rem', color: '#57606a' }}>{loc}</td>
                <td style={{ padding: '.45rem .75rem' }}>
                  <span className={`badge ${sev === 'Critical' ? 'badge-orange' : sev === 'High' ? '' : 'badge-blue'}`}
                    style={sev === 'High' ? { background: '#fee2e2', color: '#dc2626' } : {}}>
                    {sev}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
