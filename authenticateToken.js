
const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization;
  console.log('Token:', token);
 

  // Check if the token is present
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized - Token is missing' });
  }

  try {
    // Decode the token using the parseJwt function
    const decoded = parseJwt(token);

    console.log('Decoded Token:', decoded);

    req.user = decoded;
    next();
  } catch (error) {
    console.error('Error verifying token:', error.message);

    return res.status(401).json({ error: 'Unauthorized - Invalid token' });
  }
};

// Parse JWT function
function parseJwt(token) {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = Buffer.from(base64, 'base64').toString('utf-8');

  return JSON.parse(jsonPayload);
}

module.exports = {
    authenticateToken,
  };