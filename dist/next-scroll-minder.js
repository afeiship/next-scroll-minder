(function () {

  var global = global || this;

  var nx = global.nx || require('next-js-core2');
  var NxStore = nx.Store ||  require('next-store');
  var NxDomEvent = (nx.dom && nx.dom.Event) ||  require('next-dom-event');
  var document = global.document;
  var isNative = function(inValue){
    return inValue === global;
  };

  var NxScrollMinder = nx.declare('nx.ScrollMinder', {
    properties:{
      url:{
        get: function(){
          return global.location.href;
        }
      },
      nativeScrollTop:{
        get: function(){
          return document.documentElement.scrollTop || document.body.scrollTop || 0;
        }
      }
    },
    statics:{
      _cache:{},
      _scroller: null,
      STORE_KEY:'nx_scroll_reminder_cache',
      attach: function(inScroller){
        var attachMethod = inScroller === global ? 'attachNative' : 'attachSimulate';
        this._scroller = inScroller;
        nx.bindAll(['scrollToRestored'],this);
        this._loadRes = NxDomEvent.on(window,'load',this.scrollToRestored);
        this._hashchangeRes = NxDomEvent.on(window,'hashchange',this.scrollToRestored);
        this._popstateRes = NxDomEvent.on(window,'popstate',this.scrollToRestored);
        this._pageshowRes = NxDomEvent.on(window,'pageshow',this.scrollToRestored);
        this._scrollRes = this[attachMethod]();
      },
      attachNative:function(){
        var self = this;
        return NxDomEvent.on( global, 'scroll',function(){
          self.store( self.nativeScrollTop );
        });
      },
      attachSimulate: function(){
        var self = this;
        this._scroller.on('scroll',function(inValues){
          self.store( inValues.top );
        });
      },
      scrollToRestored: function(inValue){
        var cache = NxStore.session;
        var stored = cache[this.STORE_KEY];
        var storedTop = stored ? stored [ this.url ] : 0;
        var scrollTop = nx.isUndefined(inValue) ? storedTop : inValue;
        this._scroller.scrollTo(0, scrollTop ,false);
      },
      store: function(inValue){
        var stored = {};
        this._cache [ this.url ] = inValue;
        stored[this.STORE_KEY] = this._cache;
        NxStore.session = stored;
      },
      destroy: function(){
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
