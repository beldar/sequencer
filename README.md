# Image Sequencer

Image sequence player, by transforming images encoded in base64 into js files and plotting them into a canvas element.

## Summary

The code can be found in `sequencer.js` or `sequencer.min.js`.

The idea is to use something like the `/compiler.php` to encode a sequence of images into base64 strings and
put them into an array inside a js file, that way you only load one file per sequence instead of all the images one by one.

Obviously this technique is required for a large sequence of images, when putting them in a sprite is not practical.

It doesn't have any other library dependecies.

Checkout the demo [here](http://www.martiplanellas.info/sequencer/)

## Install

### Using bower

    bower install sequencerjs --save
    
### Using script

    <script type="text/javascript" src="sequencer/sequencer.min.js"></script>

## Usage

### Using compiler.php

This little php script found in the root of this project, is a helper that will take a folder of png images, and output a js file containing an array with all the base64 encode of those images.

The usage is as follows:

    php compiler.php "/path/to/pngs" "file_name.js"


### Using the library

Create new sequencer like this

`var s = new Sequencer();`

You can pass the following options (default values shown):

    var s = new Sequencer({
        fps : 50,
        canvas : document.getElementById('canvas')
    });

Then you have to load a sequence and give it a name:

    s.loadSequence('breathing', 'scripts/breath_sequence.js');
    
And you can listen to the loaded event, and then you can play it as a loop (or not):

    s.canvas.addEventListener('loaded', function(e){
        console.log('Sequence Loaded: '+e.detail.sequence);
        if (e.detail.sequence === 'breathing') {
            console.log('Playing breathing, loop: true');
            s.play('breathing', true);
        } 
    });

You can also listen to the 'stopped' event, which fires when the sequence is done or if its
a loop every time it repeats a loop 

Here's a more complete example (that you can find in `/app/scripts/main.js`):

    var s = new Sequencer();
    s.loadSequence('breathing', 'scripts/breath_sequence.js');
    s.canvas.addEventListener('loaded', function(e){
        console.log('Sequence Loaded: '+e.detail.sequence);
        if (e.detail.sequence === 'breathing') {
            console.log('Playing breathing, loop: true');
            s.play('breathing', true);
        } 
    });
    s.loadSequence('negative', 'scripts/negative_sequence.js');
    s.loadSequence('positive', 'scripts/positive_sequence.js');
    s.canvas.addEventListener('stopped', function(e){
        if (e.detail.sequence === 'breathing' && e.detail.loops === 2) {
            console.log('Breathing stopped after playing 2 loops, playing negative, loop: false');
            s.play('negative', false);
        }
        if (e.detail.sequence === 'negative') {
            console.log('Negative stopped, playing positive, loop: false');
            s.play('positive', false);
        }
        if (e.detail.sequence === 'positive') {
            console.log('Positive stopped, playing breathing, loop: false');
            s.play('breathing', true);
        }
    });

## Browser support

It uses canvas to render the images, so all modern browser work.

Since IE8 doesn't support canvas, IE support is >IE9.


## Installation of the Demo

Dependencies
------------

You have to have installed [bower](http://bower.io/), and [compass](http://compass-style.org/install/). To install the first two you'll need [node](http://nodejs.org/) too.

Install
-------

Once you have all those and cloned the repo, go to the root of the project and run:

    bower install
    
That will download all the js and css dependencies of the project.

Then run:

    npm install
    
This will download all the node dependencies (including grunt)

Finally you can launch the demo running:

    grunt serve
    
You can build the project ready for production like this:

    grunt build
    
That will leave everything ready on the `/dist` folder