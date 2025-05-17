const jwt = require("jsonwebtoken")


module.exports.createJWT = (_id,isAdmin) => {
    let payload = {
        _id,
        isAdmin
    }
    let token = jwt.sign(payload, "my-secret", {
        expiresIn: "1d"
    })
    return token
}

module.exports.verifyJWT = (token) => {
    try {
        let decoder = jwt.verify(token, "my-secret")
        return decoder
    } catch (error) {
        return false
    }

}