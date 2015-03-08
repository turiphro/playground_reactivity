Shouts = new Mongo.Collection('shouts');

var always = function(userId, doc) { return true; };
var never = function(userId, doc) { return false; };

Shouts.allow({
    insert: always
});

Meteor.methods({
    "shout_insert": function(shout) {
        Shouts.insert({
            name: Meteor.user() && Meteor.user().username || 'anonymous',
            content: shout.content,
            created: new Date().getTime()
        });
    }
});
