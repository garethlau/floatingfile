const express = require("express");
const router = express.Router();
const keys = require("../../../config/keys");
const stripe = require("stripe")(keys.stripeSK);

// Make sure these are the same as client constants
const prices = {
	coffee: 100,
	subway: 500,
	textbook: 23600
};

function calculateOrderAmount(items) {
	let orderAmount = 0;
	Object.keys(items).forEach(key => {
		let quantity = items[key]["quantity"];
		orderAmount += prices[key] * quantity;
	});
	return orderAmount;
}

router.post("/intent", async (req, res) => {
	const { items, currency } = req.body;
	let orderAmount = calculateOrderAmount(items);
	if (orderAmount <= 0) {
		return res.status(400).send({ message: "Invalid amount." });
	}
	const paymentIntent = await stripe.paymentIntents.create({
		amount: orderAmount,
		currency: currency,
		metadata: { integration_check: "accept_a_payment" }
	});

	return res.status(200).send({
		publishableKey: keys.stripePK,
		clientSecret: paymentIntent.client_secret
	});
});

module.exports = router;
