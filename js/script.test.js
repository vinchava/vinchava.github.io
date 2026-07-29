const fs = require('fs');
const path = require('path');

describe('activatePage', () => {
    beforeEach(() => {
        const html = fs.readFileSync(path.resolve(__dirname, '../index.html'), 'utf8');
        document.documentElement.innerHTML = html.toString();

        // Mock Fuse
        window.Fuse = jest.fn().mockImplementation(() => {
            return { search: jest.fn() };
        });

        // Mock fetch
        window.fetch = jest.fn().mockImplementation(() => Promise.resolve({ json: () => Promise.resolve([]) }));

        // Reset require cache
        jest.resetModules();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should handle audio autoplay errors and log a warning', async () => {
        const audio = document.getElementById("bg-audio");

        const playMock = jest.fn().mockRejectedValue(new Error('Autoplay failed'));
        // HTMLMediaElement in jsdom doesn't have play, so we must add it directly to the element prototype or the element
        audio.play = playMock;

        const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

        require('./script.js');

        // Dispatch DOMContentLoaded to run initialization
        document.dispatchEvent(new Event('DOMContentLoaded'));

        // The script also checks document.visibilityState
        // Let's explicitly call activatePage by dispatching a click
        document.dispatchEvent(new Event('click'));

        // Wait for microtasks
        await new Promise(process.nextTick);

        expect(playMock).toHaveBeenCalled();
        expect(consoleSpy).toHaveBeenCalledWith("Audio autoplay failed:", expect.any(Error));
    });
});
