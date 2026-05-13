const Booking = require("../models/booking");
const Listing = require("../models/listing");
const express = require("express");
const router  = express.Router({mergeParams: true});
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const { isLoggedIn } = require("../middleware");
const { saveRedirectUrl } = require("../middleware.js");

const userController = require("../controllers/users.js");


router.get("/signup", userController.renderSignup );

router.post("/signup", wrapAsync(userController.signupInfo));

router.get("/login", userController.renderLogin);

router.post("/login",saveRedirectUrl,
    passport.authenticate("local", {failureRedirect: "/login", failureFlash: true}), userController.afterLogin);

router.post("/favorites/:id", isLoggedIn, wrapAsync(async(req,res) => {

    const { id } = req.params;

    const user = await User.findById(req.user._id).populate("favorites");;

    if(!user.favorites.includes(id)){
        user.favorites.push(id);
        await user.save();
    }

    req.flash("success", "Added to favorites!");

    res.redirect(`/listings/${id}`);

}));

router.post("/favorites/:id/remove", isLoggedIn, wrapAsync(async(req,res) => {

    const { id } = req.params;

    await User.findByIdAndUpdate(req.user._id, {
        $pull: {
            favorites: id
        }
    });

    req.flash("success", "Removed from favorites!");

    res.redirect("/profile");

}));


router.get("/profile", isLoggedIn, wrapAsync(async(req,res) => {

    const user = await User.findById(req.user._id);

    const userListings = await Listing.find({
        owner: req.user._id
    }).populate("reviews");

    let totalReviews = 0;

    userListings.forEach((listing) => {
        totalReviews += listing.reviews.length;
    });

    const bookings = await Booking.find({
        user: req.user._id
    }).populate("listing");

    res.render("users/profile.ejs", {
        user,
        userListings,
        totalReviews,
        bookings
    });

}));

router.get("/logout", userController.userLogout);

module.exports = router;