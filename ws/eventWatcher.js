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
                const event = next.fullDocument;
                const users = await User.find();
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
                    for (const recommendation of recommendationsForUserAsSet) {
                        if (recommendation.eventId === event._id.toString()) {
                            recommendationsForUserAsSet.delete(recommendation);
                            break;
                        }
                    }
                    recommendationsForUserAsSet.add({ matchedTags: matchedTags, eventId: event._id.toString() });
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
