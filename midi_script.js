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

function handleMIDIMessage(message) {
    const data = message.data;
    const command = data[0];
    const note = data[1];
    const velocity = data[2];

    if (command === 144 && velocity > 0) {
        playNote(note, velocity);
    } else if (command === 128 || (command === 144 && velocity === 0)) {
        stopNote();
    }
}

const audioContext = new (window.AudioContext || window.webkitAudioContext)();
let oscillator;

function playNote(note, velocity) {
    oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.type = 'sine';  // You can change this to 'square', 'sawtooth', 'triangle'
    oscillator.frequency.setValueAtTime(midiNoteToFrequency(note), audioContext.currentTime);
    gainNode.gain.setValueAtTime(velocity / 127, audioContext.currentTime);

    oscillator.start();
}

function stopNote() {
    if (oscillator) {
        oscillator.stop();
        oscillator.disconnect();
    }
}

function midiNoteToFrequency(note) {
    return 440 * Math.pow(2, (note - 69) / 12);
}
