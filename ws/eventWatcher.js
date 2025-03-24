const Event = require("../models/event.models.js");
const User = require("../models/user.models.js");
const Tag = require("../models/tag.models.js");
const { getRecommendationsForUser, putRecommendationsForUser } = require("../utils/cache.js");

const options = { fullDocument: "updateLookup" };
const pipeline = [];
exports.watchEvents = () => {
    Event.watch(pipeline, options).on("change", async next => {
        switch (next.operationType) {
            case "insert":
            case "update":
                const event = next.fullDocument.populate('tags')
                    .populate('user', 'name')
                    .populate('tasks');
                const users = await User.find().populate('tags');
                for (const user of users) {
                    const recommendationsForUser = getRecommendationsForUser(user);
                    if (recommendationsForUser === undefined) {
                        continue;
                    }

                    const recommendationsForUserAsSet = new Set(recommendationsForUser);
                    
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
                    for (const recommendation of recommendationsForUserAsSet) {
                        if (recommendation.eventId === event._id.toString()) {
                            recommendationsForUserAsSet.delete(recommendation);
                            break;
                        }
                    }
                    recommendationsForUserAsSet.add({ matchedTags: matchedTags, event: event });
                    const recommendationsForUserAsArray = Array.from(recommendationsForUserAsSet);
                    recommendationsForUserAsArray.sort((a, b) => {
                        return b.matchedTags - a.matchedTags;
                    })

                    putRecommendationsForUser(user, recommendationsForUserAsArray)
                }
                break;
        }
    });
}
