const Event = require("../models/event.models.js");
const User = require("../models/user.models.js");
const { getRecommendationsForUser, putRecommendationsForUser } = require("../utils/cache.js");

exports.watchEvents = () => {
    Event.watch().on("change", async next => {
        switch (next.operationType) {
            case "insert":
            case "update":
                // TODO: Sort events for a particular user using the number of tags that are matched.
                const event = next.fullDocument;
                const users = User.find();
                for (const user of users) {
                    const recommendationsForUser = getRecommendationsForUser(user);
                    if (recommendationsForUser == null) {
                        continue;
                    }
                    
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

                        recommendationsForUser.add(event);
                        break;
                    }

                    putRecommendationsForUser(user, recommendationsForUser)
                }
                break;
        }
    });
}
