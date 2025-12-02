// src/config/vonage.js

import { Vonage } from '@vonage/server-sdk';
import 'dotenv/config';

const vonage = new Vonage({
  apiKey: process.env.VONAGE_API_KEY,
  apiSecret: process.env.VONAGE_API_SECRET,
});

export default vonage;