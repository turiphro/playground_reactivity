if (Posts.find().count() === 0) {
    Posts.insert({
        title: 'Introducing Telescope',
        author: 'Sacha Greif',
        url: 'http://sachagreif.com/introducing-telescope/'
    });
    Posts.insert({
        title: 'Meteor',
        author: 'Tom Coleman',
        url: 'http://meteor.com'
    });
}

