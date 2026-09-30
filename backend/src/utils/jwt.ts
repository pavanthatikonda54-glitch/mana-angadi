import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'mana_angadi_super_secret_jwt_key_2026';

export interface TokenPayload {
  userId: string;
  email: string;
  role: 'customer' | 'seller' | 'delivery' | 'admin';
}

export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, JWT_SECRET) as TokenPayload;
}
