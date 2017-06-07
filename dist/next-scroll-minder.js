(function () {

  var global = global || this;

  var nx = global.nx || require('next-js-core2');
  var NxStore = nx.Store ||  require('next-store');
  var NxDomEvent = nx.dom.Event ||  require('next-dom-event');
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
        this._loadRes = NxDomEvent.on(window,'load',function(){
          this.scrollToRestored();
        });
        this[attachMethod]();
      },
      attachNative:function(){
        var self = this;
        this._scrollRes = NxDomEvent.on( global, 'scroll',function(){
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
        var stored = NxStore.get(this.STORE_KEY);
        var scrollTop = nx.isUndefined(inValue) ? stored[ this.url ] : inValue;
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
      }
    }
  });


  if (typeof module !== 'undefined' && module.exports) {
    module.exports = NxScrollMinder;
  }

}());