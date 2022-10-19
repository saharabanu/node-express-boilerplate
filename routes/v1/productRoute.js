const express = require("express");
const productCotroller = require("../../controllers/productController");
const limiter = require("../../middleware/limiter");
const viewCount = require("../../middleware/viewCount");
const router = express.Router();


router.route("/")
.get(productCotroller.getAllProducts)
.post(productCotroller.CreateProduct)

router.route("/:id")
.get(viewCount,limiter,productCotroller.getProductDetails)
.patch(productCotroller.UpdateProduct)
.delete(productCotroller.DeleteProduct)

module.exports = router;
