Template.notifications.helpers({
    notifications: function() {
        // subscription return only current user's notifications
        return Notifications.find({read: false});
    }
});

Template.notifications.events({
    'click a': function() {
        Notifications.update(this._id, {$set: {read: true}});
    }
});
