export default class Draw {
    constructor({diagram, container}) {
        this.diagram = diagram;
        this.container = container;

        // Todo move to css.
        this.hues = [
            '#f83932',
            '#ffd22b',
            '#7cc85c',
            '#4ab2e1',
        ];

        const root = document.documentElement;
        const styles = getComputedStyle(root);

        this.settings = {
            baseCableSpace: parseInt(styles.getPropertyValue('--base-cable-space') || '100', 10),
            cableFontSize: parseInt(styles.getPropertyValue('--cable-font-size'), 10),
            cableLabelColor: styles.getPropertyValue('--cable-label-color').trim(),
            cableSpacing: parseInt(styles.getPropertyValue('--cable-spacing'), 10),
            cableWidth: parseInt(styles.getPropertyValue('--cable-width'), 10),
            circuitBorderColor: styles.getPropertyValue('--circuit-border-color').trim(),
            circuitColor: styles.getPropertyValue('--circuit-color').trim(),
            circuitFontSize: parseInt(styles.getPropertyValue('--circuit-font-size'), 10),
            circuitDescriptionFontSize: parseInt(styles.getPropertyValue('--circuit-description-font-size'), 10),
            circuitHeight: parseInt(styles.getPropertyValue('--circuit-height'), 10),
            circuitInputLabelColor: styles.getPropertyValue('--circuit-input-label-color').trim(),
            circuitLabelColor: styles.getPropertyValue('--circuit-label-color').trim(),
            circuitOutputLabelColor: styles.getPropertyValue('--circuit-output-label-color').trim(),
            circuitWidth: parseInt(styles.getPropertyValue('--circuit-width'), 10),
            diagramColor: styles.getPropertyValue('--diagram-color').trim(),
            diagramWidth: parseInt(styles.getPropertyValue('--diagram-width') || '2000', 10),
            fontFace: styles.getPropertyValue('--font-face').trim(),
            pinLabelMargin: parseInt(styles.getPropertyValue('--input-pin-label-offset'), 10),
            lanesOffset: parseInt(styles.getPropertyValue('--lanes-offset'), 10),
            outputPinLabelOffset: parseInt(styles.getPropertyValue('--output-pin-label-offset'), 10),
            pinFontSize: parseInt(styles.getPropertyValue('--pin-font-size'), 10),
            pinGap: parseInt(styles.getPropertyValue('--pin-gap'), 10),
            diagramMargin: 200
        };

        // Ensure container is full screen
        this.container.style.width = '100vw';
        this.container.style.height = '100vh';
        this.container.style.overflow = 'hidden';
    }

    render() {
        const {circuits, cables} = this.diagram;
        if (!this.diagram.circuits?.length) throw new Error("No circuits provided");

        // Set all circuits width to the larger one.
        this.circuitWidth = this.diagram.specs.get('maxPins') * this.settings.pinGap + 200;

        const {patchHeight} = this.calculateCircuitPositions({
            diagramWidth: this.settings.diagramWidth,
            circuitHeight: this.settings.circuitHeight,
            cableSpacing: this.settings.cableSpacing
        });

        const diagramHeight = patchHeight + this.settings.diagramMargin * 2;
        this.diagramWidth = this.settings.diagramWidth;
        this.diagramHeight = diagramHeight;

        // Create full-screen stage using global Konva
        const stage = new Konva.Stage({
            container: this.container,
            width: window.innerWidth,
            height: window.innerHeight
        });

        const layer = new Konva.Layer();
        stage.add(layer);

        // Draw background
        const background = new Konva.Rect({
            x: 0,
            y: 0,
            width: this.settings.diagramWidth,
            height: diagramHeight,
            fill: this.settings.diagramColor
        });
        layer.add(background);


        // Draw circuits and cables
        circuits.forEach(circuit => {
            this.drawCircuit({layer, circuit});
        });

        if (cables.length) {
            this.drawCables({layer, circuits, cables});
        }


        layer.draw();

        // Initial scale to fit and center the diagram
        const scaleX = window.innerWidth / this.settings.diagramWidth;
        const scaleY = window.innerHeight / diagramHeight;
        const initialScale = Math.min(scaleX, scaleY);
        stage.scale({x: initialScale, y: initialScale});

        const offsetX = (window.innerWidth - this.settings.diagramWidth * initialScale) / 2;
        const offsetY = (window.innerHeight - diagramHeight * initialScale) / 2;
        stage.position({x: offsetX, y: offsetY});

        // Add zoom and pan functionality
        stage.draggable(true);

        this.addZoomListeners(stage);

        // Handle window resize
        window.addEventListener('resize', () => {
            stage.width(window.innerWidth);
            stage.height(window.innerHeight);
            stage.batchDraw();
        });
    }

    // Function to add zooming functionality
    addZoomListeners(stage) {
        stage.on('wheel', (e) => {
            e.evt.preventDefault();
            // Zoom speed (20% per scroll)
            const scaleBy = 1.2;
            const oldScale = stage.scaleX();
            const pointer = stage.getPointerPosition();

            // Calculate the point in the diagram under the mouse
            const mousePointTo = {
                x: (pointer.x - stage.x()) / oldScale,
                y: (pointer.y - stage.y()) / oldScale,
            };

            // Determine zoom direction (in or out)
            const direction = e.evt.deltaY > 0 ? -1 : 1;
            const newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy;

            // Calculate minScale dynamically based on current stage and diagram size
            const minScaleX = stage.width() / this.diagramWidth;
            const minScaleY = stage.height() / this.diagramHeight;
            const minScale = Math.min(minScaleX, minScaleY);

            const maxScale = 0.5; // Maximum scale
            const clampedScale = Math.max(minScale, Math.min(maxScale, newScale));

            // Apply the new scale
            stage.scale({x: clampedScale, y: clampedScale});

            // Adjust position to zoom around the mouse pointer
            const newPos = {
                x: pointer.x - mousePointTo.x * clampedScale,
                y: pointer.y - mousePointTo.y * clampedScale,
            };
            stage.position(newPos);
            stage.batchDraw(); // Redraw the stage
        });
    }

    drawCircuit({layer, circuit}) {

        const circuitRect = new Konva.Rect({
            x: circuit.x - circuit.width / 2,
            y: circuit.y - this.settings.circuitHeight / 2,
            width: circuit.width,
            height: this.settings.circuitHeight,
            fill: this.settings.circuitColor,
            stroke: this.settings.circuitBorderColor,
            strokeWidth: 3
        });
        layer.add(circuitRect);

        // Circuit descriptions

        const labelDescription = new Konva.Text({
            text: circuit.description,
            fontSize: this.settings.circuitDescriptionFontSize,
            fontFamily: this.settings.fontFace,
            fill: this.settings.circuitLabelColor
        });

        labelDescription.x(circuit.x - labelDescription.width() / 2);
        labelDescription.y(circuit.y - labelDescription.height() / 2 - this.settings.circuitDescriptionFontSize);
        layer.add(labelDescription);

        // Circuit type

        const labelType = new Konva.Text({
            text: `[${circuit.type}]`,
            fontSize: this.settings.circuitFontSize,
            fontFamily: this.settings.fontFace,
            fill: this.settings.circuitLabelColor
        });

        labelType.x(circuit.x - labelType.width() / 2);
        labelType.y(circuit.y - labelType.height() / 2 + labelType.height());
        layer.add(labelType);

        if (circuit.inputs.length) {
            this.drawPinSet({layer, circuit, pins: circuit.inputs, type: 'input'});
        }
        if (circuit.outputs.length) {
            this.drawPinSet({layer, circuit, pins: circuit.outputs, type: 'output'});
        }
    }


    drawPinSet({layer, circuit, pins, type}) {

        const pinsWidth = (pins.length - 1) * this.settings.pinGap;
        let x = circuit.x - pinsWidth / 2;
        let y = type === 'input' ? circuit.y - this.settings.circuitHeight / 2 : circuit.y + this.settings.circuitHeight / 2;

        pins.forEach((pin, index) => {
            const pinGroup = new Konva.Group();
            pin.x = x;
            pin.y = y;
            pin.index = index;
            pinGroup.x(x);
            pinGroup.y(y);

            const pinText = new Konva.Text({
                x: 0,
                y: 0,
                text: pin.pinName,
                fontSize: this.settings.pinFontSize,
                fontFamily: this.settings.fontFace,
                fill: type === 'input' ? this.settings.circuitInputLabelColor : this.settings.circuitOutputLabelColor
            });
            // Axes are rotated 90deg.
            //  Y move the label left-right on the circuit.
            //  X moves up-down.
            //  And x y are relative to previous value, not coordinates.
            pinText.y(-pinText.height() / 2);
            pinText.x(offset(pinText.width()));
            pinGroup.rotation(-90);
            pinGroup.add(pinText);
            layer.add(pinGroup);

            x += this.settings.pinGap;
        });

        function offset(width) {
            return type === 'input' ? -width - 20 : 20;
        }


    }


    drawCables({layer, circuits, cables}) {
        this.renderColors({cables});

        const cableSpacing = this.settings.cableWidth + this.settings.cableSpacing;
        const center = this.settings.diagramWidth / 2;
        const width = this.settings.circuitWidth / 2 + cableSpacing;


        cables.forEach(cable => {
            // First loop: Draw all shadows for all targets
            cable.targets.forEach(target => {
                const sourceCircuit = circuits.find(c => c.id === cable.source.circuitId);
                const targetCircuit = circuits.find(c => c.id === target.circuitId);
                const sourceOutput = sourceCircuit.outputs.find(o => o.pinName === cable.source.pinName);
                const targetInput = targetCircuit.inputs.find(i => i.pinName === target.pinName);

                const laneOffset = center + (this.settings.lanesOffset * target.flow) + (width * target.flow);
                const laneX = laneOffset + target.lane * cableSpacing;
                const sourceOffset = cable.source.track * cableSpacing;
                const targetOffset = target.track * cableSpacing;

                const points = [
                    sourceOutput.x, sourceOutput.y,
                    sourceOutput.x, sourceOutput.y + sourceOffset,
                    laneX, sourceOutput.y + sourceOffset,
                    laneX, targetInput.y - targetOffset,
                    targetInput.x, targetInput.y - targetOffset,
                    targetInput.x, targetInput.y
                ];

                const shadowLine = new Konva.Line({
                    points,
                    stroke: this.settings.diagramColor,
                    strokeWidth: this.settings.cableWidth + 8,
                    lineCap: 'round',
                    lineJoin: 'round'
                });
                layer.add(shadowLine);
            });

            // Second loop: Draw all cables and labels for all targets
            cable.targets.forEach(target => {
                const sourceCircuit = circuits.find(c => c.id === cable.source.circuitId);
                const targetCircuit = circuits.find(c => c.id === target.circuitId);
                const sourceOutput = sourceCircuit.outputs.find(o => o.pinName === cable.source.pinName);
                const targetInput = targetCircuit.inputs.find(i => i.pinName === target.pinName);

                const laneOffset = center + (this.settings.lanesOffset * target.flow) + (width * target.flow);
                const laneX = laneOffset + target.lane * cableSpacing;
                const sourceOffset = cable.source.track * cableSpacing;
                const targetOffset = target.track * cableSpacing;

                const points = [
                    sourceOutput.x, sourceOutput.y,
                    sourceOutput.x, sourceOutput.y + sourceOffset,
                    laneX, sourceOutput.y + sourceOffset,
                    laneX, targetInput.y - targetOffset,
                    targetInput.x, targetInput.y - targetOffset,
                    targetInput.x, targetInput.y
                ];

                const cableLine = new Konva.Line({
                    points,
                    stroke: cable.color,
                    strokeWidth: this.settings.cableWidth,
                    lineCap: 'round',
                    lineJoin: 'round'
                });
                layer.add(cableLine);

                // Draw labels for this segment
                const sourceEdgeX = target.flow < 0 ?
                    sourceCircuit.x - sourceCircuit.width / 2 - 10 :
                    sourceCircuit.x + sourceCircuit.width / 2 + 10;
                const sourceLabelY = sourceOutput.y + sourceOffset;

                this.drawCableLabel({
                    layer,
                    x: sourceEdgeX,
                    y: sourceLabelY,
                    label: cable.cableName,
                    color: cable.color,
                    align: target.flow < 0 ? 'left' : 'right',
                });

                const targetEdgeX = target.flow < 0 ?
                    targetCircuit.x - targetCircuit.width / 2 - 10 :
                    targetCircuit.x + targetCircuit.width / 2 + 10;
                const targetLabelY = targetInput.y - targetOffset;

                this.drawCableLabel({
                    layer,
                    x: targetEdgeX,
                    y: targetLabelY,
                    label: cable.cableName,
                    color: cable.color,
                    align: target.flow < 0 ? 'left' : 'right',
                });
            });
        });
    }

    drawCableLabel({layer, x, y, label, color, align}) {

        const overlap = 50;

        const tempText = new Konva.Text({
            text: label,
            fontSize: this.settings.cableFontSize,
            fontFamily: this.settings.fontFace,
            fontStyle: 'bold'
        });
        const textWidth = tempText.width();
        const textHeight = tempText.height();
        const padding = Math.ceil(tempText.height() / 3);
        const rectWidth = textWidth + padding * 8;
        const rectHeight = textHeight + padding * 2;
        const cornerRadius = 100;

        const labelGroup = new Konva.Group({
            x: x,
            y: y
        });

        const labelX = align === 'left' ? -rectWidth + overlap : -overlap;

        const background = new Konva.Rect({
            x: labelX,
            y: -rectHeight / 2,
            width: rectWidth,
            height: rectHeight,
            fill: color,
            cornerRadius: cornerRadius
        });
        labelGroup.add(background);

        const text = new Konva.Text({
            x: labelX,
            y: -rectHeight / 2,
            width: rectWidth,
            height: rectHeight,
            text: label,
            fontSize: this.settings.cableFontSize,
            fontFamily: this.settings.fontFace,
            fontStyle: 'bold',
            fill: this.settings.cableLabelColor,
            align: 'center',
            verticalAlign: 'middle'
        });
        labelGroup.add(text);
        layer.add(labelGroup);
    }

    renderColors({cables}) {
        const uniqueCableNames = [...new Set(cables.map(cable => cable.cableName))];
        const numColors = uniqueCableNames.length;
        const baseColors = this.pickColors(this.hues, numColors);
        const cableColorMap = new Map();
        uniqueCableNames.forEach((name, index) => {
            const rgb = baseColors[index];
            const hsl = this.rgbToHsl(rgb.r, rgb.g, rgb.b);
            const color = `hsl(${hsl.h * 360}, ${hsl.s * 100}%, ${hsl.l * 100}%)`;
            cableColorMap.set(name, color);
        });
        cables.forEach(cable => {
            cable.color = cableColorMap.get(cable.cableName);
        });
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
        if (numColors <= 0 || palette.length === 0) return [];
        const paletteHsl = palette.map(hex => this.hexToHsl(hex));
        const N = palette.length;
        const colors = [];
        for (let k = 0; k < numColors; k++) {
            const t = numColors === 1 ? 0 : k / (numColors - 1);
            const segment = Math.floor(t * (N - 1));
            if (segment >= N - 1) {
                const {h, s, l} = paletteHsl[N - 1];
                const rgb = this.hslToRgb(h / 360, s / 100, l / 100);
                colors.push({r: rgb.r, g: rgb.g, b: rgb.b});
            } else {
                const local_t = t * (N - 1) - segment;
                const hsl1 = paletteHsl[segment];
                const hsl2 = paletteHsl[segment + 1];
                let dh = hsl2.h - hsl1.h;
                if (dh > 180) dh -= 360;
                if (dh < -180) dh += 360;
                let h = hsl1.h + local_t * dh;
                h = (h % 360 + 360) % 360;
                const s = hsl1.s + local_t * (hsl2.s - hsl1.s);
                const l = hsl1.l + local_t * (hsl2.l - hsl1.l);
                const rgb = this.hslToRgb(h / 360, s / 100, l / 100);
                colors.push({r: rgb.r, g: rgb.g, b: rgb.b});
            }
        }
        return colors;
    }

    hexToRgb(hex) {
        hex = hex.replace(/^#/, '');
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        return {r, g, b};
    }

    rgbToHsl(r, g, b) {
        r /= 255;
        g /= 255;
        b /= 255;
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;
        if (max === min) {
            h = s = 0;
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

    hslToRgb(h, s, l) {
        let r, g, b;
        if (s === 0) {
            r = g = b = l;
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
        return {r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255)};
    }

    hexToHsl(hex) {
        const rgb = this.hexToRgb(hex);
        const hsl = this.rgbToHsl(rgb.r, rgb.g, rgb.b);
        return {h: hsl.h * 360, s: hsl.s * 100, l: hsl.l * 100};
    }

    calculateCircuitPositions({
                                  diagramWidth,
                                  circuitHeight,
                                  cableSpacing,
                              }) {

        let currentY = 0;
        const tracksSpacing = 200;

        this.diagram.circuits.forEach(circuit => {
            circuit.width = this.circuitWidth;
            circuit.x = diagramWidth / 2;
            circuit.y = currentY + (circuit.totalInputTracks * cableSpacing) + (circuitHeight / 2) + tracksSpacing;
            circuit.height = circuit.totalInputTracks * cableSpacing
                + tracksSpacing
                + circuitHeight
                + tracksSpacing
                + circuit.totalOutputTracks * cableSpacing;
            currentY += circuit.height;
        });

        // It's the total height of the patch.
        return {patchHeight: currentY}
    }

}
