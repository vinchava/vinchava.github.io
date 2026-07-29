/**
 * @jest-environment jsdom
 */

const { getCanvasSize } = require('./heatmap.js');

describe('getCanvasSize', () => {
  let container;

  beforeEach(() => {
    // Set up a DOM element for the function to find
    document.body.innerHTML = '<div id="heatmap-container"></div>';
    container = document.getElementById('heatmap-container');
  });

  afterEach(() => {
    // Clean up DOM
    document.body.innerHTML = '';
  });

  test('calculates height as 75% of width correctly for integer values', () => {
    // Define a width
    Object.defineProperty(container, 'clientWidth', {
      value: 800,
      configurable: true,
    });

    const result = getCanvasSize();
    expect(result.width).toBe(800);
    // 800 * 0.75 = 600
    expect(result.height).toBe(600);
  });

  test('calculates height using Math.floor for fractional dimensions', () => {
    Object.defineProperty(container, 'clientWidth', {
      value: 333,
      configurable: true,
    });

    const result = getCanvasSize();
    expect(result.width).toBe(333);
    // 333 * 0.75 = 249.75, Math.floor(249.75) = 249
    expect(result.height).toBe(249);
  });

  test('handles 0 width correctly', () => {
    Object.defineProperty(container, 'clientWidth', {
      value: 0,
      configurable: true,
    });

    const result = getCanvasSize();
    expect(result.width).toBe(0);
    expect(result.height).toBe(0);
  });
});
