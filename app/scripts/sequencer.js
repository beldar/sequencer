function Sequencer(options) {
    this.options = options || {},
    this.fps     = this.options.fps || 50,
    this.canvas  = this.options.canvas || document.getElementById('canvas'),
    this.data    = {},
    this.ctx     = this.canvas.getContext('2d'),
    this.playing = false,
    this.current = 0,
    this.total   = 0,
    this.loops   = 1,
    this.image   = new Image(),
    window.raf   = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
                   window.webkitRequestAnimationFrame || window.msRequestAnimationFrame,

    window.caf   = window.cancelAnimationFrame || window.mozCancelAnimationFrame;
    this.time;

    this.loadSequence = function(name, sequence) {
        var that = this,
            sequence = sequence || this.sequence,
            name     = name || 'default';

        $.get(sequence, function(data){
            that.data[name] = eval(data);
            var event = new CustomEvent('loaded', {'detail' : {'sequence' : name}});
            that.canvas.dispatchEvent(event);
        });
    };

    this.play = function(name, loop) {
        var that = this;
        
        if (typeof this.data[name] === 'undefined')
            return false;
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
    };
    
    this.stop = function(){
        window.caf(this.af);
        this.playing = false;
        this.data = [];
    };

    this.draw = function() {
        if (! this.playing )
            return false;

        var now     = new Date().getTime(),
            dt      = now - this.time,
            that    = this,
            stopEv;

        this.af = window.raf(function(){
            that.draw();
        });

        if (dt < this.fps)
            return false;

        this.time = now;

        if (this.current === this.total && this.loop) {
            this.current = 0;
            this.loops ++;
            stopEv  = new CustomEvent('stopped', {'detail' : {'sequence' : this.currentSequence, 'loops' : this.loops}})
            this.canvas.dispatchEvent(stopEv);
        }

        if (this.current === this.total && !this.loop){
            window.caf(this.af);
            this.playing = false;
            this.current = 0;
            stopEv  = new CustomEvent('stopped', {'detail' : {'sequence' : this.currentSequence, 'loops' : this.loops}})
            this.canvas.dispatchEvent(stopEv);
        }

        this.image.src = this.data[this.currentSequence][this.current];
        this.image.onload = function() {
            that.ctx.clearRect(0, 0, that.canvas.width, that.canvas.height);
            that.ctx.drawImage(that.image, 0, 0);
            that.current++;
        };

    };

    //CustomEvent polyfill
    (function () {
        function CustomEvent ( event, params ) {
          params = params || { bubbles: false, cancelable: false, detail: undefined };
          var evt = document.createEvent( 'CustomEvent' );
          evt.initCustomEvent( event, params.bubbles, params.cancelable, params.detail );
          return evt;
         };

        CustomEvent.prototype = window.Event.prototype;

        window.CustomEvent = CustomEvent;
    })();
};