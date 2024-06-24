document.addEventListener('DOMContentLoaded', function() {
    const player = document.getElementById('player');
    const gameContainer = document.querySelector('.game-container');
    
    // Initial player position
    let playerX = 50;
    let playerY = 50;
    
    // Movement direction flags
    let moveUp = false;
    let moveDown = false;
    let moveLeft = false;
    let moveRight = false;
    
    // Update player position function
    function updatePlayerPosition() {
        player.style.transform = `translate(${playerX}px, ${playerY}px)`;
    }
    
    // Move player function
    function movePlayer() {
        if (moveUp) {
            playerY -= 5; // Adjust the speed as per your requirement
        }
        if (moveDown) {
            playerY += 5;
        }
        if (moveLeft) {
            playerX -= 5;
        }
        if (moveRight) {
            playerX += 5;
        }
        updatePlayerPosition();
    }
    
    // Event listeners for custom keys (W, A, S, D) presses
    document.addEventListener('keydown', function(event) {
        switch(event.key) {
            case 'w':
                moveUp = true;
                break;
            case 's':
                moveDown = true;
                break;
            case 'a':
                moveLeft = true;
                break;
            case 'd':
                moveRight = true;
                break;
        }
    });

    document.addEventListener('keyup', function(event) {
        switch(event.key) {
            case 'w':
                moveUp = false;
                break;
            case 's':
                moveDown = false;
                break;
            case 'a':
                moveLeft = false;
                break;
            case 'd':
                moveRight = false;
                break;
        }
    });

    // Update player position continuously
    function gameLoop() {
        movePlayer();
        requestAnimationFrame(gameLoop);
    }
    
    // Start the game loop
    gameLoop();

    // MIDI functionality
    if (navigator.requestMIDIAccess) {
        navigator.requestMIDIAccess().then(onMIDISuccess, onMIDIFailure);
    } else {
        alert("WebMIDI is not supported in this browser.");
    }

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

        // Map specific MIDI notes to movement directions
        if (command === 144 && velocity > 0) { // Note on
            switch (note) {
                case 60: // C4
                    moveUp = true;
                    break;
                case 62: // D4
                    moveDown = true;
                    break;
                case 64: // E4
                    moveLeft = true;
                    break;
                case 65: // F4
                    moveRight = true;
                    break;
            }
        } else if (command === 128 || (command === 144 && velocity === 0)) { // Note off
            switch (note) {
                case 60: // C4
                    moveUp = false;
                    break;
                case 62: // D4
                    moveDown = false;
                    break;
                case 64: // E4
                    moveLeft = false;
                    break;
                case 65: // F4
                    moveRight = false;
                    break;
            }
        }
    }
});
