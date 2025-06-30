// ==== 🔧 Config & Globals ==== //
const totalBrushes = 30;
let brushImages = [];
let brushSounds = [];
let currentBrush = 0;
let thumbnailSize = 40;
let saveButton, resetButton;
let database, drawingRef;

// ✅ Replace with your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAzI3_tm8jgRIu7UR-Mn78wZfgYcwSXwfQ",
  authDomain: "collaborative-drawing-sound.firebaseapp.com",
  projectId: "collaborative-drawing-sound",
  storageBucket: "collaborative-drawing-sound.firebasestorage.app",
  messagingSenderId: "993511016512",
  appId: "1:993511016512:web:f7aa39d3b0157dbf0af7a5",
  measurementId: "G-8BDRMY7BZY"
};

// ==== 📦 Preload Brushes & Sounds ==== //
function preload() {
  for (let i = 0; i < totalBrushes; i++) {
    brushImages[i] = loadImage(`brush${i + 1}.jpg`);
    brushSounds[i] = loadSound(`sound${i + 1}.mp3`);
  }
}

// ==== ⚙️ Setup ==== //
function setup() {
  createCanvas(windowWidth, windowHeight);
  background(255);
  imageMode(CENTER);
  textFont('Arial');
  textSize(16);
  fill(0);

  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  database = firebase.database();
  drawingRef = database.ref('sharedDrawing');

  drawingRef.on('child_added', drawRemote);
  drawingRef.on('child_removed', () => background(255));

  // Buttons
  saveButton = createButton('💾 Save');
  saveButton.position(10, thumbnailSize + 85);
  saveButton.mousePressed(() => saveCanvas('shared_drawing', 'png'));

  resetButton = createButton('🔄 Reset');
  resetButton.position(90, thumbnailSize + 85);
  resetButton.mousePressed(resetCanvas);
}

// ==== 🖌️ Drawing Loop ==== //
function draw() {
  drawBrushThumbnails();
  drawInstructions();

  if (mouseIsPressed && mouseY > thumbnailSize + 10) {
    const pos = { x: mouseX, y: mouseY, brush: currentBrush };
    drawStamp(pos);
    sendStamp(pos);
  }
}

// ==== 🖼️ Thumbnails & Instructions ==== //
function drawBrushThumbnails() {
  noStroke();
  for (let i = 0; i < totalBrushes; i++) {
    let x = 10 + i * (thumbnailSize + 5);
    image(brushImages[i], x + thumbnailSize / 2, thumbnailSize / 2 + 5, thumbnailSize, thumbnailSize);
    if (i === currentBrush) {
      stroke(255, 0, 0);
      noFill();
      rect(x, 5, thumbnailSize, thumbnailSize);
    }
  }
}

function drawInstructions() {
  noStroke();
  fill(255, 255, 255, 180);
  rect(10, thumbnailSize + 50, 460, 30);
  fill(0);
  text("Click a brush thumbnail to select and start its sound.", 20, thumbnailSize + 70);
}

// ==== 🖱️ User Interaction ==== //
function mousePressed() {
  userStartAudio();

  for (let i = 0; i < totalBrushes; i++) {
    let x = 10 + i * (thumbnailSize + 5);
    if (mouseX >= x && mouseX <= x + thumbnailSize &&
        mouseY >= 5 && mouseY <= 5 + thumbnailSize) {
      currentBrush = i;

      if (brushSounds[i] && brushSounds[i].isLoaded() && !brushSounds[i].isPlaying()) {
        brushSounds[i].loop(); // <-- sound starts and loops until reset
      }

      break;
    }
  }
}

function keyPressed() {
  if (key === 's' || key === 'S') {
    saveCanvas('shared_drawing', 'png');
  }
}

// ==== 🎨 Drawing Logic ==== //
function drawStamp(data) {
  if (brushImages[data.brush]) {
    image(brushImages[data.brush], data.x, data.y, 30, 30);
  }
}

function sendStamp(data) {
  drawingRef.push(data);
}

function drawRemote(data) {
  const d = data.val();
  drawStamp(d);
}

// ==== 🔄 Reset Logic ==== //
function resetCanvas() {
  background(255);
  currentBrush = 0;
  stopAllSounds();
  drawingRef.remove();
}

function stopAllSounds() {
  for (let s of brushSounds) {
    if (s.isPlaying()) s.stop();
  }
}
