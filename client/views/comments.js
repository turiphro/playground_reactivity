Template.comment.helpers({
    createdText: function() {
        return new Date(this.created).toString();
    }
});

Template.commentForm.events({
    "submit #comment_form": function (event, template) {
        event.preventDefault();
        var comment = {
            body: event.target.body.value,
            postId: template.data._id
        };

        Meteor.call('comment_insert', comment, function(error, commentId) {
            if (error)
                throwError(error.reason);
            else
                event.target.body.value = "";
        });
    }
});
