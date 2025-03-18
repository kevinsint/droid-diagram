export function calculateCircuitPositions({circuits, diagramWidth, circuitHeight, circuitWidth, cableSpacing}) {

    let currentY = 0;
    const tracksSpacing = 100;

    circuits.forEach((circuit, index) => {
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
    return currentY;
}
