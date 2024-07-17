import { NextApiRequest, NextApiResponse } from 'next';
import { serialize } from 'cookie';
import { createSession } from '@/lib/sessionStore';

export default (req: NextApiRequest, res: NextApiResponse): void => {
    if (req.method === 'POST') {
        const { name, email, id, image, isAdmin } = req.body;
        const sessionId = id;
      
        // createSession(sessionId, { name, email, id, image, isAdmin });
        const sessionData = JSON.stringify({user: {sessionId, name, email, image, isAdmin }});
        const cookie = serialize('sessiondata', sessionData, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          maxAge: 60 * 60 * 24 * 7, // 1 week
          path: '/',
        });
        res.setHeader('Set-Cookie', cookie);
        res.status(200).json({ message: 'Session created' });
    } else {
        res.status(405).json({ message: 'Method Not Allowed' });
    }
}