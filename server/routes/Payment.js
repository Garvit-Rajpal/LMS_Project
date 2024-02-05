// Import the required modules
const express = require("express")
const router = express.Router()

const { createOrder, verifySignature } = require("../controllers/Payment")
const { auth, isInstructor, isStudent, isAdmin } = require("../middlewares/auth")
router.post("/capturePayment", auth, isStudent, createOrder)
router.post("/verifySignature", verifySignature)

module.exports = router;