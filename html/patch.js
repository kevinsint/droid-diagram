export default class Patch {
    constructor({specifications, patchText}) {
        this.specifications = specifications;
        this.circuits = this.parsePatch(patchText);
    }

    parsePatch(patchText) {

        // Extract lines to array.
        const lines = patchText.split('\n').map(line => line.trim());
        const circuits = [];
        let circuitId = null;
        // Store the last comment encountered
        let lastComment = '';


        for (const line of lines) {

            // Capture comments
            if (line.startsWith('#')) {
                // Remove the # and trim
                lastComment = line.substring(1).trim();
                continue;
            }

            // Skip comments and empty lines
            if (line.startsWith('#') || line === '') continue;

            // Add new circuit.
            // Circuit type is written in brackets [circuit]
            if (line.startsWith('[')) {
                const type = line.slice(1, -1);
                // Many circuit of the same name exist, so add a index suffix.
                const circuitIndex = circuits.length + 1;
                circuitId = `${type}_${circuitIndex}`;
                circuits.push({
                    id: circuitId,
                    type,
                    description: lastComment,
                    inputs: [],
                    outputs: []
                });
                lastComment = '';

            } else {
                const [pinName, value] = line.split('=').map(part => part.trim());

                if (value && value.startsWith('_')) {

                    // Means no circuit has been created yet.
                    // So those line is placed before the first circuit.
                    // Just ignore it for now.
                    if (!circuitId) {
                        continue;
                    }

                    // Cable name _CABLE_NAME. Removes what's set after the cable name.
                    let cableName = value.split('#')[0].trim().split(' ')[0];
                    // remove underscore
                    cableName = cableName.slice(1);

                    // get current circuit by id
                    const currentCircuit = circuits.find(circuit => circuit.id === circuitId);

                    // Add input pin.
                    if (this.isInputParameter(pinName, currentCircuit.type)) {
                        currentCircuit.inputs.push({
                            pinName,
                            cableName
                        });
                    }

                    // Add output pin.
                    if (this.isOutputParameter(pinName, currentCircuit.type)) {
                        currentCircuit.outputs.push({
                            pinName,
                            cableName
                        });
                    }
                }
            }
        }

        return circuits;
    }

    isInputParameter(key, circuitType) {
        return this.specifications?.[circuitType]?.inputs?.[key] !== undefined;
    }

    isOutputParameter(key, circuitType) {
        return this.specifications?.[circuitType]?.outputs?.[key] !== undefined;
    }
}

