const User = require("../models/user.models.js");
const Event = require("../models/event.models.js");

const recommendations = {}

exports.initializeCache = async () =>  {
    // TODO: Sort events for a particular user using the number of tags that are matched.
    const users = await User.find();
    const events = await Event.find();
    for (const user of users) {
        recommendations[user] = new Set();
        for (const event of events) {
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
                recommendations[user].add(event);
                break;
            }
        }
    }
    console.log(recommendations);
}

exports.getRecommendationsForUser = user => {
    return recommendations[user];
}

exports.putRecommendationsForUser = (user, events) => {
    recommendations[user] = events;
    console.log("New recommendations added for user.");
    console.log(recommendations);
}
