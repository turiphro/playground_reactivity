Template.shoutbox.helpers({
    shouts: function() {
        return Shouts.find({},
            {sort: {created: -1}, limit: 15}
        ).fetch().reverse();
    }
});

Template.shoutbox.events({
    "submit #new_shout": function (event) {
        event.preventDefault();

        var shout = {
            content: event.target.content.value,
        };
        Meteor.call('shout_insert', shout, function(error, id) {
            if (error)
                throwError(error.reason);
        });

        event.target.content.value = "";
    }
});
