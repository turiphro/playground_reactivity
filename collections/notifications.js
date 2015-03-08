Notifications = new Mongo.Collection("notifications");

var ownDoc = function(userId, doc) {
    return userId == doc.userId;
}

Notifications.allow({
    insert: function() { return true; },
    update: ownDoc
});

createCommentNotification = function(comment, message, route) {
    var post = Posts.findOne({_id: comment.postId});
    if (comment.userId != post.userId) {
        Notifications.insert({
            userId: post.userId,
            authorId: comment.userId,
            author: comment.author,
            message: message,
            route: route,
            data: {
                _id: post._id
            },
            read: false
        });
    }
};

