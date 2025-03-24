const User = require("../models/user.models.js");
const Event = require("../models/event.models.js");
const Tag = require("../models/tag.models.js");
const { putRecommendationsForUser } = require("../utils/cache.js");

const options = { fullDocument: "updateLookup" };
const pipeline = [];
exports.watchUsers = () => {
    User.watch(pipeline, options).on("change", async next => {
        switch (next.operationType) {
            case "insert":
            case "update":
                const user = next.fullDocument.populate('tags');
                const events = await Event.find().populate('tags')
                    .populate('user', 'name')
                    .populate('tasks');
                const recommendationsForUser = new Set();
                for (const event of events) {
                    var matchedTags = 0;
                    for (const tag of event.tags) {
                        var hasTag = false;
                        for (const userTag of user.tags) {
                            if (userTag.name === tag.name) {
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
                var recommendationsForUserAsArray = Array.from(recommendationsForUser);
                recommendationsForUserAsArray.sort((a, b) => {
                    return b.matchedTags - a.matchedTags;
                })
                putRecommendationsForUser(user, recommendationsForUserAsArray);
                break;
        }
    })
}
