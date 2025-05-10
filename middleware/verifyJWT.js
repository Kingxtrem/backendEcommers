const { verifyJWT } = require("../utils/jwt")
module.exports.isvaliduser = async (req, res, next) => {
    let token = req.headers?.authorization
    if(!token){
        return res.status(403).json({success:false,message:"Token not found"})
    }
    let isValidJWT=verifyJWT(token)
    req.user=isValidJWT
    if(isValidJWT){
         next()
    }else{
        return res.status(401).json({success:false,message:"Invalid JWT"})
    }
}