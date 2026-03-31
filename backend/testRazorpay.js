require('dotenv').config();
const Razorpay = require('razorpay');

console.log('Testing Razorpay credentials...');
console.log('RAZORPAY_KEY_ID:', process.env.RAZORPAY_KEY_ID);
console.log('RAZORPAY_KEY_SECRET exists:', !!process.env.RAZORPAY_KEY_SECRET);

try {
  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
  });

  // Test creating a simple order
  const testOrder = async () => {
    try {
      const options = {
        amount: 100, // 1 rupee in paise
        currency: 'INR',
        receipt: 'test_receipt_' + Date.now()
      };

      console.log('Creating test order with options:', options);
      const order = await razorpay.orders.create(options);
      console.log('✅ Razorpay connection successful!');
      console.log('Test order created:', order.id);
    } catch (error) {
      console.error('❌ Razorpay API Error:');
      console.error('Status Code:', error.statusCode);
      console.error('Error:', error.error);
      console.error('Message:', error.message);
    }
  };

  testOrder();
} catch (error) {
  console.error('❌ Razorpay initialization failed:', error.message);
}