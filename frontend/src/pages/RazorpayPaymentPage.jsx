import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from '../api/axios';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function RazorpayPaymentPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [paymentData, setPaymentData] = useState(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (location.state?.paymentData) {
      setPaymentData(location.state.paymentData);
    } else {
      navigate('/participant-home');
    }
  }, [location.state, navigate]);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      // Check if Razorpay is already loaded
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => {
        console.error('Failed to load Razorpay script');
        resolve(false);
      };
      document.body.appendChild(script);
    });
  };

  const handleRazorpayPayment = async () => {
    setProcessing(true);

    try {
      // Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        alert('Failed to load payment gateway. Please try again.');
        setProcessing(false);
        return;
      }

      // Create Razorpay order
      console.log('Creating Razorpay order for registration:', paymentData.registrationId);
      const orderResponse = await axios.post(
        `/registrations/${paymentData.registrationId}/razorpay-order`
      );
      
      console.log('Order response:', orderResponse.data);

      const { order, key_id } = orderResponse.data;

      const options = {
        key: key_id,
        amount: order.amount,
        currency: order.currency,
        name: 'NIRAL 2026',
        description: `Registration for ${paymentData.event.title}`,
        order_id: order.id,
        handler: async (response) => {
          try {
            // Verify payment
            const verifyResponse = await axios.post(
              `/registrations/${paymentData.registrationId}/verify-payment`,
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              }
            );

            if (verifyResponse.data.success) {
              navigate('/payment-success', {
                state: {
                  paymentId: response.razorpay_payment_id,
                  event: paymentData.event,
                  amount: paymentData.amount,
                  registrationId: paymentData.registrationId
                }
              });
            }
          } catch (error) {
            alert('Payment verification failed. Please contact support.');
            setProcessing(false);
          }
        },
        prefill: {
          name: paymentData.participantName || '',
          email: paymentData.participantEmail || ''
        },
        theme: {
          color: '#667eea'
        },
        modal: {
          ondismiss: () => {
            setProcessing(false);
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('Payment error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      alert(`Payment failed: ${error.response?.data?.message || error.message}`);
      setProcessing(false);
    }
  };

  if (!paymentData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="niral-home">
      <Header showBackButton={true} backTo="/participant-home" showNavigation={false} />
      
      <div style={{
        minHeight: '100vh',
        background: 'radial-gradient(circle at top right, #2A0E3F, #12081E 60%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '140px 20px 80px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Animated background */}
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'url("data:image/svg+xml,<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg"><circle cx="20" cy="20" r="1" fill="%23EC4899" opacity="0.1"/><circle cx="80" cy="60" r="1" fill="%2300E5FF" opacity="0.1"/><circle cx="40" cy="80" r="1" fill="%23F5B301" opacity="0.1"/></svg>")',
          animation: 'starField 30s linear infinite',
          zIndex: 0
        }} />
        
        <div style={{
          background: 'rgba(19,10,46,0.85)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '18px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
          backdropFilter: 'blur(16px)',
          maxWidth: '500px',
          width: '100%',
          padding: '2.5rem',
          position: 'relative',
          zIndex: 1
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '2rem'
          }}>
            <div style={{
              width: '50px',
              height: '50px',
              background: 'linear-gradient(135deg, #F5B301, #FF8C00)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '15px',
              boxShadow: '0 0 25px rgba(245,179,1,0.35)'
            }}>
              <span style={{ color: '#0B061A', fontWeight: 'bold', fontSize: '20px' }}>N</span>
            </div>
            <div>
              <h3 style={{ 
                margin: '0', 
                fontSize: '22px', 
                fontWeight: '700',
                background: 'linear-gradient(135deg, #F5B301, #FF8C00)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '1px'
              }}>NIRAL Pay</h3>
              <p style={{ margin: '0', fontSize: '13px', color: '#C9C6D6' }}>Powered by Razorpay</p>
            </div>
          </div>

          <div style={{
            background: 'rgba(11,6,26,0.6)',
            border: '1px solid rgba(255,255,255,0.05)',
            borderRadius: '12px',
            padding: '1.5rem',
            marginBottom: '1.5rem'
          }}>
            <h4 style={{ 
              margin: '0 0 1.5rem 0', 
              fontSize: '18px', 
              fontWeight: '600',
              color: '#FFFFFF'
            }}>Payment Summary</h4>
            <div style={{ marginBottom: '1.5rem' }}>
              <h5 style={{ 
                margin: '0 0 0.5rem 0', 
                fontSize: '16px', 
                fontWeight: '600',
                color: '#FFFFFF'
              }}>
                {paymentData.event.title}
              </h5>
              <p style={{ margin: '0', fontSize: '13px', color: '#C9C6D6' }}>
                Event Registration Fee
              </p>
            </div>
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '14px', color: '#C9C6D6' }}>Registration Fee</span>
                <span style={{ fontSize: '14px', color: '#FFFFFF' }}>₹{paymentData.amount}</span>
              </div>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                borderTop: '1px solid rgba(255,255,255,0.08)', 
                paddingTop: '0.75rem' 
              }}>
                <span style={{ fontSize: '18px', fontWeight: '600', color: '#FFFFFF' }}>Total Amount</span>
                <span style={{ 
                  fontSize: '18px', 
                  fontWeight: '700',
                  background: 'linear-gradient(135deg, #F5B301, #FF8C00)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>₹{paymentData.amount}</span>
              </div>
            </div>
          </div>

          <div style={{
            background: 'rgba(0,229,255,0.1)',
            border: '1px solid rgba(0,229,255,0.2)',
            borderRadius: '8px',
            padding: '1rem',
            fontSize: '13px',
            color: '#00E5FF',
            marginBottom: '2rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            🔒 Secure payment powered by Razorpay with 256-bit SSL encryption
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              onClick={() => navigate('/participant-home')}
              disabled={processing}
              style={{
                flex: 1,
                padding: '12px 20px',
                background: 'transparent',
                color: '#FF5A5A',
                border: '1px solid #FF5A5A',
                borderRadius: '999px',
                cursor: processing ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                transition: 'all 0.3s ease',
                opacity: processing ? 0.6 : 1
              }}
              onMouseEnter={(e) => {
                if (!processing) {
                  e.target.style.background = 'rgba(255, 90, 90, 0.1)';
                  e.target.style.transform = 'translateY(-1px)';
                  e.target.style.boxShadow = '0 0 25px rgba(255, 90, 90, 0.35)';
                }
              }}
              onMouseLeave={(e) => {
                if (!processing) {
                  e.target.style.background = 'transparent';
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleRazorpayPayment}
              disabled={processing}
              style={{
                flex: 2,
                padding: '12px 28px',
                background: processing ? 'rgba(245,179,1,0.6)' : 'linear-gradient(135deg, #F5B301, #FF8C00)',
                color: '#0B061A',
                border: 'none',
                borderRadius: '999px',
                cursor: processing ? 'not-allowed' : 'pointer',
                fontSize: '16px',
                fontWeight: '700',
                transition: 'all 0.3s ease',
                boxShadow: processing ? 'none' : '0 0 25px rgba(245,179,1,0.35)'
              }}
              onMouseEnter={(e) => {
                if (!processing) {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 12px 35px rgba(245,179,1,0.5)';
                }
              }}
              onMouseLeave={(e) => {
                if (!processing) {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 0 25px rgba(245,179,1,0.35)';
                }
              }}
            >
              {processing ? 'Processing...' : `Pay ₹${paymentData.amount}`}
            </button>
          </div>
        </div>
        
        <style>{`
          @keyframes starField {
            from { transform: translateY(0); }
            to { transform: translateY(-100px); }
          }
        `}</style>
      </div>
      
      <Footer />
    </div>
  );
}