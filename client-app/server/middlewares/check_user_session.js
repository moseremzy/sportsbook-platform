module.exports = (req, res, next) => {
 
    if (req.isAuthenticated() && req.user.id) {  

        next()
        
    } else {

        return res.status(401).json({
            success: false,
            message: "Not logged in.",
            isAuthenticated: req.isAuthenticated()
        });

    }

}