Router.configure({
    // use template 'layout'
    layoutTemplate: 'layout',
    loadingTemplate: 'loading', // show while waitOn runs
    waitOn: function() {
        return [
            Meteor.subscribe('waves'),
            Meteor.subscribe('notifications')
        ];
    },
    progressDelay: 20
});

// in template, {{< yield}} will include second argument's template
Router.route('/', {name: 'index'});

PostsListController = RouteController.extend({
    template: 'postsList',
    increment: 5,
    limit: function() { return parseInt(this.params.limit || this.increment); },
    findOptions: function() {
        // Use find query for both subscription (server) AND local data
        // (to match order);
        return {sort: this.sort, limit: this.limit()};
    },
    waitOn: function() {
        // TODO: somehow, page is refreshing when user re-routed to nextPath
        return Meteor.subscribe('posts', this.findOptions());
    },
    data: function() {
        return {
            posts: Posts.find({}, this.findOptions()),
            nextPath: this.route.path({limit: this.limit() + this.increment})
        }
    }
});

NewPostsListController = PostsListController.extend({
    sort: {created: -1, _id: -1}
});

BestPostsListController = PostsListController.extend({
    sort: {votes: -1, created: -1, _id: -1}
});

Router.route('postsListBest', {
    path: '/posts/best/:limit?',
    controller: BestPostsListController
});

Router.route('postsList', {
    path: '/posts/:limit?',
    controller: NewPostsListController
});

Router.route('/post/last', {
    template: 'postPage',
    //TODO: broken, add subscription with $sort to get latest
    data: function() { return Posts.find().fetch().reverse()[0]; }
});
/* alternative: (but 'name' not defined for pathFor)
Router.route('/post/last', function() {
    var post = Posts.find().fetch().reverse()[0];
    this.render('postItem', {data: post});
});
*/

Router.route('/post/:_id', {
    name: 'postPage', // also used as template by default
    waitOn: function() {
        // subscribe to post comments (note: this will introduce a
        // loading lag, but unavoidable unless all comments are
        // cached in frontend).
        return [
            Meteor.subscribe('comments', this.params._id),
            Meteor.subscribe('singlePost', this.params._id)
        ];
    },
    data: function() {
        return Posts.findOne(this.params._id);
    }
});

Router.route('/post/:_id/edit', {
    name: 'postEdit',
    waitOn: function() {
        return Meteor.subscribe('singlePost', this.params._id);
    },
    data: function() { return Posts.findOne(this.params._id); }
});

Router.route('/new', {name: 'postForm'});

var requireLogin = function() {
    if (! Meteor.user()) {
        this.render('accessDenied');
    } else {
        this.next();
    }
};

var before = function() {
    clearErrors();
    requireLogin();
};

Router.before(before, {only: 'postForm'});

// Shoutbox & Wave
Router.route('/shoutbox', {name: 'shoutbox'});
Router.route('/waves', {name: 'waves'});

