const User = require("../models/user");

module.exports.renderSignup = (req, res) => {
    res.render("users/signup.ejs");
};

module.exports.signupInfo = async(req,res,next) => {
    try{
        let {username, email, password} = req.body;
        console.log(req.body);
        
        let newUser = new User({username, email});
        const registerUser = await User.register(newUser, password);
        
        req.login(registerUser, (err) => {
            if(err){
                return next(err);
            };
            req.flash("success", "Welcome to WanderLust");
            res.redirect("/listings");
        })
    }catch(e){
        console.log(e);
        
        req.flash("error", e.message);
        res.redirect("/signup");
    }
    
};

module.exports.renderLogin = (req, res) => {
    res.render("users/login.ejs");
};

module.exports.afterLogin = async(req, res) => {
        req.flash("success", "Welcome back to WanderLust!");
        let redirectUrl = res.locals.redirectUrl || "/listings";
        res.redirect(redirectUrl);
};

module.exports.userLogout = (req,res,next) => {
    req.logout((err) => {
        if(err) {
            return next(err);
        }
        req.flash("success", "you are logged out!");
        res.redirect("/listings");
    });
};