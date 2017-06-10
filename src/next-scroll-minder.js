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
          if (this._isNative) {
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
      _isNative: false,
      STORE_KEY: '__NX_SCROLL_REMINDER_CACHE__',
      init: function () {
        this._store = new NxUrlStore(this.STORE_KEY);
      },
      attach: function (inScroller) {
        var isNative = this._isNative = inScroller === global;
        var attachMethod = isNative ? 'attachNative' : 'attachSimulate';
        this._scroller = inScroller;
        nx.bindAll(['globalLoaded', 'scrollToRestored', 'delayStore'], this);
        this.globalLoaded();
        //attach events:
        this.attachEvents();
        //attach to scroll:
        this._scrollRes = this[attachMethod]();
      },
      attachEvents: function () {
        this._loadRes = NxDomEvent.on(window, 'load', this.globalLoaded);
        this._hashchangeRes = NxDomEvent.on(window, 'hashchange', this.globalLoaded);
        this._popstateRes = NxDomEvent.on(window, 'popstate', this.globalLoaded);
        this._pageshowRes = NxDomEvent.on(window, 'pageshow', this.globalLoaded);
      },
      attachNative: function () {
        return NxDomEvent.on(global, 'scroll', this.delayStore);
      },
      attachSimulate: function () {
        return this._scroller.on('scroll', this.delayStore);
      },
      globalLoaded: function () {
        !this._loaded && this.scrollToRestored();
        // this._loaded = true;
      },
      scrollToRestored: function (inValue) {
        var stored = this._store.session;
        var scrollTop = stored.scrollTop || 0;
        var value = nx.isNumber(inValue) || 0;
        scrollTop = scrollTop || value;

        this._manual = scrollTop !== 0;
        this._scroller.scrollTo(0, scrollTop, false);
      },
      delayStore: NxDebounceThrottle.debounce(function () {
        this.store(this.scrollTop);
        this._manual = false;
      }, 100, NxScrollMinder),
      store: function (inValue) {
        if (!this._manual) {
          this._store.session = {
            scrollTop: inValue
          };
        }
      },
      destroy: function () {
        this._scrollRes && this._scrollRes.destroy();
        this._loadRes.destroy();
        this._hashchangeRes.destroy();
        this._popstateRes.destroy();
        this._pageshowRes.destroy();
      }
    }
  });


  if (typeof module !== 'undefined' && module.exports) {
    module.exports = NxScrollMinder;
  }

}());
