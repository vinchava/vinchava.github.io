const heatmap = require('../js/heatmap.js');

describe('heatmap.js', () => {
  describe('initGrid', () => {
    it('should initialize a 2D grid with correct dimensions and default cell values', () => {
      // Set test dimensions
      const testCols = 5;
      const testRows = 4;

      heatmap.setCols(testCols);
      heatmap.setRows(testRows);

      // Call the function
      heatmap.initGrid();

      // Get the resulting grid
      const grid = heatmap.getGrid();

      // Verify outer array length (columns)
      expect(grid).toBeDefined();
      expect(Array.isArray(grid)).toBe(true);
      expect(grid.length).toBe(testCols);

      // Verify each inner array length (rows) and cell content
      for (let i = 0; i < testCols; i++) {
        expect(Array.isArray(grid[i])).toBe(true);
        expect(grid[i].length).toBe(testRows);

        for (let j = 0; j < testRows; j++) {
          expect(grid[i][j]).toEqual({
            intensity: 0,
            hoverTime: 0
          });
        }
      }
    });

    it('should handle zero columns and rows', () => {
      heatmap.setCols(0);
      heatmap.setRows(0);

      heatmap.initGrid();

      const grid = heatmap.getGrid();
      expect(grid).toBeDefined();
      expect(Array.isArray(grid)).toBe(true);
      expect(grid.length).toBe(0);
    });
  });
});
