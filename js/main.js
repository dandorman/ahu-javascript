$(function() {
  // publish/subscribe

  function publish(event) {
    var args = Array.prototype.slice.call(arguments, 1);

    this.subscribers = this.subscribers || {};
    this.subscribers[event] = this.subscribers[event] || [];

    this.subscribers[event].forEach(function(callback) {
      setTimeout(function() {
        callback.apply(null, args);
      }, 1);
    });
  }

  function subscribe(object, event, callback) {
    if (!object.subscribers) object.subscribers = {};
    if (!object.subscribers[event]) object.subscribers[event] = [];

    object.subscribers[event].push(callback);
  }

  // Link model

  function Link(properties) {
    this.properties = properties;

    this.publish = publish;
  }

  Link.prototype.set = function(property, value) {
    if (this.properties[property] !== value) {
      this.properties[property] = value;

      this.publish("set", property, value);
    }

    return value;
  };

  Link.prototype.get = function(property) {
    return this.properties[property];
  };

  // SharedLinkCollection collection

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

  // SharedLinkCollectionView view

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

  // SharedLinkView view

  function SharedLinkView(link) {
    this.link = link;
  }

  SharedLinkView.prototype.render = function() {
    this.$el = $(this.template(this.link.properties));
    return this.$el;
  };

  // PendingLinkCollection collection

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

  // PendingLinkCollectionView view

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

  // PendingLinkView view

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

  // main app setup and whatnot

  var link_info = (function() {
    var info = {
      "http://www.forbes.com/sites/juliabricklin/2012/03/20/why-amcs-the-walking-dead-could-be-the-perfect-tv-format/": {
        title: "Why AMC's 'The Walking Dead' Could Be The Perfect TV Format - Forbes",
        description: "Jon Bernthal/&#039;The Walking Dead&#039; Some fans were shocked when Shane was killed on The Walking Dead last week, but TV executives all over Hollywood were likely gleeful. Not because they don't like Jon Bernthal (the actor who played Shane), but because from a business point of view, The Walking Dead is a [...]",
        thumbnail_url: "http://blogs-images.forbes.com/thumbnails/blog_1897/pt_1897_510_o.jpg?t=1332282846"
      },

      "http://espn.go.com/new-york/nfl/story/_/id/7718133/tim-tebow-trade-hits-snag-contract-language-source-says": {
        title: "Jets And Tebow A Good Fit?",
        description: "After word spread rapidly Wednesday that the New York Jets had acquired quarterback Tim Tebow from Denver Broncos for draft picks, the teams have encountered a hang-up in the language in Tebow's contract that could nullify the trade, a Broncos source tells ESPN NFL Insider Adam Schefter.",
        thumbnail_url: "http://a.espncdn.com/media/motion/2012/0321/dm_120321_nfl_tebow_jets_fit.jpg"
      }
    };

    return function(url_fragment) {
      for (var url in info) {
        if (new RegExp(url_fragment.split('').join('.*')).test(url)) {
          var url_info = info[url];
          url_info.url = url;
          return url_info;
        }
      }
    };
  })();

  var pending_link_collection = new PendingLinkCollection(),
      pending_link_collection_view = new PendingLinkCollectionView(pending_link_collection, $("#pending-links")),
      shared_link_collection = new SharedLinkCollection(pending_link_collection),
      shared_link_collection_view = new SharedLinkCollectionView(shared_link_collection, $("#shared-links"));

  SharedLinkView.prototype.template = Mustache.compile($("#shared-link-template").html());
  PendingLinkView.prototype.template = Mustache.compile($("#pending-link-template").html());

  function add_pending_link(url) {
    var info = link_info(url);
    if (info) {
      var link = new Link(info);
      pending_link_collection.add(link);
    }
  }

  subscribe(pending_link_collection, "add", function(link) {
    setTimeout(function() {
      var info = link_info(link.get("url"));
      link.set("title", info.title);
      link.set("description", info.description);
      link.set("thumbnail_url", info.thumbnail_url);
      link.set("id", 1);
    }, 2000);
  });

  $("form").submit(function(e) {
    e.stopPropagation();
    e.preventDefault();

    var url = $(this).find(":text").val();
    add_pending_link(url);

    $(this).find(":text").val('');
  });
});

