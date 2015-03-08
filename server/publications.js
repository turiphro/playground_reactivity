// Without autopublish we need to publish
// cursors to data manually:
Meteor.publish('shouts', function() {
    // note: sorting here doesn't get re-evaluated after inserts it seems
    return Shouts.find(); //{}, {sort: {submitted: -10}});
});

Meteor.publish('waves', function() {
    return Waves.find();
});

Meteor.publish('posts', function(options) {
    var query = _.pick(options, ['limit', 'sort']);
    return Posts.find({}, query);
});

Meteor.publish('singlePost', function(id) {
    return id && Posts.find(id);
});

Meteor.publish('comments', function(postId) {
    return Comments.find({postId: postId});
});

Meteor.publish('notifications', function() {
    return Notifications.find({userId: this.userId});
});
