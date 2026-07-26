const jwt = require('jsonwebtoken');

const middlewareControllers = {
    verifyToken: (req, res, next) => {
        const token = req.headers.authorization || req.headers.token;
        console.log('Token received:', token);
        if (token) {
            let accessToken = token;
            if (token.startsWith('Bearer ')) {
                accessToken = token.split(' ')[1];
            }
            console.log('AccessToken for verify:', accessToken);
            jwt.verify(accessToken, process.env.JWT_SECRET, (err, payload) => {
                if (err) {
                    console.log('JWT verify error:', err);
                    if (err.name === 'TokenExpiredError') {
                        return res.status(401).json({ message: 'Token expired' });
                    }
                    return res.status(403).send('Token is not valid');
                }
                console.log('Decoded JWT payload:', payload);
                if (!payload.id) {
                    console.log('⚠️ JWT payload missing id field!');
                }
                req.user = { id: payload.id, role: payload.role };
                next();
            });
        } else {
            console.log('⚠️ No token found in headers!');
            return res.status(401).send('You are not authenticated');
        }
    },
    verifyAdmin: (req, res, next) => {
        middlewareControllers.verifyToken(req, res, () => {
            if (req.user && req.user.role === 'admin') {
                next();
            } else {
                return res.status(403).json({ message: 'Access denied. Admins only.' });
            }
        });
    }
};
module.exports = middlewareControllers;