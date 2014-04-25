$(function(){
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
});