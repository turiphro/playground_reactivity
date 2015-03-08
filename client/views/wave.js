Template.waves.helpers({
    waves_before_me: function() {
        var filter = {};
        var me_id = Session.get('current_wave_id');
        if (me_id) {
            var me = Waves.findOne({_id: me_id});
            if (me)
                filter = {'created': {'$lt': me.created}};
        }
        return Waves.find(filter,
            {sort: {created: -1}, limit: 10}
        ).fetch().reverse();
    },

    waves_after_me: function() {
        var filter = {};
        var me_id = Session.get('current_wave_id');
        if (me_id) {
            var me = Waves.findOne({_id: me_id});
            if (me) {
                filter = {'created': {'$gt': me.created}};
                return Waves.find(filter);
            }
        }
        return [];
    },

    no_current_wave: function() {
        return ! Session.get('current_wave_id');
    }
});

Template.wave.helpers({
    current_wave: function() {
        return Session.get('current_wave_id') == this._id;
    }
});

Template.waves.events({
    "submit #current_wave": function (event) {
        event.preventDefault();
        // already saved and cleared by last keyup
    },

    "keyup #wave_text": function (event) {
        var _id = Session.get('current_wave_id'); // if set, will update
        if (! _id && Session.get('waiting_for_wave_id')) {
            // still waiting for first call to return
            return;
        }
        if (! _id)
            // first-time call
            Session.set('waiting_for_wave_id', true);
        var wave = {
            content: event.target.value,
            _id: Session.get('current_wave_id'), // if set, will update
            finished: (event.keyCode == 13)
        };

        Meteor.call('wave_save', wave, function(error, id) {
            if (error)
                throwError(error.reason);
            if (! wave.finished) {
                Session.set('current_wave_id', id);
                Session.set('waiting_for_wave_id', false);
            }
        });

        if (wave.finished) {
            // cleanup
            event.target.value = "";
            Session.set('current_wave_id', undefined);
            Session.set('waiting_for_wave_id', false);
        }
    }
});


Template.currentWave.rendered = function() {
    $('#wave_text').focus();
};
