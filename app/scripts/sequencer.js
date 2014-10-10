(function (window, document) {
    'use strict';
    
    var Sequencer = function (options) {
		this.options = options || {};
        this.fps     = this.options.fps || 50;
        this.canvas  = this.options.canvas || document.getElementById('canvas');
        this.x       = this.options.x || 0;
        this.y       = this.options.y || 0;
        this.width   = this.options.width || false;
        this.height  = this.options.height || false;
        this.data    = {};
        this.ctx     = this.canvas.getContext('2d');
        this.playing = false;
        this.current = 0;
        this.total   = 0;
        this.loops   = 1;
        this.image   = new Image();
        window.raf   = window.requestAnimationFrame;
        window.caf   = window.cancelAnimationFrame;
        
        return this;
	};
	Sequencer.prototype.constructor = Sequencer;
    
    Sequencer.prototype.loadSequence = function(name, sequence) {
        var that = this;
        
        sequence = sequence || this.sequence;
        name     = name || 'default';
            
        this.get(sequence, function(data){
            that.data[name] = eval( data );
            var event = new CustomEvent('loaded', {'detail' : {'sequence' : name}});
            that.canvas.dispatchEvent(event);
        });
        
        return this;
    };

    Sequencer.prototype.play = function(name, loop) {
        var that = this;
        
        if (typeof this.data[name] === 'undefined') {
            return false;
        }
        
        this.loop            = loop;
        this.total           = this.data[name].length;
        this.current         = 0;
        this.loops           = 0;
        this.currentSequence = name || 'default';
        this.playing         = true;
        this.time            = new Date().getTime();

        this.af = window.raf(function(){
            that.draw();
        });
        
        return this;
    };
    
    Sequencer.prototype.reverse = function(name, loop) {
        if (typeof this.data[name] === 'undefined') {
            return false;
        }
        
        this.data[name].reverse();
        
        return this.play(name, loop);
    };
    
    Sequencer.prototype.get = function (url, callback) {
        try {
            var x = new (window.XMLHttpRequest || window.ActiveXObject)('MSXML2.XMLHTTP.3.0');
            x.open('GET', url, true);
            x.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
            x.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
            x.onreadystatechange = function () {
                return x.readyState > 3 && callback && callback(x.responseText, x);
            };
            x.send(null);
        } catch (e) {
            return window.console && console.log('Ajax request failed', e);
        }
    };

    
    Sequencer.prototype.stop = function(){
        window.caf(this.af);
        this.playing = false;
        this.data = [];
        
        return this;
    };

    Sequencer.prototype.draw = function() {
        if (! this.playing ) {
            return false;
        }

        var now     = new Date().getTime(),
            dt      = now - this.time,
            that    = this,
            stopEv;

        this.af = window.raf(function(){
            that.draw();
        });

        if (dt < this.fps) {
            return false;
        }

        this.time = now;

        if (this.current === this.total && this.loop) {
            this.current = 0;
            this.loops ++;
            stopEv  = new CustomEvent('stopped', {'detail' : {'sequence' : this.currentSequence, 'loops' : this.loops}});
            this.canvas.dispatchEvent(stopEv);
            return false;
        }

        if (this.current === this.total && !this.loop){
            window.caf(this.af);
            this.playing = false;
            this.current = 0;
            stopEv  = new CustomEvent('stopped', {'detail' : {'sequence' : this.currentSequence, 'loops' : this.loops}});
            this.canvas.dispatchEvent(stopEv);
            return false;
        }

        
        this.image.onload = function() {
            that.ctx.clearRect(0, 0, that.canvas.width, that.canvas.height);
            if (that.width && that.height) {
                that.ctx.drawImage(that.image, that.x, that.y, that.width, that.height);
            } else {
                that.ctx.drawImage(that.image, that.x, that.y);
            }
        };
        this.image.onerror = function(e) {
            console.error('Image failed to load', e);
        }
        
        this.image.src = this.data[this.currentSequence][this.current];
        if (this.image.complete) {
            this.image.onload();
        }
        
        this.current++;
    };

    //CustomEvent polyfill
    (function () {
        function CustomEvent ( event, params ) {
          params = params || { bubbles: false, cancelable: false, detail: undefined };
          var evt = document.createEvent( 'CustomEvent' );
          evt.initCustomEvent( event, params.bubbles, params.cancelable, params.detail );
          return evt;
         }

        CustomEvent.prototype = window.Event.prototype;

        window.CustomEvent = CustomEvent;
    })();
    
    //requestAnimationFrame polyfill
    (function() {
        var lastTime = 0;
        var vendors = ['webkit', 'moz'];
        for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
            window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
            window.cancelAnimationFrame =
              window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelRequestAnimationFrame'];
        }

        if (!window.requestAnimationFrame) {
            window.requestAnimationFrame = function(callback) {
                var currTime = new Date().getTime();
                var timeToCall = Math.max(0, 16 - (currTime - lastTime));
                var id = window.setTimeout(function() { callback(currTime + timeToCall); },
                  timeToCall);
                lastTime = currTime + timeToCall;
                return id;
            };
        }

        if (!window.cancelAnimationFrame) {
            window.cancelAnimationFrame = function(id) {
                clearTimeout(id);
            };
        }
    }());
    
    window.Sequencer = Sequencer;
    
})(window, document);