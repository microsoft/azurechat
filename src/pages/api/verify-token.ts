import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';

interface VerifyTokenResponse {
  valid: boolean;
  decoded?: object;
  message?: string;
}

export default function handler(req: NextApiRequest, res: NextApiResponse<VerifyTokenResponse>) {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ valid: false, message: 'Token is required' });
  }

  try {
    const secretKey = process.env.JWT_SECRET as string; // Make sure to set this in your environment variables
    const decoded = jwt.verify(token, secretKey);
    return res.status(200).json({ valid: true, message: JSON.stringify(decoded) });
  } catch (error) {
    return res.status(401).json({ valid: false, message: 'Invalid token' });
  }
}