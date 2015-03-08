// Shared MongoDB tables
// (for local collections, define inside client/)
Posts = new Mongo.Collection('posts');

// needed without 'insecure' (write access)
// The operation is only permitted to go through if either:
// - At least one allow callback returns true.
// - No deny callback returns true.
var ownDoc = function(userId, doc) {
    return userId == doc.userId;
}
var admin = function(userId, doc) {
    return !! Meteor.users.findOne({_id: userId}).admin;
}

Posts.allow({
    insert: function(userId, doc) {
        return (!! userId) || admin(userId, doc);
    },
    remove: function(userId, doc) {
        return ownDoc;
    }
});

Meteor.methods({
    "post_insert": function(post) {
        if (! Meteor.user())
            throw new Meteor.Error(401, "You need to login to add posts.");
        if (! post.title)
            throw new Meteor.Error(422, "Please fill in a title.");
        if (! post.url)
            throw new Meteor.Error(422, "Please fill in a url.");
        var postedBefore = Posts.findOne({url: post.url});
        if (postedBefore)
            throw new Meteor.Error(302, "This link is already added",
                                   postedBefore._id);

        Posts.insert({
            title: post.title,
            url: post.url,
            message: post.message,
            author: Meteor.user().username,
            userId: Meteor.user()._id,
            created: new Date().getTime(),
            updated: new Date().getTime(),
            commentsCount: 0,   // denormalised from Comments
            upvoters: [],
            votes: 0            // denormalised from upvotes field
                                // to be able to hide that list
        });
    },

    "post_update": function(post) {
        if (! Meteor.user())
            throw new Meteor.Error(401, "You need to login to update posts.");
        if (! post.title)
            throw new Meteor.Error(422, "Please fill in a title.");
        if (! post.url)
            throw new Meteor.Error(422, "Please fill in a url.");

        var postData = {
            title: post.title,
            url: post.url,
            message: post.message,
            updated: new Date().getTime()
        };
        Posts.update(post._id, {$set: postData});
    },

    "post_upvote": function(id) {
        if (!Meteor.user())
            throw new Meteor.Error(401, "You need to login to upvote");
        //if (post.upvoters && _.contains(post.upvoters, Meteor.userId()))
        //    throw new Meteor.Error(422, "Already upvoted, cheater!");

        // only update when not voted yet
        Posts.update({_id: id},{ //, upvoters: {$ne: Meteor.userId()}},{
            $addToSet: {upvoters: Meteor.userId()},
            $inc: {votes: 1}
        });
    },

    "make_many_posts": function() {
        var now = new Date().getTime();
        for (var i = 0; i < 100; i++) {
            var pid = Posts.insert({
                title: 'Test post #' + i,
                author: "Martijn",
                userId: "6PEzbGjnm2Lbm23jz",
                url: 'http://google.com/?q=test-' + i,
                submitted: now - i * 3600 * 1000,
                commentsCount: 0,
                upvoters: [],
                votes: 0
            });
            for (var j=0; j<Math.round(50*Math.random()); j++)
                Meteor.call("comment_insert", {
                    postId: pid,
                    body: "This is a comment."
                });
        }
    }
});
