const { verifyJWT } = require("../utils/jwt")
module.exports.isValidUser = async (req, res, next) => {
    let token = req.headers?.authorization
    if (!token) {
        return res.status(403).json({ success: false, message: "Token not found" })
    }
    let isValidJWT = verifyJWT(token)
    req.user = isValidJWT
    if (isValidJWT) {
        next()
    } else {
        return res.status(401).json({ success: false, message: "Session expired, please login again" })
    }
}
module.exports.isAdmin = async (req, res, next) => {
    let token = req.headers?.authorization
    if (!token) {
        return res.status(403).json({ success: false, message: "Token not found" })
    }
    let isValidJWT = verifyJWT(token)
    req.user = isValidJWT
    if (isValidJWT.isAdmin) {
        next()
    } else {
        return res.status(403).json({ success: false, message: "You are not authorized to Access this" })
    }
}