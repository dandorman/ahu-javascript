define(["../utils/pubsub"], function(pubsub) {
  var subscribe = pubsub.subscribe;

  function SharedLinkView(link) {
    this.link = link;

    subscribe(this.link, "set", (function(self) {
      return function(property, value) {
        if (property === "likes") {
          self.updateLikes();
        }
      };
    })(this));
  }

  SharedLinkView.prototype.render = function() {
    this.$el = $(this.template(this.link.properties));
    this.$el.on("click", "a", (function(self) {
      return function(e) {
        e.stopPropagation();
        e.preventDefault();

        self.like();
      };
    })(this));
    return this.$el;
  };

  SharedLinkView.prototype.like = function() {
    this.link.like();
  };

  SharedLinkView.prototype.updateLikes = function() {
    this.$el.find(".likes .count").text(this.link.get("likes"));
  };

  return SharedLinkView;
});

