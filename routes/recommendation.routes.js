const recommendationRoutes = require("express").Router();
const { getRecommendation } = require("../controllers/recommendation.controllers.js");

recommendationRoutes.route("/get-recommendation").post(getRecommendation);

module.exports = { recommendationRoutes };
