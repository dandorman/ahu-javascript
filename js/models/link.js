define(["../utils/pubsub"], function(pubsub) {
  var publish = pubsub.publish;

  function Link(properties) {
    this.properties = properties;
    this.properties.likes = 0;

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

  Link.prototype.like = function() {
    this.set("likes", this.get("likes") + 1);
  };

  return Link;
});

