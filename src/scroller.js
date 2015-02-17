var React = require('react');
var RectCache = require('./rect-cache');

var ZingaScroller = require('../vendor/zynga.scroller.js');

var Scroller = React.createClass({

  mixins: [RectCache],

  childContextTypes: {
    scrollingParent: React.PropTypes.object,
  },

  getChildContext: function() {
    return {
      scrollingParent: this,
    };
  },

  propTypes: {
    scrollingX: React.PropTypes.bool.isRequired,
    scrollingY: React.PropTypes.bool.isRequired,
    getContentSize: React.PropTypes.func.isRequired,
  },

  _scrollItems: {},

  registerItem: function(scrollableItem) {
    this._scrollItems[scrollableItem.props.name] = scrollableItem;
  },

  _scrollHandler: function(x, y) {
    /*jshint ignore:start */
    var items = this._scrollItems;
    for(var item in items) {
      items[item]._scrollTo(x, y);
    }
    /*jshint ignore:end */
  },

  componentDidMount: function () {
    var self = this;
    var container = this.getDOMNode();

    var scroller = (self.scroller = new ZingaScroller(
      self._scrollHandler,
      {
        scrollingX: self.props.scrollingX,
        scrollingY: self.props.scrollingY,
      }
    ));

    // Because of React batch operations and optimizations, we need to wait
    // for next tick in order to all ScrollableItems initialize and have proper
    // RectCache before updating containerSizer for the first time.
    setTimeout(function() {
      var content = self.props.getContentSize();
      self.scroller.setDimensions(self.rect.width, self.rect.height, content.width, content.height);
    }, 1);

    // setup events
    container.addEventListener("touchstart", function(e) {
      if (e.touches[0] && e.touches[0].target && e.touches[0].target.tagName.match(/input|textarea|select/i)) {
        return;
      }
      var isMoving = !scroller.__isDragging || !scroller.__isDecelerating || !scroller.__isAnimating;
      if (isMoving) {
        e.preventDefault();
        e.stopPropagation();
      }
      scroller.doTouchStart(e.touches, e.timeStamp);
    }, false);
    container.addEventListener("touchmove", function(e) {
      e.preventDefault(); // unconditionally to prevent React onScroll handlers
      var isMoving = !scroller.__isDragging || !scroller.__isDecelerating || !scroller.__isAnimating;
      if (isMoving) {
        e.stopPropagation();
      }
      scroller.doTouchMove(e.touches, e.timeStamp, e.scale);
    }, false);

    container.addEventListener("touchend", function(e) {
      var isMoving = !scroller.__isDragging || !scroller.__isDecelerating || !scroller.__isAnimating;
      if (isMoving) {
        e.preventDefault();
        e.stopPropagation();
      }
      scroller.doTouchEnd(e.timeStamp);
    }, false);
    container.addEventListener("touchcancel", function(e) {
      var isMoving = !scroller.__isDragging || !scroller.__isDecelerating || !scroller.__isAnimating;
      if (isMoving) {
        e.preventDefault();
        e.stopPropagation();
      }
      scroller.doTouchEnd(e.timeStamp);
    }, false);
  },

  render: function () {
    var className = 'scrollable';
    if (this.props.hasOwnProperty('viewport')) {
      className += '-viewport';
    }
    return (
      <div className={className}>
        {this.props.children}
      </div>
    );
  },

});

module.exports = Scroller;