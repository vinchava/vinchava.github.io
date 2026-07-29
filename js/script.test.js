const fs = require('fs');
const path = require('path');

describe('fetchTracks error path', () => {
  let originalFetch;
  let originalConsoleError;

  beforeAll(() => {
    const html = fs.readFileSync(path.resolve(__dirname, '../index.html'), 'utf8');
    document.documentElement.innerHTML = html;
  });

  beforeEach(() => {
    originalFetch = global.fetch;
    originalConsoleError = console.error;
    console.error = jest.fn();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    console.error = originalConsoleError;
    jest.clearAllMocks();
  });

  it('should log an error when fetch fails', async () => {
    const mockError = new Error('Network error');
    global.fetch = jest.fn(() => Promise.reject(mockError));

    const scriptContent = fs.readFileSync(path.resolve(__dirname, 'script.js'), 'utf8');

    // Execute the script to instantiate the functions and variables
    eval(scriptContent);

    // By this point, fetchTracks is defined
    fetchTracks();

    // Wait for the promise chain to resolve
    await new Promise(process.nextTick);

    expect(console.error).toHaveBeenCalledWith("Error loading tracks:", mockError);
  });
});
