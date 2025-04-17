let grid = [];
let cols, rows;
let cellSize = 10; // px
let interactionActive = false;
let mouseInside = true;
let waves = [];

let canvas, canvasWrapper;
let cursorCheckbox;
let settingsButton, backButton, settingsPanel;
let activateOverlay;
let toolTip, toolTipText;
let pauseButton, exportButton;
let targetWidth, targetHeight;
let viewWidth, viewHeight;
let isPaused = false;

function getCanvasSize() {
  const container = document.getElementById("heatmap-container");
  const width = container.clientWidth;
  const height = Math.floor(width * 0.75); // 4:3 aspect ratio
  return { width, height };
}

function setup() {
  const { width, height } = getCanvasSize();
  targetWidth = Math.floor(width);
  targetHeight = Math.floor(height);
  viewWidth = targetWidth;
  viewHeight = targetHeight;

  pixelDensity(1);
  canvas = createCanvas(targetWidth, targetHeight);
  canvas.parent("heatmap-container");
  canvasWrapper = select("#heatmap-container");

  canvas.style("display", "block");
  canvas.style("background-color", "transparent");
  canvas.style("image-rendering", "pixelated");
  canvas.class("heatmap-canvas");

  colorMode(HSB, 360, 100, 100, 100);
  noStroke();
  updateGridDimensions();
  initGrid();

  activateOverlay = createButton("click to begin");
  activateOverlay.class("activate-button");
  activateOverlay.parent(canvasWrapper);
  activateOverlay.mousePressed(() => {
    interactionActive = true;
    activateOverlay.hide();
    settingsButton.show();
    toolTip.show();
  });

  // settings panel
  settingsPanel = createDiv();
  settingsPanel.class("settings-panel");
  settingsPanel.parent(canvasWrapper);
  settingsPanel.hide();

  // tooltips
  toolTip = createSpan("?");
  toolTip.class("info-icon top-left");
  toolTip.parent(canvasWrapper);
  toolTip.hide();
  toolTipText = createDiv(
    "this animation simulates the thermal imprint left by touch on a surface. <br><br>[LMB] heat wave <br>[space] clear canvas <br>[esc] exit"
  );
  toolTipText.class("info-box");
  toolTipText.parent(canvasWrapper);
  toolTipText.hide();
  toolTip.mouseOver(() => toolTipText.show());
  toolTip.mouseOut(() => toolTipText.hide());

  // settings toggle
  settingsButton = createButton("settings");
  settingsButton.class("settings-button top-right");
  settingsButton.parent(canvasWrapper);
  settingsButton.mousePressed(() => {
    settingsButton.hide();
    backButton.show();
    settingsPanel.show();
  });
  settingsButton.hide();

  // back
  backButton = createButton("back");
  backButton.class("settings-button top-right");
  backButton.parent(canvasWrapper);
  backButton.mousePressed(() => {
    settingsPanel.hide();
    backButton.hide();
    settingsButton.show();
  });
  backButton.hide();

  // cursor toggle
  cursorCheckbox = createCheckbox(" cursor", true);
  cursorCheckbox.class("settings-button");
  cursorCheckbox.parent(settingsPanel);
  cursorCheckbox.changed(() => {
    canvas.style("cursor", cursorCheckbox.checked() ? "default" : "none");
  });

  // pause button
  pauseButton = createButton("freeze");
  pauseButton.class("settings-button");
  pauseButton.parent(settingsPanel);
  pauseButton.mousePressed(() => {
    isPaused = !isPaused;
    pauseButton.html(isPaused ? "resume" : "freeze");
    isPaused ? noLoop() : loop();
  });

  // export button
  exportButton = createButton("export");
  exportButton.class("settings-button");
  exportButton.parent(settingsPanel);
  exportButton.mousePressed(() => {
    saveCanvas("heatmap", "png");
  });

  // mouse interaction
  canvas.mouseOver(() => (mouseInside = true));
  canvas.mouseOut(() => (mouseInside = false));
  canvas.mousePressed(() => {
    if (!interactionActive) return;
    let cx = floor(mouseX / (viewWidth / cols));
    let cy = floor(mouseY / (viewHeight / rows));
    if (cx >= 0 && cx < cols && cy >= 0 && cy < rows) {
      grid[cx][cy].intensity = 1;
      grid[cx][cy].hoverTime += 1;
      waves.push({ x: cx, y: cy, frame: 0 });
    }
  });
}

// window resizing
function windowResized() {
  const { width, height } = getCanvasSize();
  pixelDensity(1);
  targetWidth = Math.floor(width);
  targetHeight = Math.floor(height);
  resizeCanvas(targetWidth, targetHeight);
  updateGridDimensions();
  initGrid();
}
function updateGridDimensions() {
  cols = Math.floor(targetWidth / cellSize);
  rows = Math.floor(targetHeight / cellSize);
}

// clear grid
function initGrid() {
  grid = [];
  for (let i = 0; i < cols; i++) {
    grid[i] = [];
    for (let j = 0; j < rows; j++) {
      grid[i][j] = { intensity: 0, hoverTime: 0 };
    }
  }
}

// draw canvas
function draw() {
  background('black');
  viewWidth = lerp(viewWidth, targetWidth, 0.15);
  viewHeight = lerp(viewHeight, targetHeight, 0.15);
  push();
  translate((width - viewWidth) / 2, (height - viewHeight) / 2);
  scale(viewWidth / targetWidth, viewHeight / targetHeight);
  fill(0, 0, 0, 10);
  rect(0, 0, targetWidth, targetHeight);

  let newGrid = [];
  for (let i = 0; i < cols; i++) {
    newGrid[i] = [];
    for (let j = 0; j < rows; j++) {
      let cell = grid[i][j];
      let sumIntensity = cell.intensity;
      let sumTime = cell.hoverTime;
      let count = 1;

      for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
          let ni = i + dx;
          let nj = j + dy;
          if (ni >= 0 && ni < cols && nj >= 0 && nj < rows && !(dx === 0 && dy === 0)) {
            sumIntensity += grid[ni][nj].intensity;
            sumTime += grid[ni][nj].hoverTime;
            count++;
          }
        }
      }
      // 'heat' intensity settings
      let avgIntensity = sumIntensity / count;
      let avgTime = sumTime / count;
      let newIntensity = lerp(cell.intensity, avgIntensity, 0.2) * 0.999;
      /* lerp() is a p5.js function that interpolates between two values.
      newIntensity = lerp(a, b, c) * d, where:
      a = cell.intensity, the current intensity of the cell
      b = avgIntensity, the average intensity of the cell and its neighbors
      c = lerp factor, the amount of interpolation (default = 0.2)
      d = multiplier, the rate of decay (default = 0.999) */

      // mouse hover updates
      let newTime = lerp(cell.hoverTime, avgTime, 0.3);
      newTime += cell.intensity * 1.5 - (1 - cell.intensity) * 0.4;
      newTime = constrain(newTime, 0, 300);

      newGrid[i][j] = {
        intensity: constrain(newIntensity, 0, 1),
        hoverTime: newTime,
      };
    }
  }
  grid = newGrid;

  if (interactionActive && mouseInside) {
    let cx = floor(mouseX / (viewWidth / cols));
    let cy = floor(mouseY / (viewHeight / rows));
    if (cx >= 0 && cx < cols && cy >= 0 && cy < rows) {
      grid[cx][cy].intensity = 1;
      grid[cx][cy].hoverTime += 1;
    }
  }

  for (let w = waves.length - 1; w >= 0; w--) {
    let wave = waves[w];
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        let d = dist(i, j, wave.x, wave.y);
        if (abs(d - wave.frame) < 1) {
          grid[i][j].intensity = max(grid[i][j].intensity, 0.2);
          grid[i][j].hoverTime += 0.2;
        }
      }
    }
    wave.frame += 1;
    if (wave.frame > cols + rows) waves.splice(w, 1);
  }

  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      const cell = grid[i][j];
      const hue = map(cell.hoverTime, 0, 30, 240, 0, true);
      const brightness = map(cell.intensity, 0, 1, 0, 100);
      fill(hue, 100, brightness, 100);
      rect(i * cellSize, j * cellSize, cellSize, cellSize);
    }
  }

  pop();
}

function keyPressed() {  
	// 'space' to clear
  if (key === ' ') {
		initGrid();
		clear();
		background('black');
	}
  // 'escape' to exit
	if (key === 'Escape') {
	  interactionActive = false;
	  isCleared = false;
	  initGrid();
	  clear();
	  background('black');
	  if (activateOverlay) activateOverlay.show();
	  if (settingsButton) settingsButton.hide();
	  if (backButton) backButton.hide();
	  if (settingsPanel) settingsPanel.hide();
    if (toolTip) toolTip.hide();
    if (toolTipText) toolTipText.hide();
	}
}
