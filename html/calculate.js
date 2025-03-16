// Dynamic document height.
export function calculateTotalHeight({circuits, circuitHeight, circuitGap}) {
    return Math.max(1200, (circuits.length * (circuitHeight
            + circuitGap))
        + circuitGap);
}

// Set the position in the circuit definition.
export function calculateCircuitPositions({circuits, diagramWidth, circuitHeight, circuitGap}) {
    // Start with a gap from the top.
    let currentY = circuitGap;

    // Use the index as the multiplier to define the y position of the circuit.
    circuits.forEach((circuit, index) => {
        // Circuit's box are aligned from the center point.
        circuit.x = diagramWidth / 2;
        // Center of the circuit
        circuit.y = currentY + circuitHeight / 2;
        currentY += circuitHeight + circuitGap;
    });
}
