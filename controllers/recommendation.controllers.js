const User = require("../models/user.models.js");
const { getRecommendationsForUser } = require("../utils/cache");

exports.getRecommendation= async (req, res) => {
    try {
        const id = req.body.userId;
        console.log(req.body);
        const user = await User.findOne({ _id: id });
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
            data: recommendationsForUser,
        });
    } catch (err) {
        console.log(err.message)
        return res.status(400).json({
            success: false,
            message: "No user found."
        })
    }
}
