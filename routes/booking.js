const express = require("express");

const router = express.Router();

const wrapAsync = require("../utils/wrapAsync");

const Booking = require("../models/booking");

const Listing = require("../models/listing");

const { isLoggedIn } = require("../middleware");



router.post("/:id", isLoggedIn, wrapAsync(async(req,res) => {

    const { id } = req.params;

    const listing = await Listing.findById(id);

    const checkIn = new Date(req.body.checkIn);

    const checkOut = new Date(req.body.checkOut);

    const today = new Date();

    today.setHours(0,0,0,0);

    if(checkIn < today || checkOut < today){

        req.flash("error", "Past dates are not allowed!");

        return res.redirect(`/listings/${id}`);

    }

    if(checkOut <= checkIn){

        req.flash("error", "Checkout must be after checkin!");

        return res.redirect(`/listings/${id}`);

    }

    const booking = new Booking({

        listing: listing._id,

        user: req.user._id,

        checkIn: req.body.checkIn,

        checkOut: req.body.checkOut,

        guests: req.body.guests,

    });

    await booking.save();

    req.flash("success", "Booking Confirmed!");

    res.redirect("/profile");

}));


router.delete("/:id", isLoggedIn, async (req, res) => {

    let { id } = req.params;

    await Booking.findByIdAndDelete(id);

    req.flash("success", "Booking cancelled successfully");

    res.redirect("/profile");
});



module.exports = router;