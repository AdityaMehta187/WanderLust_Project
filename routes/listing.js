const express = require("express");
const router  = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const {isLoggedIn , isOwner, validateListing} = require("../middleware.js");

const listingController = require("../controllers/listing.js");
const multer = require('multer');

const {storage} = require("../cloudConfig.js");
const upload = multer({storage});

router
  .route("/")
  .get( wrapAsync(listingController.index))
  .post( 
    isLoggedIn, 
    validateListing,
    upload.single('listing[image]'),
    wrapAsync(listingController.createListing)
  );

//New Route
router.get("/new", isLoggedIn, listingController.renderNewForm);

router.get("/search", wrapAsync(async(req,res) => {

    let { q } = req.query;

    const allListings = await Listing.find({
        $or: [
            { title: { $regex: q, $options: "i" } },
            { location: { $regex: q, $options: "i" } },
            { country: { $regex: q, $options: "i" } },
        ]
    });

    res.render("listings/index.ejs", { allListings });

}));

router.get("/filter/:category", wrapAsync(async(req,res) => {

    let { category } = req.params;

    const allListings = await Listing.find({ category });

    res.render("listings/index.ejs", { allListings });

}));

router
  .route("/:id")
  .get( wrapAsync(listingController.showListing))
  .put(isLoggedIn,isOwner,upload.single('listing[image]'),validateListing, wrapAsync(listingController.updatelisting))
  .delete(isLoggedIn, isOwner, wrapAsync(listingController.destroyListing));

//Edit route
router.get("/:id/edit", isLoggedIn, isOwner,wrapAsync(listingController.editListing));

module.exports = router;