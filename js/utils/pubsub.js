define({
  publish: function(event) {
    var args = Array.prototype.slice.call(arguments, 1);

    this.subscribers = this.subscribers || {};
    this.subscribers[event] = this.subscribers[event] || [];

    this.subscribers[event].forEach(function(callback) {
      setTimeout(function() {
        callback.apply(null, args);
      }, 1);
    });
  },

  subscribe: function(object, event, callback) {
    if (!object.subscribers) object.subscribers = {};
    if (!object.subscribers[event]) object.subscribers[event] = [];

    object.subscribers[event].push(callback);
  }
});

