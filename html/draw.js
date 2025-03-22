import { calculateCircuitPositions } from './calculate.js';

export default class Draw {
    constructor({ diagram, container }) {
        this.diagram = diagram;
        this.container = container;

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
        ];

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
            baseCableSpace: parseInt(styles.getPropertyValue('--base-cable-space') || '100', 10),
            cableFontSize: parseInt(styles.getPropertyValue('--cable-font-size'), 10),
            cableLabelColor: styles.getPropertyValue('--cable-label-color').trim(),
            cableSpacing: parseInt(styles.getPropertyValue('--cable-spacing'), 10),
            cableWidth: parseInt(styles.getPropertyValue('--cable-width'), 10),
            circuitBorderColor: styles.getPropertyValue('--circuit-border-color').trim(),
            circuitColor: styles.getPropertyValue('--circuit-color').trim(),
            circuitFontSize: parseInt(styles.getPropertyValue('--circuit-font-size'), 10),
            circuitHeight: parseInt(styles.getPropertyValue('--circuit-height'), 10),
            circuitInputLabelColor: styles.getPropertyValue('--circuit-input-label-color').trim(),
            circuitLabelColor: styles.getPropertyValue('--circuit-label-color').trim(),
            circuitOutputLabelColor: styles.getPropertyValue('--circuit-output-label-color').trim(),
            circuitWidth: parseInt(styles.getPropertyValue('--circuit-width'), 10),
            diagramColor: styles.getPropertyValue('--diagram-color').trim(),
            diagramWidth: parseInt(styles.getPropertyValue('--diagram-width') || '2000', 10),
            fontFace: styles.getPropertyValue('--font-face').trim(),
            inputPinLabelOffset: parseInt(styles.getPropertyValue('--input-pin-label-offset'), 10),
            lanesOffset: parseInt(styles.getPropertyValue('--lanes-offset'), 10),
            outputPinLabelOffset: parseInt(styles.getPropertyValue('--output-pin-label-offset'), 10),
            pinFontSize: parseInt(styles.getPropertyValue('--pin-font-size'), 10),
            pinGap: parseInt(styles.getPropertyValue('--pin-gap'), 10),
            diagramMargin: 200
        };
    }

    render() {
        const { circuits, cables } = this.diagram;
        if (!circuits?.length) throw new Error("No circuits provided");

        const patchHeight = calculateCircuitPositions({
            circuits,
            diagramWidth: this.settings.diagramWidth,
            circuitHeight: this.settings.circuitHeight,
            circuitWidth: this.settings.circuitWidth,
            cableSpacing: this.settings.cableSpacing,
        });

        const diagramHeight = patchHeight + this.settings.diagramMargin * 2;
        const scale = 1;
        const scaledWidth = this.settings.diagramWidth * scale;
        const scaledHeight = diagramHeight * scale;

        // Create Konva stage
        const stage = new Konva.Stage({
            container: this.container,
            width: scaledWidth,
            height: scaledHeight
        });

        const layer = new Konva.Layer();
        stage.add(layer);

        // Draw background
        const background = new Konva.Rect({
            x: 0,
            y: 0,
            width: scaledWidth,
            height: scaledHeight,
            fill: this.settings.diagramColor
        });
        layer.add(background);

        // Draw circuits
        circuits.forEach(circuit => {
            this.drawCircuit({ layer, circuit, scale });
        });

        // Draw cables
        if (cables.length) {
            this.drawCables({ layer, circuits, cables, scale });
        }

        layer.draw();
    }

    drawCircuit({ layer, circuit, scale }) {
        // Circuit rectangle with border
        const circuitRect = new Konva.Rect({
            x: (circuit.x - this.settings.circuitWidth / 2) * scale,
            y: (circuit.y - this.settings.circuitHeight / 2) * scale,
            width: this.settings.circuitWidth * scale,
            height: this.settings.circuitHeight * scale,
            fill: this.settings.circuitColor,
            stroke: this.settings.circuitBorderColor,
            strokeWidth: 3 * scale
        });
        layer.add(circuitRect);

        // Circuit label
        const label = new Konva.Text({
            text: circuit.id,
            fontSize: this.settings.circuitFontSize * scale,
            fontFamily: this.settings.fontFace,
            fill: this.settings.circuitLabelColor
        });
        const textWidth = label.width();
        const textHeight = label.height();
        label.x((circuit.x * scale) - textWidth / 2);
        label.y((circuit.y * scale) - textHeight / 2);
        layer.add(label);

        // Draw pins
        if (circuit.inputs.length) {
            this.drawPinSet({
                layer,
                circuit,
                pins: circuit.inputs,
                type: 'input',
                scale
            });
        }
        if (circuit.outputs.length) {
            this.drawPinSet({
                layer,
                circuit,
                pins: circuit.outputs,
                type: 'output',
                scale
            });
        }
    }

    drawPinSet({ layer, circuit, pins, type, scale }) {
        const pinsWidth = (pins.length - 1) * this.settings.pinGap;
        let x = circuit.x - pinsWidth / 2;
        let y = type === 'input' ? circuit.y - this.settings.circuitHeight / 2 : circuit.y + this.settings.circuitHeight / 2;
        const labelOffset = type === 'input' ? this.settings.inputPinLabelOffset : this.settings.outputPinLabelOffset;

        pins.forEach((pin, index) => {
            // Store pin position
            pin.x = x;
            pin.y = y;
            pin.index = index;

            const pinGroup = new Konva.Group();
            pinGroup.x(x * scale);
            pinGroup.y((type === 'input' ? y + labelOffset : y - labelOffset) * scale);
            pinGroup.rotation(-90);

            const textX = (type === 'input' ? -labelOffset : labelOffset) * scale;
            const pinText = new Konva.Text({
                x: textX,
                y: 0,
                text: pin.pinName,
                fontSize: this.settings.pinFontSize * scale,
                fontFamily: this.settings.fontFace,
                fill: type === 'input' ? this.settings.circuitInputLabelColor : this.settings.circuitOutputLabelColor
            });
            const textHeight = pinText.height();
            pinText.y(-textHeight / 2);
            pinGroup.add(pinText);
            layer.add(pinGroup);

            x += this.settings.pinGap;
        });
    }

    drawCables({ layer, circuits, cables, scale }) {
        this.renderColors({ cables });

        const cableSpacing = (this.settings.cableWidth + this.settings.cableSpacing) * scale;
        const center = (this.settings.diagramWidth / 2) * scale;
        const width = (this.settings.circuitWidth / 2 + cableSpacing) * scale;

        // Draw shadows
        cables.forEach(cable => {
            cable.targets.forEach(target => {
                const sourceCircuit = circuits.find(c => c.id === cable.source.circuitId);
                const targetCircuit = circuits.find(c => c.id === target.circuitId);
                const sourceOutput = sourceCircuit.outputs.find(o => o.pinName === cable.source.pinName);
                const targetInput = targetCircuit.inputs.find(i => i.pinName === target.pinName);

                const laneOffset = center + (this.settings.lanesOffset * target.flow * scale) + (width * target.flow);
                const laneX = laneOffset + target.lane * cableSpacing;
                const sourceOffset = cable.source.track * cableSpacing;
                const targetOffset = target.track * cableSpacing;

                const points = [
                    sourceOutput.x * scale, sourceOutput.y * scale,
                    sourceOutput.x * scale, (sourceOutput.y + sourceOffset) * scale,
                    laneX, (sourceOutput.y + sourceOffset) * scale,
                    laneX, (targetInput.y - targetOffset) * scale,
                    targetInput.x * scale, (targetInput.y - targetOffset) * scale,
                    targetInput.x * scale, targetInput.y * scale
                ];

                const shadowLine = new Konva.Line({
                    points,
                    stroke: this.settings.diagramColor,
                    strokeWidth: (this.settings.cableWidth + 8) * scale,
                    lineCap: 'round',
                    lineJoin: 'round'
                });
                layer.add(shadowLine);
            });
        });

        // Draw cables and labels
        cables.forEach(cable => {
            cable.targets.forEach(target => {
                const sourceCircuit = circuits.find(c => c.id === cable.source.circuitId);
                const targetCircuit = circuits.find(c => c.id === target.circuitId);
                const sourceOutput = sourceCircuit.outputs.find(o => o.pinName === cable.source.pinName);
                const targetInput = targetCircuit.inputs.find(i => i.pinName === target.pinName);

                const laneOffset = center + (this.settings.lanesOffset * target.flow * scale) + (width * target.flow);
                const laneX = laneOffset + target.lane * cableSpacing;
                const sourceOffset = cable.source.track * cableSpacing;
                const targetOffset = target.track * cableSpacing;

                const points = [
                    sourceOutput.x * scale, sourceOutput.y * scale,
                    sourceOutput.x * scale, (sourceOutput.y + sourceOffset) * scale,
                    laneX, (sourceOutput.y + sourceOffset) * scale,
                    laneX, (targetInput.y - targetOffset) * scale,
                    targetInput.x * scale, (targetInput.y - targetOffset) * scale,
                    targetInput.x * scale, targetInput.y * scale
                ];

                const cableLine = new Konva.Line({
                    points,
                    stroke: cable.color,
                    strokeWidth: this.settings.cableWidth * scale,
                    lineCap: 'round',
                    lineJoin: 'round'
                });
                layer.add(cableLine);

                // Label positions
                const sourceEdgeX = target.flow < 0 ?
                    (sourceCircuit.x - this.settings.circuitWidth / 2 - 10) * scale :
                    (sourceCircuit.x + this.settings.circuitWidth / 2 + 10) * scale;
                const sourceLabelY = (sourceOutput.y + sourceOffset) * scale;

                const targetEdgeX = target.flow < 0 ?
                    (targetCircuit.x - this.settings.circuitWidth / 2 - 10) * scale :
                    (targetCircuit.x + this.settings.circuitWidth / 2 + 10) * scale;
                const targetLabelY = (targetInput.y - targetOffset) * scale;

                // Draw labels
                this.drawCableLabel({
                    layer,
                    x: sourceEdgeX,
                    y: sourceLabelY,
                    label: cable.cableName,
                    color: cable.color,
                    scale
                });

                this.drawCableLabel({
                    layer,
                    x: targetEdgeX,
                    y: targetLabelY,
                    label: cable.cableName,
                    color: cable.color,
                    scale
                });
            });
        });
    }

    drawCableLabel({ layer, x, y, label, color, scale }) {
        const tempText = new Konva.Text({
            text: label,
            fontSize: this.settings.cableFontSize * scale,
            fontFamily: this.settings.fontFace,
            fontStyle: 'bold'
        });
        const textWidth = tempText.width();
        const textHeight = tempText.height();
        const padding = 8 * scale;
        const rectWidth = textWidth + padding * 8; // Matches original padding
        const rectHeight = textHeight + padding * 2;
        const cornerRadius = 20 * scale;

        const labelGroup = new Konva.Group({
            x: x,
            y: y
        });

        const background = new Konva.Rect({
            x: -rectWidth / 2,
            y: -rectHeight / 2,
            width: rectWidth,
            height: rectHeight,
            fill: color,
            cornerRadius: cornerRadius
        });
        labelGroup.add(background);

        const text = new Konva.Text({
            x: -rectWidth / 2,
            y: -rectHeight / 2,
            width: rectWidth,
            height: rectHeight,
            text: label,
            fontSize: this.settings.cableFontSize * scale,
            fontFamily: this.settings.fontFace,
            fontStyle: 'bold',
            fill: this.settings.cableLabelColor,
            align: 'center',
            verticalAlign: 'middle'
        });
        labelGroup.add(text);

        layer.add(labelGroup);
    }

    renderColors({ cables }) {
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
                const { h, s, l } = paletteHsl[N - 1];
                const rgb = this.hslToRgb(h / 360, s / 100, l / 100);
                colors.push({ r: rgb.r, g: rgb.g, b: rgb.b });
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
                colors.push({ r: rgb.r, g: rgb.g, b: rgb.b });
            }
        }
        return colors;
    }

    hexToRgb(hex) {
        hex = hex.replace(/^#/, '');
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        return { r, g, b };
    }

    rgbToHsl(r, g, b) {
        r /= 255; g /= 255; b /= 255;
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;
        if (max === min) {
            h = s = 0;
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }
        return { h, s, l };
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
        return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
    }

    hexToHsl(hex) {
        const rgb = this.hexToRgb(hex);
        const hsl = this.rgbToHsl(rgb.r, rgb.g, rgb.b);
        return { h: hsl.h * 360, s: hsl.s * 100, l: hsl.l * 100 };
    }
}
