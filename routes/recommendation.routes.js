const recommendationRoutes = require("express").Router();
const { getRecommendation } = require("../controllers/recommendation.controllers.js");

recommendationRoutes.route("/get-recommendation").get(getRecommendation);

module.exports = { recommendationRoutes };
