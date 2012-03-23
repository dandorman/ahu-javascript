define(["../utils/pubsub"], function(pubsub) {
  var subscribe = pubsub.subscribe;

  function PendingLinkView(link) {
    this.link = link;

    subscribe(this.link, "set", (function(self) {
      return function(property, value) {
        if (property === "id" && value) {
          self.$el.remove();
        }
      };
    })(this));
  }

  PendingLinkView.prototype.render = function() {
    this.$el = $(this.template(this.link.properties));
    return this.$el;
  };

  return PendingLinkView;
});

