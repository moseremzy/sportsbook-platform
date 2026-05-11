module.exports = (req, res, next) => {

    if (req.session.isAuthenticated && req.session.user_id) {  

        next()
        
    } else {

        return res.status(401).json({
            success: false,
            message: "Not logged in.",
            isAuthenticated: req.session.isAuthenticated
        });

    }

}