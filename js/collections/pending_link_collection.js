define(["../utils/pubsub"], function(pubsub) {
  var publish = pubsub.publish,
      subscribe = pubsub.subscribe;

  function PendingLinkCollection() {
    this.items = [];

    this.publish = publish;
  }

  PendingLinkCollection.prototype.add = function(link) {
    this.items.push(link);

    subscribe(link, "set", (function(self) {
      return function(property, value) {
        if (property === "id" && value) {
          self.remove(link);
        }
      };
    })(this));

    this.publish("add", link);
  };

  PendingLinkCollection.prototype.remove = function(link) {
    var index = this.items.indexOf(link);
    if (~index) {
      this.items.splice(index, 1);
      this.publish("remove", link);
    }
  };

  return PendingLinkCollection;
});

