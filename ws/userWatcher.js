const User = require("../models/user.models.js");
const Event = require("../models/event.models.js");
const { putRecommendationsForUser } = require("../utils/cache.js");

exports.watchUsers = () => {
    User.watch().on("change", async next => {
        switch (next.operationType) {
            case "insert":
            case "update":
                // TODO: Sort events for user using the number of tags that are matched.
                const user = next.fullDocument;
                const events = await Event.find();
                const recommendationsForUser = new Set();
                for (const userTag of user.tags) {
                    for (const event of events) {
                        var hasTag = false;
                        for (const tag of event.tags) {
                            if (userTag.name === tag.name) {
                                hasTag = true;
                                break;
                            }
                        }
                        if (!hasTag) {
                            continue;
                        }
                        recommendationsForUser.add(event);
                    }
                }
                putRecommendationsForUser(user, recommendationsForUser);
                break;
        }
    })
}
