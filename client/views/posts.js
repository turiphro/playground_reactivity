/* postsList */
Template.postsList.helpers({
    // moved most to router
    posts: function() {
        // override original posts; rank needed for swap animations
        this.posts.rewind();
        return this.posts.map(function(post, index, cursor) {
            post._rank = index;
            return post;
        });
    },
    hasMorePosts: function() {
        this.posts.rewind();
        return Router.current().limit() == this.posts.count();
    },
    activeRouteClass: function(name) {
        return Router.current().route.getName() == name ? "active" : "";
    }
});

Template.postsList.rendered = function() {
    // animate posts when order changes
    // note: only seems to work on first edit

    this.find('.wrapper')._uihooks = {
        insertElement: function (node, next) {
          $(node)
              .hide()
              .insertBefore(next)
              .fadeIn();
        },
        moveElement: function (node, next) {
            var $node = $(node), $next = $(next);
            var oldTop = $node.offset().top;
            var height = $(node).outerHeight(true);
            
            // find all the elements between next and node
            var $inBetween = $(next).nextUntil(node);
            if ($inBetween.length === 0)
                $inBetween = $(node).nextUntil(next);
            
            // now put node in place
            $(node).insertBefore(next);
            
            // measure new top
            var newTop = $(node).offset().top;
            
            // move node *back* to where it was before
            $(node)
                .removeClass('animate')
                .css('top', oldTop - newTop);
            
            // push every other element down (or up) to put them back
            $inBetween
                .removeClass('animate')
                .css('top', oldTop < newTop ? height : -1 * height)
            
            // force a redraw
            $(node).offset();
            
            // reset everything to 0, animated
            $(node).addClass('animate').css('top', 0);
            $inBetween.addClass('animate').css('top', 0);
      },
      removeElement: function(node) {
          $(node).fadeOut(function() {
              $(this).remove();
          });
      }
    }
}


/* postItem */
Template.postItem.helpers({
    domain: function() {
        var a = document.createElement('a');
        a.href = this.url;
        return a.hostname;
    },
    ownPost: function() {
        return this.userId == Meteor.userId();
    },
    upvotedClass: function() {
        if (Meteor.userId() && !_.contains(this.upvoters, Meteor.userId()))
            return "btn-primary upvotable";
        else
            return "disabled"; // thu shall not vote
    }
});

Template.postItem.events({
    "click .delete": function (event) {
        event.preventDefault();
        if (confirm("Delete this awesome post?")) {
            // the data update will update the UI automatically
            Posts.remove(event.target.id);
            Router.go('postsList');
        }
    },

    "click .upvotable": function (event) {
        event.preventDefault();
        Meteor.call('post_upvote', this._id, function(error) {
            if (error)
                throwError(error.reason);
        });
    }
});

Template.postPage.helpers({
    comments: function() {
        return Comments.find({postId: this._id});
    }
});

Template.postForm.events({
    "submit #post_form": function (event) {
        event.preventDefault();

        var post = {
            // note: for ID, can also request second fn parameter 'template'
            // and access template.data._id
            _id: $(event.target).find('[name=_id]').val(),
            title: event.target.title.value,
            url: event.target.url.value
        };

        if (post._id) {
            Meteor.call('post_update', post, function(error, id) {
                if (error) {
                    throwError(error.reason);
                } else {
                    // forward to index page
                    Router.go('postPage', {_id: post._id});
                }
            });
        } else {
            Meteor.call('post_insert', post, function(error, id) {
                if (error) {
                    throwError(error.reason);
                    if (error.error == 302)
                        // if exists, forward to existing post
                        Router.go('postPage', {_id: error.details});
                } else {
                    // allow for next input
                    $(event.target).find('[name=_id]').val("");
                    event.target.title.value = "";
                    event.target.url.value = "";
                }
            });
        }
    }
});

