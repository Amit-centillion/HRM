const { UserSchema } = require("../models/user");
const verifyJWT = require('./verifyJWT')


const authorization = async (req, res, next) => {
	try {
		const { authorization } = req.headers;
		if (!authorization) throw new Error('Access denied. No token provided');
		const token =
			authorization && authorization.startsWith('Bearer ')
				? authorization.slice(7, authorization.length)
				: null;
		const verifyToken = verifyJWT(token);
		if (!verifyToken) throw new Error('Invalid Token');

		console.log('verifyToken', req.path);
		const user = await UserSchema.findOne({ _id: verifyToken.sub });
		if (!user) throw new Error('No User Found With That Token');

		req.currentUser = user;
		next();
	} catch (error) {
		console.log(error.message, req.originalUrl, req.ip);
		res.status(401).send({ success: false, message: error.message });
	}
};

module.exports = authorization