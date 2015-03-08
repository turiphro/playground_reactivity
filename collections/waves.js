Waves = new Mongo.Collection('waves');

Waves.allow({
    insert: function(userId, doc) { return !! userId; },
    update: function(userId, doc) { return !! userId; },
});

Meteor.methods({
    "wave_save": function(wave) {
        console.log("inside wave_save");
        console.log(wave);
        var id;

        if (wave._id) {
            // update existing wave
            wave.updated = new Date().getTime()
            id = wave._id;
            delete wave._id;
            Waves.update(id, {'$set': wave});
            console.log("updating", id);
        } else {
            // insert new wave
            if ('content' in wave && wave.content) {
                if ('_id' in wave)
                    delete wave._id;
                wave.created = new Date().getTime()
                wave.updated = new Date().getTime()
                wave.name = Meteor.user() && Meteor.user().username || 'anonymous',
                console.log("inserting");
                id = Waves.insert(wave);
            }
        }

        return id;
    }
});
