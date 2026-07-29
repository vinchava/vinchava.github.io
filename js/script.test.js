/**
 * @jest-environment jsdom
 */

const fs = require('fs');
const path = require('path');

describe('fetchTracks', () => {
    let originalFetch;
    let consoleErrorSpy;

    beforeEach(() => {
        const html = fs.readFileSync(path.resolve(__dirname, '../index.html'), 'utf8');
        document.documentElement.innerHTML = html;

        // Save original fetch
        originalFetch = global.fetch;

        // We will need to evaluate script.js in the context of the window
        // But since it's just a file, we can read it and eval it
        const scriptContent = fs.readFileSync(path.resolve(__dirname, 'script.js'), 'utf8');

        // Mock fuse.js (used in script.js)
        window.Fuse = jest.fn().mockImplementation(() => ({
            search: jest.fn()
        }));

        // Mock window methods that might be called on init
        window.scrollTo = jest.fn();

        // Eval script content in window context
        // This will define fetchTracks globally
        const scriptEl = document.createElement('script');
        scriptEl.textContent = scriptContent;
        document.body.appendChild(scriptEl);
    });

    afterEach(() => {
        global.fetch = originalFetch;
        jest.restoreAllMocks();
    });

    it('should log an error when fetch fails', async () => {
        // mock fetch
        global.fetch = jest.fn(() => Promise.reject(new Error('Network error')));
        consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

        // Call fetchTracks (it's defined in window)
        window.fetchTracks();

        // Since fetch is a promise, we need to wait for microtasks to complete
        await Promise.resolve();
        await Promise.resolve();
        await Promise.resolve();

        expect(consoleErrorSpy).toHaveBeenCalledWith('Error loading tracks:', expect.any(Error));
    });
});
