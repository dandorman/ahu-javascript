define(["../utils/pubsub", "./pending_link_view"], function(pubsub, PendingLinkView) {
  var subscribe = pubsub.subscribe;

  function PendingLinkCollectionView(collection, $el) {
    this.collection = collection;
    this.$el = $el;

    subscribe(this.collection, "add", (function(self) {
      return function(link) {
        self.addPendingLink(link);
      };
    })(this));
  }

  PendingLinkCollectionView.prototype.addPendingLink = function(link) {
    var pendingLinkView = new PendingLinkView(link);
    this.$el.append(pendingLinkView.render());
  };

  return PendingLinkCollectionView;
});

