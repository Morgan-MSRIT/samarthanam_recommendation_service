const User = require("../models/user.models.js");
const Event = require("../models/event.models.js");
const Task = require("../models/task.models.js");

const recommendations = {}

exports.initializeCache = async () =>  {
    const users = await User.find().populate('tags');
    const events = await Event.find()
      .populate('tags')
      .populate('user', 'name')
      .populate('tasks');
    for (const user of users) {
        var recommendationsForUser = new Set();
        for (const event of events) {
            var matchedTags = 0;
            for (const tag of event.tags) {
                var hasTag = false;
                for (const userTag of user.tags) {
                    if (tag.name === userTag.name) {
                        hasTag = true;
                        break;
                    }
                }
                if (!hasTag) {
                    continue;
                }
                matchedTags += 1;
            }
            recommendationsForUser.add({ matchedTags: matchedTags, event: event });
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
