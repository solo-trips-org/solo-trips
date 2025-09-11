import jwt from 'jsonwebtoken';
import { Token } from '../models/token.model.js';

export const injectAuthContext = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];

    try {
      const tokenDoc = await Token.findOne({ token });
      if (tokenDoc) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        req.token = token;
      }
    } catch (err) {
      // Token invalid or expired, skip attaching user
      req.user = null;
      req.token = null;
    }
  } else {
    req.user = null;
    req.token = null;
  }

  next();
};