document.getElementById('start-button').addEventListener('click', () => {
    if (navigator.requestMIDIAccess) {
        navigator.requestMIDIAccess().then(onMIDISuccess, onMIDIFailure);
    } else {
        alert("WebMIDI is not supported in this browser.");
    }
});

function onMIDISuccess(midiAccess) {
    for (let input of midiAccess.inputs.values()) {
        input.onmidimessage = handleMIDIMessage;
    }
}

function onMIDIFailure() {
    alert("Could not access your MIDI devices.");
}

const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const oscillators = {};

function handleMIDIMessage(message) {
    const data = message.data;
    const command = data[0];
    const note = data[1];
    const velocity = data[2];

    if (command === 144 && velocity > 0) {
        playNote(note, velocity);
    } else if (command === 128 || (command === 144 && velocity === 0)) {
        stopNote(note);
    }
}

function playNote(note, velocity) {
    if (!oscillators[note]) {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.type = 'sine';  // You can change this to 'square', 'sawtooth', 'triangle'
        oscillator.frequency.setValueAtTime(midiNoteToFrequency(note), audioContext.currentTime);
        gainNode.gain.setValueAtTime(velocity / 127, audioContext.currentTime);

        oscillator.start();

        oscillators[note] = { oscillator, gainNode };
    }
}

function stopNote(note) {
    if (oscillators[note]) {
        const { oscillator, gainNode } = oscillators[note];
        gainNode.gain.setValueAtTime(0, audioContext.currentTime + 0.1);  // Fade out
        oscillator.stop(audioContext.currentTime + 0.1);
        oscillator.disconnect();
        delete oscillators[note];
    }
}

function midiNoteToFrequency(note) {
    return 440 * Math.pow(2, (note - 69) / 12);
}
