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
    
    // Event listeners for arrow key presses
    document.addEventListener('keydown', function(event) {
        switch(event.key) {
            case 'ArrowUp':
                moveUp = true;
                break;
            case 'ArrowDown':
                moveDown = true;
                break;
            case 'ArrowLeft':
                moveLeft = true;
                break;
            case 'ArrowRight':
                moveRight = true;
                break;
        }
    });

    document.addEventListener('keyup', function(event) {
        switch(event.key) {
            case 'ArrowUp':
                moveUp = false;
                break;
            case 'ArrowDown':
                moveDown = false;
                break;
            case 'ArrowLeft':
                moveLeft = false;
                break;
            case 'ArrowRight':
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
});

