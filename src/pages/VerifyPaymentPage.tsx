import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import * as ticketService from '../services/ticketService';

function VerifyPaymentPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'verifying' | 'success' | 'pending' | 'failed'>('verifying');
  const [tickets, setTickets] = useState<any[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const reference = searchParams.get('reference');
    if (!reference) {
      setStatus('failed');
      setError('No payment reference provided.');
      return;
    }

    let attempts = 0;
    const maxAttempts = 5;
    let timeoutId: number | null = null;

    const verifyPayment = async () => {
      attempts += 1;
      try {
        const response = await ticketService.verifyPayment(reference);
        if (response.status === 'success') {
          setStatus('success');
          setTickets(response.tickets || []);
          return;
        }

        if (response.status === 'pending' && attempts < maxAttempts) {
          setStatus('pending');
          timeoutId = window.setTimeout(verifyPayment, 3000);
          return;
        }

        if (response.status === 'pending') {
          setStatus('failed');
          setError('Payment is still pending after multiple verification attempts. Please check your payment history.');
          return;
        }

        setStatus('failed');
        setError(response.message || 'Payment verification failed.');
      } catch (err: any) {
        if (attempts < maxAttempts) {
          timeoutId = window.setTimeout(verifyPayment, 3000);
          return;
        }
        setStatus('failed');
        setError(err?.message || 'Verification failed.');
      }
    };

    verifyPayment();

    return () => {
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [searchParams]);

  if (status === 'verifying' || status === 'pending') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0d14', color: '#fff' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 40, height: 40, border: '4px solid rgba(240,192,64,0.3)', borderTop: '4px solid #f0c040', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 20px' }} />
          <p>{status === 'verifying' ? 'Verifying payment...' : 'Payment is still processing...'}</p>
        </div>
      </div>
    );
  }

  if (status === 'failed') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0d14', color: '#fff' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: '#ef4444', marginBottom: 20 }}>Payment verification failed</p>
          <p>{error}</p>
          <button onClick={() => navigate('/')} style={{ marginTop: 20, background: '#f0c040', color: '#0a0d14', border: 'none', padding: '10px 20px', borderRadius: 5 }}>Go Home</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0d14', color: '#fff', padding: '40px 20px' }}>
      <div style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
        <h1 style={{ color: '#f0c040', marginBottom: 20 }}>Payment Successful!</h1>
        <p>Your tickets have been activated.</p>
        {tickets.length > 0 ? tickets.map((ticket, index) => (
          <div key={index} style={{ marginTop: 20, padding: 20, background: 'rgba(255,255,255,0.05)', borderRadius: 10 }}>
            <p style={{ marginBottom: 8, fontWeight: 700 }}>Ticket ID</p>
            <p style={{ fontFamily: "'DM Mono', monospace", wordBreak: 'break-all' }}>{ticket.id}</p>
          </div>
        )) : (
          <div style={{ marginTop: 20, padding: 20, background: 'rgba(255,255,255,0.05)', borderRadius: 10 }}>
            <p style={{ color: 'rgba(255,255,255,0.65)' }}>No ticket data returned by the backend. Check your account for details.</p>
          </div>
        )}
        <button onClick={() => navigate('/account')} style={{ marginTop: 20, background: '#f0c040', color: '#0a0d14', border: 'none', padding: '10px 20px', borderRadius: 5 }}>View My Tickets</button>
      </div>
    </div>
  );
}

export default VerifyPaymentPage;