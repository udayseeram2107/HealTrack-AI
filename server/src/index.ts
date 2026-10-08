import { app } from './app.js';
import { config } from './config/index.js';

const PORT = config.port || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`====================================================`);
  console.log(`🚀 HealTrack AI Clinical Server listening on 0.0.0.0:${PORT}`);
  console.log(`📡 Environment: ${config.env}`);
  console.log(`🛡️  Auth & RLS: Enforced / Active`);
  console.log(`🤖 AI Engine: Google Gen AI SDK (${config.gemini.model})`);
  console.log(`🏥 Places Proxy: Enabled at /api/v1/maps/nearby-facilities`);
  console.log(`====================================================`);
});
