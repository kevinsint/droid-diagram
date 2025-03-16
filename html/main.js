import Patch from './patch.js';
import Diagram from './diagram.js';
import Draw from './draw.js';
import specifications from './specifications.js';

document.addEventListener('DOMContentLoaded', () => {
    const patchFileInput = document.getElementById('patchFile');
    const canvas = document.getElementById('diagramCanvas');

    patchFileInput.addEventListener('change', async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        try {
            const patchText = await file.text();
            const patch = new Patch({specifications, patchText});
            const diagram = new Diagram({patch});
            const ctx = canvas.getContext('2d');
            const draw = new Draw({diagram, ctx});
            draw.render();
        } catch (error) {
            console.error('Error generating diagram:', error);
            alert('Error generating diagram: ' + error.message);
        }
    });
});
