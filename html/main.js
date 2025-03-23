import specifications from './specifications.js';
import Patch from './patch.js';
import Diagram from './diagram.js';
import Draw from "./draw.js";

/**
 * v 1.1
 */
document.addEventListener('DOMContentLoaded', () => {
    const patchFileInput = document.getElementById('patchFile');

    patchFileInput.addEventListener('change', async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        document.body.classList.add('diagram-mode');

        // Parse droid patch file.
        const patchText = await file.text();
        const patch = new Patch({specifications, patchText});

        // Create diagram.
        const diagram = new Diagram({patch});

        // Draw diagram.
        const container = document.getElementById('diagram');
        const draw = new Draw({diagram, container});
        draw.render();
    });
});
