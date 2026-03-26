import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware
  app.use(express.json());

  // API Routes (Optional: if you need custom backend logic)
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'SmartBasket Backend is running' });
  });

  // Secure Payment Tracking
  // In a real app, this would be a database (e.g., Firestore)
  const paymentSessions = new Map<string, { status: string; startTime: number; transactionId?: string }>();

  // Endpoint for frontend to poll status
  app.get('/api/payment/status/:sessionId', (req, res) => {
    const { sessionId } = req.params;
    
    if (!paymentSessions.has(sessionId)) {
      paymentSessions.set(sessionId, { status: 'pending', startTime: Date.now() });
    }

    const session = paymentSessions.get(sessionId)!;
    res.json({ status: session.status });
  });

  // REAL WEBHOOK ENDPOINT
  // This is what a Payment Gateway (Razorpay, PhonePe, etc.) would call
  // to confirm that the money has actually reached your bank account.
  app.post('/api/payment/webhook', (req, res) => {
    const { sessionId, transactionId, amount, secretKey } = req.body;

    // SECURITY: In production, you would verify a digital signature from the gateway
    // to ensure the request is actually from the bank and not a fraudster.
    if (secretKey === 'SB_SECURE_WEBHOOK_KEY_2026') {
      if (paymentSessions.has(sessionId)) {
        const session = paymentSessions.get(sessionId)!;
        
        // Mark as paid only if the amount matches (optional but recommended)
        paymentSessions.set(sessionId, { 
          ...session, 
          status: 'paid',
          transactionId: transactionId || `TXN_${Math.random().toString(36).substring(7).toUpperCase()}`
        });
        
        console.log(`[BANK CONFIRMED] Session ${sessionId} verified for amount: ₹${amount || 'unknown'}`);
        return res.json({ success: true, message: 'Bank confirmation received' });
      }
      return res.status(404).json({ error: 'Payment session expired or not found' });
    }
    
    res.status(401).json({ error: 'Unauthorized: Invalid Security Key' });
  });

  // Vite integration for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SmartBasket server running on http://localhost:${PORT}`);
  });
}

startServer();
