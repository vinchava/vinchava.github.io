const fs = require('fs');
const path = require('path');

const code = fs.readFileSync(path.resolve(__dirname, './heatmap.js'), 'utf8');

describe('updateGridDimensions', () => {
  let heatmap;

  beforeEach(() => {
    const wrapper = `
      ${code}

      return {
        updateGridDimensions: updateGridDimensions,
        setVars: function(tw, th, cs) {
          targetWidth = tw;
          targetHeight = th;
          cellSize = cs;
        },
        getVars: function() {
          return { cols, rows };
        }
      };
    `;
    heatmap = new Function(wrapper)();
  });

  it('correctly calculates cols and rows (exact division)', () => {
    heatmap.setVars(100, 200, 10);
    heatmap.updateGridDimensions();
    const result = heatmap.getVars();

    expect(result.cols).toBe(10);
    expect(result.rows).toBe(20);
  });

  it('correctly rounds down (floor division)', () => {
    heatmap.setVars(105, 209, 10);
    heatmap.updateGridDimensions();
    const result = heatmap.getVars();

    expect(result.cols).toBe(10);
    expect(result.rows).toBe(20);
  });

  it('correctly handles zero width and height', () => {
    heatmap.setVars(0, 0, 10);
    heatmap.updateGridDimensions();
    const result = heatmap.getVars();

    expect(result.cols).toBe(0);
    expect(result.rows).toBe(0);
  });

  it('correctly handles fractional cell sizes', () => {
    heatmap.setVars(25, 25, 10.5);
    heatmap.updateGridDimensions();
    const result = heatmap.getVars();

    expect(result.cols).toBe(2);
    expect(result.rows).toBe(2);
  });
});
