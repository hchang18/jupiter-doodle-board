////////// Canvas area where you can draw ////////// 

// make connetion to the server
var socket = io.connect('https://jupiter-doodle-board.herokuapp.com/');
// var socket = io.connect('http://localhost:5000');
socket.on('canvas-data', (data) => {
    console.log("new drawing");

    ctx.strokeStyle = data.stroke_style;
    ctx.lineWidth = data.line_width;

    ctx.beginPath();
    ctx.moveTo(data.last_x, data.last_y);
    ctx.lineTo(data.curr_x, data.curr_y);
    ctx.stroke();

})

socket.on('reset', (data) => {
    console.log("reset");
    ctx.fillStyle = data.fill_style;
    ctx.fillRect(0, 0, data.width, data.height);
})

// Set up the canvas
const canvas = document.getElementById("jsCanvas");
const ctx = canvas.getContext("2d");

const CANVAS_SIZE = 1500;
canvas.width = CANVAS_SIZE;
canvas.height = CANVAS_SIZE;

const INITIAL_COLOR = "#2c2c2c"
const BACKGROUND_COLOR = "white";

ctx.fillStyle = BACKGROUND_COLOR;
ctx.fillRect(0, 0, canvas.width, canvas.height);
ctx.strokeStyle = INITIAL_COLOR;
// ctx.fillStyle = INITIAL_COLOR;
ctx.lineWidth = 2.5;


// Set up mouse events for drawing 
let drawing = false; 
var mousePos = { x: 0, y: 0 };
var lastPos = mousePos;

canvas.addEventListener("mousedown", function (e) {
    drawing = true;
    lastPos = getMousePos(canvas, e);
    // console.log("mousedown: ", drawing)
}, false);
canvas.addEventListener("mouseup", function (e) {
    drawing = false;
    // console.log("drawing: ", drawing);
}, false);

canvas.addEventListener("mousemove", function (e) {
    mousePos = getMousePos(canvas, e);
    
    ctx.beginPath();
    // console.log("mousemove drawing:", drawing);
    if (drawing && !filling) {
        
        console.log('sending: ' + mousePos.x + " , " + mousePos.y);

        var data = {
            last_x: lastPos.x,
            last_y: lastPos.y,
            curr_x: mousePos.x,
            curr_y: mousePos.y,
            stroke_style: ctx.strokeStyle,
            line_width: ctx.lineWidth,
        }

        socket.emit('canvas-data', data);

        ctx.moveTo(lastPos.x, lastPos.y);
        ctx.lineTo(mousePos.x, mousePos.y);
        ctx.stroke();
        lastPos = mousePos;

    }
}, false);


// Set up touch event for drawing
canvas.addEventListener("touchstart", function (e) {
    e.preventDefault();
    mousePos = getTouchPos(canvas, e);
    var touch = e.touches[0];
    var mouseEvent = new MouseEvent("mousedown", {
        clientX: touch.clientX,
        clientY: touch.clientY
    });
    canvas.dispatchEvent(mouseEvent);
}, false);

canvas.addEventListener("touchend", function (e) {
    e.preventDefault();
    var mouseEvent = new MouseEvent("mouseup", {});
    canvas.dispatchEvent(mouseEvent);
}, false);

canvas.addEventListener("touchmove", function (e) {
    e.preventDefault();
    var touch = e.touches[0];
    var mouseEvent = new MouseEvent("mousemove", {
        clientX: touch.clientX,
        clientY: touch.clientY
    });
    canvas.dispatchEvent(mouseEvent);
}, false);


// Get the position of the mouse relative to the canvas
function getMousePos(canvasDom, mouseEvent) {
    var rect = canvasDom.getBoundingClientRect();
    return {
        x: mouseEvent.clientX - rect.left,
        y: mouseEvent.clientY - rect.top
    };
}

function getTouchPos(canvasDom, touchEvent) {
    var rect = canvasDom.getBoundingClientRect();
    return {
        x: touchEvent.touches[0].clientX - rect.left,
        y: touchEvent.touches[0].clientY - rect.top
    };
}


// Set up UI
const colors = document.getElementsByClassName("jsColor");
const range = document.getElementById("jsRange");
const drawMode = document.getElementById("jsDraw");
const fillMode = document.getElementById("jsPaint");
const eraseMode = document.getElementById("jsEraser");
const saveBtn = document.getElementById("jsSave");
const newBtn = document.getElementById("jsNew");


let filling = false; 

Array.from(colors).forEach(color =>
    color.addEventListener("click", function (event) { 
        const color = event.target.style.backgroundColor;
        ctx.strokeStyle = color;
        ctx.fillStyle = color;
        ctx.lineWidth = 2.5;
    })
);

range.addEventListener("input", (event) => {
    size = event.target.value;
    ctx.lineWidth = size; 
});

drawMode.addEventListener("click", (event) => { 
    filling = false;
    ctx.strokeStyle = INITIAL_COLOR;
    ctx.lineWidth = 2.5;
});

fillMode.addEventListener("click", (event) => { 
    ctx.fillRect(0, 0, canvas.width, canvas.height); 
});


eraseMode.addEventListener("click", (event) => {
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 50;
});

canvas.addEventListener("contextmenu", (event) => { 
    event.preventDefault();
})

saveBtn.addEventListener("click", (event) => { 
    const image = canvas.toDataURL();
    const link = document.createElement("a");
    // instead of href, it can be downloaded
    // this attribute instructs browsers to download a URL
    // instead of navigating to it
    link.href = image;
    link.download = "cool-doodle";
    link.click(); 
});

newBtn.addEventListener("click", (event) => {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    var data = {
        fill_style: ctx.fillStyle,
        width: canvas.width,
        height: canvas.height
    }

    socket.emit('reset', data);

});

// Get the modal
var modal = document.getElementById("myModal");

// Get the button that opens the modal
var btn = document.getElementById("myBtn");

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];

// When the user clicks on the button, open the modal
btn.onclick = function() {
  modal.style.display = "block";
}

// When the user clicks on <span> (x), close the modal
span.onclick = function() {
  modal.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
}
