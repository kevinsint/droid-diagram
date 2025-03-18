export class Magnifier {
    constructor(canvas, magnificationFactor = 2) {
        this.canvas = canvas;
        this.magnificationFactor = magnificationFactor;

        // Get the magnifier element
        this.magnifier = document.getElementById('magnifier');

        // Configuration
        this.magnifierSize = 150; // Diameter in pixels
        this.isActive = false;

        // Initialize event listeners
        this.initEventListeners();
    }

    initEventListeners() {
        // Show magnifier on mouse enter
        this.canvas.addEventListener('mouseenter', () => {
            this.isActive = true;
            this.magnifier.style.display = 'block';
        });

        // Hide magnifier on mouse leave
        this.canvas.addEventListener('mouseleave', () => {
            this.isActive = false;
            this.magnifier.style.display = 'none';
        });

        // Update magnifier position on mouse move
        this.canvas.addEventListener('mousemove', (e) => {
            if (!this.isActive) return;

            const rect = this.canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;

            this.updateMagnifier(mouseX, mouseY, rect);
        });
    }

    updateMagnifier(mouseX, mouseY, rect) {
        // Position the magnifier (centered on mouse)
        const magnifierRadius = this.magnifierSize / 2;
        this.magnifier.style.left = `${mouseX - magnifierRadius}px`;
        this.magnifier.style.top = `${mouseY - magnifierRadius}px`;

        // Calculate the background position to show the area under the magnifier
        const bgPosX = -mouseX * (this.magnificationFactor - 1) + magnifierRadius * (1 - this.magnificationFactor);
        const bgPosY = -mouseY * (this.magnificationFactor - 1) + magnifierRadius * (1 - this.magnificationFactor);

        // Apply the CSS transformation
        this.magnifier.style.backgroundImage = `url(${this.canvas.toDataURL()})`;
        this.magnifier.style.backgroundSize = `${rect.width * this.magnificationFactor}px ${rect.height * this.magnificationFactor}px`;
        this.magnifier.style.backgroundPosition = `${bgPosX}px ${bgPosY}px`;
    }

    setMagnification(factor) {
        this.magnificationFactor = factor;
    }

    setSize(size) {
        this.magnifierSize = size;
        this.magnifier.style.width = `${size}px`;
        this.magnifier.style.height = `${size}px`;
    }
}
