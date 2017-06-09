(function () {

  var global = global || this;

  var nx = global.nx || require('next-js-core2');
  var NxStore = nx.Store || require('next-store');
  var NxDomEvent = (nx.dom && nx.dom.Event) || require('next-dom-event');
  var document = global.document;
  var NxDebounceThrottle = nx.DebounceThrouttle || require('next-debounce-throttle');

  var NxScrollMinder = nx.declare('nx.ScrollMinder', {
    properties: {
      url: {
        get: function () {
          return global.location.href;
        }
      },
      scrollTop: {
        get: function(){
          if(this._isNative){
            return document.documentElement.scrollTop || document.body.scrollTop || 0;
          }else{
            return this._scroller.getValues().top;
          }
        }
      }
    },
    statics: {
      _cache: {},
      _scroller: null,
      _manual: false,
      _isNative: false,
      STORE_KEY: '__NX_SCROLL_REMINDER_CACHE__',
      attach: function (inScroller) {
        var isNative = this._isNative = inScroller === global;
        var attachMethod = isNative ? 'attachNative' : 'attachSimulate';
        this._scroller = inScroller;
        nx.bindAll(['scrollToRestored','delayStore'], this);
        //scroll to restored if has loaed:
        this.scrollToRestored();
        //attach events:
        this.attachEvents();
        //attach to scroll:
        this._scrollRes = this[attachMethod]();
      },
      attachEvents: function () {
        this._loadRes = NxDomEvent.on(window, 'load', this.scrollToRestored);
        this._hashchangeRes = NxDomEvent.on(window, 'hashchange', this.scrollToRestored);
        this._popstateRes = NxDomEvent.on(window, 'popstate', this.scrollToRestored);
        this._pageshowRes = NxDomEvent.on(window, 'pageshow', this.scrollToRestored);
      },
      attachNative: function () {
        return NxDomEvent.on( global, 'scroll', this.delayStore);
      },
      attachSimulate: function () {
        return this._scroller.on('scroll', this.delayStore);
      },
      scrollToRestored: function (inValue) {
        var cache = NxStore.session;
        var stored = cache[this.STORE_KEY];
        var storedTop = stored ? stored [this.url] : 0;
        var scrollTop = nx.isNumber(storedTop) ? storedTop : inValue;
        scrollTop = scrollTop || 0;

        this._manual = scrollTop !== 0;
        this._scroller.scrollTo(0, scrollTop, false);
      },
      delayStore: NxDebounceThrottle.debounce(function(){
        this.store(this.scrollTop);
        this._manual = false;
      },100, NxScrollMinder),
      store: function (inValue) {
        if (!this._manual) {
          var stored = {};
          var session = NxStore.session;
          this._cache [this.url] = inValue;
          stored[this.STORE_KEY] = nx.mix( session[this.STORE_KEY], this._cache );
          NxStore.session = stored;
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
