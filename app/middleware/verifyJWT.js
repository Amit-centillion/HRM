const secret = process.env.JWT_SECRET;
const {verify} = require('jsonwebtoken')

const verifyJwtToken = (token)=>{
    const verifyToken = verify(token, secret);
	return verifyToken;
}
module.exports=verifyJwtToken