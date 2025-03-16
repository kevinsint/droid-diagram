import {calculateTotalHeight, calculateCircuitPositions} from './calculate.js';

export default class Draw {
    constructor({diagram, ctx}) {

        this.diagram = diagram;
        this.ctx = ctx;

        this.safeFonts = [
            'Arial',
            'Verdana',
            'Tahoma',
            'Trebuchet MS',
            'Times New Roman',
            'Georgia',
            'Garamond',
            'Courier New',
            'Brush Script MT'
        ]

        this.hues = [
            '#f83932',
            '#ffd22b',
            '#7cc85c',
            '#4ab2e1',
        ];

        // Access the root element's computed styles
        const root = document.documentElement;
        const styles = getComputedStyle(root);

        // Store CSS variables in a settings object
        this.settings = {
            diagramWidth: parseInt(styles.getPropertyValue('--diagram-width').trim()),
            diagramColor: styles.getPropertyValue('--diagram-color').trim(),
            circuitColor: styles.getPropertyValue('--circuit-color').trim(),
            circuitBorderColor: styles.getPropertyValue('--circuit-border-color').trim(),
            circuitLabelColor: styles.getPropertyValue('--circuit-label-color').trim(),
            circuitInputLabelColor: styles.getPropertyValue('--circuit-input-label-color').trim(),
            circuitOutputLabelColor: styles.getPropertyValue('--circuit-output-label-color').trim(),
            cableLabelColor: styles.getPropertyValue('--cable-label-color').trim(),
            fontFace: styles.getPropertyValue('--font-face').trim(),
            circuitFontSize: parseInt(styles.getPropertyValue('--circuit-font-size'), 10),
            pinFontSize: parseInt(styles.getPropertyValue('--pin-font-size'), 10),
            cableFontSize: parseInt(styles.getPropertyValue('--cable-font-size'), 10),
            circuitWidth: parseInt(styles.getPropertyValue('--circuit-width'), 10),
            circuitHeight: parseInt(styles.getPropertyValue('--circuit-height'), 10),
            circuitGap: parseInt(styles.getPropertyValue('--circuit-gap'), 10),
            pinGap: parseInt(styles.getPropertyValue('--pin-gap'), 10),
            cableSpacing: parseInt(styles.getPropertyValue('--cable-spacing'), 10),
            cableWidth: parseInt(styles.getPropertyValue('--cable-width'), 10),
            lanesOffset: parseInt(styles.getPropertyValue('--lanes-offset'), 10),
            inputPinLabelOffset: parseInt(styles.getPropertyValue('--input-pin-label-offset'), 10),
            outputPinLabelOffset: parseInt(styles.getPropertyValue('--output-pin-label-offset'), 10),
        };

        console.log("Settings:", this.settings);
    }

    render() {
        const {circuits, cables} = this.diagram;
        if (!circuits?.length) {
            throw new Error("No circuits provided");
        }

        const height = calculateTotalHeight({
            circuits,
            circuitHeight: this.settings.circuitHeight,
            circuitGap: this.settings.circuitGap
        });

        // Set canvas size
        this.ctx.canvas.width = this.settings.diagramWidth;
        this.ctx.canvas.height = height;

        // Draw diagram background
        this.ctx.fillStyle = this.settings.diagramColor;
        this.ctx.fillRect(0, 0, this.settings.diagramWidth, height);

        this.drawCircuits(this.ctx, circuits);
        if (cables.length) {
            this.drawCables({ctx: this.ctx, circuits, cables});
        }
    }


    drawCircuits(ctx, circuits) {

        // Draw circuits.
        calculateCircuitPositions({
            circuits: circuits,
            diagramWidth: this.settings.diagramWidth,
            circuitHeight: this.settings.circuitHeight,
            circuitGap: this.settings.circuitGap
        });

        circuits.forEach(circuit => {
            ctx.fillStyle = this.settings.circuitColor;
            ctx.fillRect(
                circuit.x - this.settings.circuitWidth / 2,
                circuit.y - this.settings.circuitHeight / 2,
                this.settings.circuitWidth,
                this.settings.circuitHeight
            );

            // Draw a rectangle border
            ctx.strokeStyle = this.settings.circuitBorderColor;
            ctx.lineWidth = 3;
            ctx.strokeRect(
                circuit.x - this.settings.circuitWidth / 2,
                circuit.y - this.settings.circuitHeight / 2,
                this.settings.circuitWidth,
                this.settings.circuitHeight
            );

            // Circuit Label
            ctx.fillStyle = this.settings.circuitLabelColor;
            ctx.font = this.getCircuitFont();
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(circuit.id, circuit.x, circuit.y);
            this.drawPins({ctx, circuit});
        });


    }

    drawPins({ctx, circuit}) {
        ctx.font = this.getPinFont();
        if (circuit.inputs.length) {
            // set color
            ctx.fillStyle = this.settings.circuitInputLabelColor;
            this.drawPinSet({
                ctx,
                circuit,
                pins: circuit.inputs,
                type: 'input'
            });
        }

        if (circuit.outputs.length) {
            ctx.fillStyle = this.settings.circuitOutputLabelColor;
            this.drawPinSet({
                ctx,
                circuit,
                pins: circuit.outputs,
                type: 'output'
            });
        }
    }


    drawPinSet({ctx, circuit, pins, type}) {
        const pinsWidth = (pins.length - 1) * this.settings.pinGap;
        let x = circuit.x - pinsWidth / 2;

        let y = circuit.y - this.settings.circuitHeight / 2;
        ctx.textAlign = 'right';
        let labelOffset = this.settings.inputPinLabelOffset;

        if (type === 'output') {
            ctx.textAlign = 'left';
            y = (circuit.y + this.settings.circuitHeight / 2);
            labelOffset = this.settings.outputPinLabelOffset;
        }

        pins.forEach((pin, index) => {
            // Store pin position and index
            pin.x = x;
            pin.y = y;
            pin.index = index;

            // Draw pin label
            ctx.save();
            ctx.translate(x, type === 'output' ? y - labelOffset : y + labelOffset);
            ctx.rotate(-Math.PI / 2);
            ctx.textBaseline = 'middle';

            // Draw pin name
            ctx.fillText(pin.pinName, type === 'output' ? labelOffset : -labelOffset, 0);

            ctx.restore();
            x += this.settings.pinGap;
        });
    }


    renderColors({cables}) {
        // Get unique cable names
        const uniqueCableNames = [...new Set(cables.map(cable => cable.cableName))];
        const numColors = uniqueCableNames.length;

        // Pick colors from the palette (this.hues)
        const baseColors = this.pickColors(this.hues, numColors);

        // Map colors to cable names
        const cableColorMap = new Map();
        uniqueCableNames.forEach((name, index) => {
            const rgb = baseColors[index];
            // Convert RGB to HSL string for canvas compatibility
            const hsl = this.rgbToHsl(rgb.r, rgb.g, rgb.b);
            const color = `hsl(${hsl.h * 360}, ${hsl.s * 100}%, ${hsl.l * 100}%)`;
            cableColorMap.set(name, color);
        });

        // Apply colors to cables
        cables.forEach(cable => {
            cable.color = cableColorMap.get(cable.cableName);
        });
    }

    drawCables({ctx, circuits, cables}) {

        // Assign a unique color per cable name.

        // const hue = (index * 60) % 360;
        // cable.color = `hsl(${hue}, 70%, 50%)`;
        this.renderColors({cables});

        // First pass: Draw all cables
        cables.forEach(cable => {

            const cableSpacing = this.settings.cableWidth + this.settings.cableSpacing;
            const center = this.settings.diagramWidth / 2;
            const width = this.settings.circuitWidth / 2 + cableSpacing;

            ctx.strokeStyle = cable.color;
            ctx.lineWidth = this.settings.cableWidth;

            // Draw each cable's parts from source to target.
            for (const target of cable.targets) {

                const sourceCircuit = circuits.find(c => c.id === cable.source.circuitId);
                const targetCircuit = circuits.find(c => c.id === target.circuitId);
                const sourceOutput = sourceCircuit.outputs.find(o => o.pinName === cable.source.pinName);
                const targetInput = targetCircuit.inputs.find(i => i.pinName === target.pinName);

                // Draw the cable path.
                ctx.beginPath();

                const laneOffset = center + (this.settings.lanesOffset * target.flow) + (width * target.flow);
                const laneX = laneOffset + target.lane * cableSpacing;

                // Pin length.
                const sourceOffset = cable.source.track * cableSpacing;
                const targetOffset = target.track * cableSpacing;

                ctx.moveTo(sourceOutput.x, sourceOutput.y); // Start at source pin (output pin at bottom)
                ctx.lineTo(sourceOutput.x, sourceOutput.y + sourceOffset); // Move DOWN from source pin

                ctx.lineTo(laneX, sourceOutput.y + sourceOffset); // Move to the lane
                ctx.lineTo(laneX, targetInput.y - targetOffset); // Move along the lane to target height

                ctx.lineTo(targetInput.x, targetInput.y - targetOffset); // Move to position above target pin
                ctx.lineTo(targetInput.x, targetInput.y); // Connect to target pin (input pin at top)
                ctx.stroke();

                // Store label position for the cable at the source output
                if (!cable.labelPositions) {
                    cable.labelPositions = [];
                }

                // Calculate the label position for source
                // If the lane is on the left side (negative flow), place label on left edge
                // If the lane is on the right side (positive flow), place label on right edge
                const sourceEdgeX = target.flow < 0 ?
                    sourceCircuit.x - this.settings.circuitWidth / 2 - 10 :
                    sourceCircuit.x + this.settings.circuitWidth / 2 + 10;

                const sourceLabel = {
                    x: sourceEdgeX,
                    y: sourceOutput.y + sourceOffset,
                    label: cable.cableName,
                    color: cable.color,
                    align: target.flow < 0 ? 'left' : 'right' // Align based on which side of circuit
                };
                cable.labelPositions.push(sourceLabel);

                // Calculate the label position for target
                // If the lane is on the left side (negative flow), place label on left edge
                // If the lane is on the right side (positive flow), place label on right edge
                const targetEdgeX = target.flow < 0 ?
                    targetCircuit.x - this.settings.circuitWidth / 2 - 10 :
                    targetCircuit.x + this.settings.circuitWidth / 2 + 10;

                const targetLabel = {
                    x: targetEdgeX,
                    y: targetInput.y - targetOffset,
                    label: cable.cableName,
                    color: cable.color,
                    align: target.flow < 0 ? 'left' : 'right' // Align based on which side of circuit
                };
                cable.labelPositions.push(targetLabel);
            }
        });

        // Second pass: Draw labels
        cables.forEach(cable => {
            if (cable.labelPositions && cable.labelPositions.length > 0) {
                cable.labelPositions.forEach(pos => {
                    ctx.font = this.getCableFont();
                    this.drawCableLabel({
                        ctx,
                        x: pos.x,
                        y: pos.y,
                        label: pos.label,
                        color: cable.color
                    });
                });
            }
        });
    }


    /**
     * Draws a pill-shaped label with vertical text
     * @param {CanvasRenderingContext2D} ctx - The canvas context
     * @param {number} x - X coordinate for the label
     * @param {number} y - Y coordinate for the label
     * @param {string} text - Text to display in the label
     * @param {string} color - Background color for the pill
     */
    drawCableLabel({ctx, x, y, label, color}) {
        ctx.save();

        // Translate to the position where we want to draw the label
        ctx.translate(x, y);
        ctx.textAlign = 'center';

        // Calculate pill dimensions
        const textMetrics = ctx.measureText(label);
        const padding = 8;
        const textHeight = this.settings.cableFontSize;
        const cornerRadius = 20;
        const rectWidth = textMetrics.width + padding * 8;
        const rectHeight = textHeight + padding * 2;

        // Draw rounded rectangle (pill shape), use cable color.
        ctx.fillStyle = color;
        this.drawPill({ctx, x: 0, y: 0, width: rectWidth, height: rectHeight, radius: cornerRadius});

        // Draw the label in white
        ctx.fillStyle = this.settings.cableLabelColor;
        ctx.fillText(label, 0, 0);

        ctx.restore();
    }

    /**
     * Draws a pill shape (rounded rectangle) centered at the given coordinates
     * @param {CanvasRenderingContext2D} ctx - The canvas context
     * @param {number} x - Center X coordinate
     * @param {number} y - Center Y coordinate
     * @param {number} width - Width of the pill
     * @param {number} height - Height of the pill
     * @param {number} radius - Corner radius
     */
    drawPill({ctx, x, y, width, height, radius}) {
        ctx.beginPath();
        ctx.moveTo(x - width / 2 + radius, y - height / 2);
        ctx.lineTo(x + width / 2 - radius, y - height / 2);
        ctx.arcTo(x + width / 2, y - height / 2, x + width / 2, y - height / 2 + radius, radius);
        ctx.lineTo(x + width / 2, y + height / 2 - radius);
        ctx.arcTo(x + width / 2, y + height / 2, x + width / 2 - radius, y + height / 2, radius);
        ctx.lineTo(x - width / 2 + radius, y + height / 2);
        ctx.arcTo(x - width / 2, y + height / 2, x - width / 2, y + height / 2 - radius, radius);
        ctx.lineTo(x - width / 2, y - height / 2 + radius);
        ctx.arcTo(x - width / 2, y - height / 2, x - width / 2 + radius, y - height / 2, radius);
        ctx.closePath();
        ctx.fill();
    }

    getPinFont() {
        return `${this.settings.pinFontSize}px ${this.settings.fontFace}`;
    }

    getCircuitFont() {
        return `${this.settings.circuitFontSize}px ${this.settings.fontFace}`;
    }

    getCableFont() {
        return `bold ${this.settings.cableFontSize}px ${this.settings.fontFace}`;
    }

    pickColors(palette, numColors) {
        // Handle edge cases
        if (numColors <= 0) return [];
        if (palette.length === 0) return [];

        // Convert palette to HSL
        const paletteHsl = palette.map(hex => this.hexToHsl(hex));
        const N = palette.length;
        const colors = [];

        // Generate numColors evenly spaced across the palette
        for (let k = 0; k < numColors; k++) {
            // Parameter t ranges from 0 to 1 across the palette
            const t = numColors === 1 ? 0 : k / (numColors - 1);
            const segment = Math.floor(t * (N - 1));

            // If at or beyond the last color, use the last color
            if (segment >= N - 1) {
                const {h, s, l} = paletteHsl[N - 1];
                const rgb = this.hslToRgb(h / 360, s / 100, l / 100);
                colors.push({r: rgb.r, g: rgb.g, b: rgb.b});
            } else {
                // Interpolate between segment and segment + 1
                const local_t = t * (N - 1) - segment;
                const hsl1 = paletteHsl[segment];
                const hsl2 = paletteHsl[segment + 1];

                // Hue interpolation with shortest path
                let dh = hsl2.h - hsl1.h;
                if (dh > 180) dh -= 360;
                if (dh < -180) dh += 360;
                let h = hsl1.h + local_t * dh;
                h = (h % 360 + 360) % 360; // Normalize to [0, 360)

                // Linear interpolation for saturation and lightness
                const s = hsl1.s + local_t * (hsl2.s - hsl1.s);
                const l = hsl1.l + local_t * (hsl2.l - hsl1.l);

                // Convert back to RGB
                const rgb = this.hslToRgb(h / 360, s / 100, l / 100);
                colors.push({r: rgb.r, g: rgb.g, b: rgb.b});
            }
        }

        return colors;
    }

    // Convert hex color to RGB
    hexToRgb(hex) {
        // Remove # if present
        hex = hex.replace(/^#/, '');

        // Parse the hex values
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);

        return {r, g, b};
    }

    // Convert RGB to HSL
    rgbToHsl(r, g, b) {
        r /= 255;
        g /= 255;
        b /= 255;

        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;

        if (max === min) {
            h = s = 0; // achromatic
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

            switch (max) {
                case r:
                    h = (g - b) / d + (g < b ? 6 : 0);
                    break;
                case g:
                    h = (b - r) / d + 2;
                    break;
                case b:
                    h = (r - g) / d + 4;
                    break;
            }

            h /= 6;
        }

        return {h, s, l};
    }

    // Convert HSL to RGB
    hslToRgb(h, s, l) {
        let r, g, b;

        if (s === 0) {
            r = g = b = l; // achromatic
        } else {
            const hue2rgb = (p, q, t) => {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1 / 6) return p + (q - p) * 6 * t;
                if (t < 1 / 2) return q;
                if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
                return p;
            };

            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;

            r = hue2rgb(p, q, h + 1 / 3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1 / 3);
        }

        return {
            r: Math.round(r * 255),
            g: Math.round(g * 255),
            b: Math.round(b * 255)
        };
    }

    hexToHsl(hex) {
        const rgb = this.hexToRgb(hex);
        const hsl = this.rgbToHsl(rgb.r, rgb.g, rgb.b);
        return {
            h: hsl.h * 360,  // Hue in degrees [0, 360]
            s: hsl.s * 100,  // Saturation in percent [0, 100]
            l: hsl.l * 100   // Lightness in percent [0, 100]
        };
    }


}
