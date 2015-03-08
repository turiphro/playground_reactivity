Comments = new Mongo.Collection('comments');

Comments.allow({
    insert: function(userId, doc) {
        return !! userId;
    }
});

Meteor.methods({
    comment_insert: function(comment) {
        var user = Meteor.user();
        var post = Posts.findOne(comment.postId);

        if (!user)
            throw new Meteor.Error(401, "You need to login to comment.");
        if (!post)
            throw new Meteor.Error(422, "You must comment on a post.");
        if (!comment.body)
            throw new Meteor.Error(422, "Please write some content.");

        comment = _.extend(comment, {
            userId: user._id,
            author: user.username, // denormalised (copied) field
            submitted: new Date().getTime()
        });
        comment._id = Comments.insert(comment);

        if (comment._id) {
            // update commentsCount
            Posts.update({_id: comment.postId}, {$inc: {commentsCount: 1}});
            // 'send' notification to post owner
            createCommentNotification(comment, "commented on your post", "postPage");
        }


        return comment._id;
    }
});
