// Key format: Feed:[guid]
var Feed = function (attributes) {
  this.uuid = attributes.uuid || null;
  this.source = attributes.source || null;
  this.feed = attributes.feed || null;
};

module.exports = Feed;
