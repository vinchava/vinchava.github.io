const fs = require('fs');
const path = require('path');

const scriptContent = fs.readFileSync(path.resolve(__dirname, 'script.js'), 'utf8');

describe('createCarousel', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <button id="theme-toggle"><span></span></button>
      <audio id="bg-audio"></audio>
      <button id="playback-toggle"></button>
      <span id="playback-icon"></span>
      <button id="mute-toggle"><span></span></button>
      <button id="prev"></button>
      <button id="next"></button>
      <div id="track-title"></div>
      <div id="track-artist"></div>
      <div id="track-album"></div>
      <div id="track-year"></div>
      <div id="progress-bar"></div>
      <div id="progress-fill"></div>
      <img id="track-thumbnail" />
      <div class="carousel-track"></div>
      <button class="carousel-arrow left"></button>
      <button class="carousel-arrow right"></button>
      <div id="command-palette"></div>
      <input id="command-input" />
      <ul id="command-list"></ul>
      <button id="scroll-top-btn"></button>
      <div id="miniplayer" class="hidden"></div>
      <button id="miniplayer-toggle"><span></span></button>
    `;
    global.Fuse = class { constructor() {} search() { return []; } };
    window.fetch = jest.fn(() => Promise.resolve({ json: () => Promise.resolve([]) }));
  });

  it('clears track innerHTML and returns when imagePaths is empty', () => {
    const track = document.querySelector('.carousel-track');
    track.innerHTML = '<div class="old-item"></div>';

    // Evaluate the script and extract createCarousel
    const func = new Function(scriptContent + '\nreturn { createCarousel };');
    const { createCarousel } = func();

    createCarousel([]);

    expect(track.innerHTML).toBe('');
    expect(track.querySelectorAll('img').length).toBe(0);
  });

  it('appends images to track when imagePaths is not empty', () => {
    const track = document.querySelector('.carousel-track');

    // Evaluate the script and extract createCarousel
    const func = new Function(scriptContent + '\nreturn { createCarousel };');
    const { createCarousel } = func();

    createCarousel(['path/to/img1.png', 'path/to/img2.png']);

    const images = track.querySelectorAll('img');
    expect(images.length).toBe(2);
    expect(images[0].src).toContain('path/to/img1.png');
    expect(images[1].src).toContain('path/to/img2.png');
  });
});
