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

    const messageText = `Command: ${command}, Note: ${note}, Velocity: ${velocity}`;
    const messageElement = document.createElement('li');
    messageElement.textContent = messageText;

    document.getElementById('messages').appendChild(messageElement);
}
