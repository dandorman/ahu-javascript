define(["../utils/pubsub"], function(pubsub) {
  var publish = pubsub.publish,
      subscribe = pubsub.subscribe;

  function SharedLinkCollection(pendingLinkCollection) {
    this.items = [];

    this.publish = publish;

    subscribe(pendingLinkCollection, "remove", (function(self) {
      return function(link) {
        self.add(link);
      };
    })(this));
  }

  SharedLinkCollection.prototype.add = function(link) {
    this.items.push(link);
    this.publish("add", link);
  };

  return SharedLinkCollection;
});

