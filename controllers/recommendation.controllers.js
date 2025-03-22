const User = require("../models/user.models.js");
const { getRecommendationsForUser } = require("../utils/cache");

exports.getRecommendation= async (req, res) => {
    try {
        const name = req.body.userName;
        const email = req.body.userEmail;
        const user = await User.findOne({ name: name, email: email });
        const recommendationsForUser = getRecommendationsForUser(user);

        if (recommendationsForUser === null) {
            return res.status(400).json({
                success: false,
                message: "User does not have any recommendations."
            })
        }

        return res.status(200).json({
            success: true,
            message: "Success",
            recommendations: recommendationsForUser,
        });
    } catch (err) {
        console.log(err.message)
        return res.status(400).json({
            success: false,
            message: "No user found."
        })
    }
}
