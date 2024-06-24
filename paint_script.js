// Initialize canvas and context
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// Set canvas size
canvas.width = 800;
canvas.height = 600;

// Default drawing style
let currentTool = 'marker';
let currentColor = '#000000';
let currentSize = 5;

// Undo and redo stack
let undoStack = [];
let redoStack = [];

// Flag to track drawing state
let isDrawing = false;

// Variables to track last draw position
let lastX = 0;
let lastY = 0;

// Mouse event listeners
canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', endDrawing);
canvas.addEventListener('mouseleave', endDrawing);

// Tool buttons
const markerButton = document.getElementById('marker');
const fillButton = document.getElementById('fill');
const undoButton = document.getElementById('undo');
const redoButton = document.getElementById('redo');
const clearButton = document.getElementById('clear');
const colorPicker = document.getElementById('color-picker');
const brushSize = document.getElementById('brush-size');

markerButton.addEventListener('click', () => {
    currentTool = 'marker';
    canvas.style.cursor = 'crosshair';
    markerButton.classList.add('active');
    fillButton.classList.remove('active');
    undoButton.classList.remove('active');
    redoButton.classList.remove('active');
});

fillButton.addEventListener('click', () => {
    currentTool = 'fill';
    canvas.style.cursor = 'crosshair';
    fillButton.classList.add('active');
    markerButton.classList.remove('active');
    undoButton.classList.remove('active');
    redoButton.classList.remove('active');
});

undoButton.addEventListener('click', () => {
    if (undoStack.length > 0) {
        redoStack.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
        ctx.putImageData(undoStack.pop(), 0, 0);
    }
});

redoButton.addEventListener('click', () => {
    if (redoStack.length > 0) {
        undoStack.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
        ctx.putImageData(redoStack.pop(), 0, 0);
    }
});

clearButton.addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    undoStack = [];
    redoStack = [];
});

colorPicker.addEventListener('input', () => {
    currentColor = colorPicker.value;
});

brushSize.addEventListener('input', () => {
    currentSize = brushSize.value;
});

// Drawing functions
function startDrawing(e) {
    if (currentTool === 'fill') {
        const x = e.offsetX;
        const y = e.offsetY;
        const targetColor = getPixelColor(x, y);

        if (!colorMatch(targetColor, hexToRgb(currentColor))) {
            floodFill(x, y, targetColor, hexToRgb(currentColor));
        }
    } else {
        isDrawing = true;
        [lastX, lastY] = [e.offsetX, e.offsetY];
        ctx.lineCap = 'round';
        ctx.lineWidth = currentSize;

        if (currentTool === 'marker') {
            ctx.strokeStyle = currentColor;
            undoStack.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
            redoStack = []; // Clear redo stack on new drawing action
        }
    }
}

function draw(e) {
    if (!isDrawing || currentTool === 'fill') return;

    const x = e.offsetX;
    const y = e.offsetY;

    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(x, y);
    ctx.stroke();

    [lastX, lastY] = [x, y];
}

function endDrawing() {
    if (isDrawing || currentTool === 'fill') {
        isDrawing = false;
        ctx.beginPath(); // End current path
    }
}

function getPixelColor(x, y) {
    const pixelData = ctx.getImageData(x, y, 1, 1).data;
    return {
        r: pixelData[0],
        g: pixelData[1],
        b: pixelData[2],
        a: pixelData[3]
    };
}

function colorMatch(color1, color2) {
    return color1.r === color2.r &&
           color1.g === color2.g &&
           color1.b === color2.b &&
           color1.a === color2.a;
}

function floodFill(x, y, targetColor, fillColor) {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixelsToCheck = [[x, y]];

    while (pixelsToCheck.length > 0) {
        const [currentX, currentY] = pixelsToCheck.pop();

        if (currentX < 0 || currentX >= canvas.width || currentY < 0 || currentY >= canvas.height) continue;

        const currentIndex = (currentY * canvas.width + currentX) * 4;
        const currentColor = {
            r: imageData.data[currentIndex],
            g: imageData.data[currentIndex + 1],
            b: imageData.data[currentIndex + 2],
            a: imageData.data[currentIndex + 3]
        };

        if (colorMatch(currentColor, targetColor) && !colorMatch(currentColor, fillColor)) {
            imageData.data[currentIndex] = fillColor.r;
            imageData.data[currentIndex + 1] = fillColor.g;
            imageData.data[currentIndex + 2] = fillColor.b;
            imageData.data[currentIndex + 3] = fillColor.a;

            pixelsToCheck.push([currentX + 1, currentY]);
            pixelsToCheck.push([currentX - 1, currentY]);
            pixelsToCheck.push([currentX, currentY + 1]);
            pixelsToCheck.push([currentX, currentY - 1]);
        }
    }

    ctx.putImageData(imageData, 0, 0);
}

function hexToRgb(hex) {
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);

    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
        a: 255
    } : null;
}
