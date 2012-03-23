define(["../utils/pubsub", "./shared_link_view"], function(pubsub, SharedLinkView) {
  var subscribe = pubsub.subscribe;

  function SharedLinkCollectionView(collection, $el) {
    this.collection = collection;
    this.$el = $el;

    subscribe(this.collection, "add", (function(self) {
      return function(link) {
        self.addSharedLink(link);
      };
    })(this));
  }

  SharedLinkCollectionView.prototype.addSharedLink = function(link) {
    var sharedLinkView = new SharedLinkView(link);
    this.$el.append(sharedLinkView.render());
  };

  return SharedLinkCollectionView;
});

