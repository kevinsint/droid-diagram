import Patch from './patch.js';
import Diagram from './diagram.js';
import specifications from './specifications.js';
import Draw from "./draw.js";

document.addEventListener('DOMContentLoaded', () => {
    const patchFileInput = document.getElementById('patchFile');

    patchFileInput.addEventListener('change', async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const patchText = await file.text();
        const patch = new Patch({specifications, patchText});

        const diagram = new Diagram({patch});
        const draw = new Draw({ diagram, container: 'container' });
        draw.render();
    });
});
