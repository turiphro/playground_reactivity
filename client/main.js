// Without autopublish, we need to subscribe
// to data publications manually:
// (note: can also be added to lib/router.js in waitOn fn
// for all layouts or particular layout with parameter)
Meteor.subscribe('waves');
Meteor.subscribe('shouts');
// Note: also needs Meteor.publish() on the server

Accounts.ui.config({
    passwordSignupFields: 'USERNAME_ONLY'
});

// Header
Template.header.helpers({
    pageTitle: function() { return Session.get('pageTitle') || 'Playground'; }
});

// Errors
// local collection (no sync): defined inside client/ with empty name
Errors = new Meteor.Collection(null);

throwError = function(message) {
    Errors.insert({message: message, seen: false});
};

clearErrors = function() {
    Errors.remove({seen: true});
};

Template.errors.helpers({
    errors: function() { return Errors.find(); }
});

Template.error.rendered = function() {
    // note: don't put any code sensitive to #calls (like analytics):
    // the rendered function might be called multiple times
    // during dynamic partial template updates
    Meteor.defer(function() { // do after 1ms (if no redirect)
        Errors.update({_id: this.data._id}, {$set: {seen: true}});
    });
};

// register global template helpers
Handlebars.registerHelper('pluralize', function(n, thing) {
    // simple pluralizer
    if (n === 1) {
        return '1 ' + thing;
    } else {
        return n + ' ' + thing + 's';
    }
});
