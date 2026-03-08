import React, { useEffect, useState } from 'react';

const AdminNewsletterSubscribers: React.FC = () => {
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const fetchSubscribers = () => {
    setLoading(true);
    fetch('http://localhost:4000/api/v1/admin/features/newsletter')
      .then(res => res.json())
      .then(data => {
        setSubscribers(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const handleDelete = async (id: string) => {
    await fetch(`http://localhost:4000/api/v1/admin/features/newsletter/${id}`, { method: 'DELETE' });
    fetchSubscribers();
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0a0d14', color: '#fff', fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif" }}>
      <div style={{ maxWidth: 1060, margin: '0 auto', padding: '40px 24px' }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, color: '#f0c040', fontFamily: "'Playfair Display', serif", marginBottom: 24 }}>Admin Newsletter Subscribers</h1>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '48px 0' }}>
            <p style={{ color: '#fff', fontSize: 16 }}>Loading subscribers...</p>
          </div>
        ) : subscribers.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 0' }}>
            <p style={{ color: '#fff', fontSize: 16 }}>No subscribers found.</p>
          </div>
        ) : (
          <table style={{ width: '100%', background: '#222', borderRadius: 14, padding: 24 }}>
            <thead>
              <tr style={{ color: '#f0c040', fontSize: 16 }}>
                <th style={{ padding: '12px 8px' }}>Email</th>
                <th style={{ padding: '12px 8px' }}>Date Subscribed</th>
                <th style={{ padding: '12px 8px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {subscribers.map(sub => (
                <tr key={sub.id} style={{ borderBottom: '1px solid #444' }}>
                  <td style={{ padding: '12px 8px', color: '#fff' }}>{sub.email}</td>
                  <td style={{ padding: '12px 8px', color: '#fff' }}>{new Date(sub.dateSubscribed).toLocaleString()}</td>
                  <td style={{ padding: '12px 8px' }}>
                    <button onClick={() => handleDelete(sub.id)} style={{ background:'#ef4444', color:'#fff', border:'none', borderRadius:8, padding:'8px 18px', fontSize:14, fontWeight:600, cursor:'pointer' }}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminNewsletterSubscribers;
