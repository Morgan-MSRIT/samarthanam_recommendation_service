const User = require("../models/user.models.js");
const Event = require("../models/event.models.js");
const Tag = require("../models/tag.models.js");

const recommendations = {}

exports.initializeCache = async () =>  {
    const users = await User.find();
    const events = await Event.find();
    for (const user of users) {
        var recommendationsForUser = new Set();
        for (const event of events) {
            var matchedTags = 0;
            for (const tag of event.tags) {
                var hasTag = false;
                for (const userTag of user.tags) {
                    const tagSchema = await Tag.findOne({ _id: tag });
                    const userTagSchema = await Tag.findOne({ _id: userTag });
                    if (tagSchema.name === userTagSchema.name) {
                        hasTag = true;
                        break;
                    }
                }
                if (!hasTag) {
                    continue;
                }
                matchedTags += 1;
            }
            recommendationsForUser.add({ matchedTags: matchedTags, eventId: event._id.toString() });
        }
        const recommendationsForUserAsArray = Array.from(recommendationsForUser);
        recommendationsForUserAsArray.sort((a, b) => {
            return b.matchedTags - a.matchedTags;
        })
        recommendations[user._id] = recommendationsForUserAsArray;
    }
    console.log(recommendations);
}

exports.getRecommendationsForUser = user => {
    return recommendations[user._id];
}

exports.putRecommendationsForUser = (user, recommendation) => {
    recommendations[user._id] = recommendation;
    console.log("New recommendations added for user.");
    console.log(recommendations);
}
