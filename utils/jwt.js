const jwt = require("jsonwebtoken")
const dotenv = require("dotenv")
dotenv.config()


module.exports.createJWT = (_id, isAdmin) => {
    let payload = {
        _id,
        isAdmin
    }
    let token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || "1d"
    })
    return token
}

module.exports.verifyJWT = (token) => {
    try {
        let decoder = jwt.verify(token, process.env.JWT_SECRET)
        return decoder
    } catch (error) {
        return false
    }

}