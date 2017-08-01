(function () {

  var global = global || this;

  var nx = global.nx || require('next-js-core2');
  var NxDomEvent = (nx.dom && nx.dom.Event) || require('next-dom-event');
  var document = global.document;
  var NxDebounceThrottle = nx.DebounceThrouttle || require('next-debounce-throttle');
  var NxUrlStore = nx.UrlStore || require('next-url-store');

  var NxScrollMinder = nx.declare('nx.ScrollMinder', {
    properties: {
      scrollTop: {
        get: function () {
          if (this._isWindow) {
            return document.documentElement.scrollTop || document.body.scrollTop || 0;
          } else {
            return this._scroller.getValues().top;
          }
        }
      }
    },
    statics: {
      _scroller: null,
      _manual: false,
      _loaded: false,
      _isWindow: false,
      init: function () {
        this._store = new NxUrlStore('__NX_SCROLL_REMINDER_CACHE__');
      },
      attach: function (inScroller) {
        var isWindow = this._isWindow = inScroller === global;
        var attachMethod = isWindow ? 'attachNative' : 'attachSimulate';
        this._scroller = inScroller;
        nx.binds(this, ['globalLoaded', 'scrollToRestored', 'delayStore']);

        this.globalLoaded();
        //attach to scroll:
        this._scrollRes = this[attachMethod]();
      },
      attachNative: function () {
        return NxDomEvent.on(global, 'scroll', this.delayStore);
      },
      attachSimulate: function () {
        return this._scroller.on('scroll', this.delayStore);
      },
      globalLoaded: function () {
        if (!this._loaded) {
          this.scrollToRestored();
          this._loaded = true;
        }
      },
      scrollToRestored: function (inValue) {
        var stored = this._store.session;
        var scrollTop = stored.scrollTop || 0;
        var value = nx.isNumber(inValue) || 0;
        scrollTop = scrollTop || value;

        this._scroller.scrollTo(0, scrollTop, false);
      },
      delayStore: NxDebounceThrottle.debounce(function () {
        var self = NxScrollMinder;
        self.store(self.scrollTop);
        self._manual = false;
      }, 100),
      store: function (inValue) {
        if (!this._manual) {
          this._store.session = {
            scrollTop: inValue
          };
        }
      },
      destroy: function () {
        this._scrollRes && this._scrollRes.destroy();
      }
    }
  });


  if (typeof module !== 'undefined' && module.exports) {
    module.exports = NxScrollMinder;
  }

}());
