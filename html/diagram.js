import {DOWNWARD, UPWARD} from "./const.js";


export default class Diagram {

    constructor({patch}) {
        this.circuits = patch.circuits;
        this.cables = [];
        this.brokenCables = new Set();
        this.specs = new Map();

        this.collectCableConnections();
        this.removeBrokenCables();
        this.determineSignalFlow();
        this.assignLanes();
        this.assignTracks();
        this.updateSpecs();
    }

    collectCableConnections() {

        this.circuits.forEach((circuit, circuitIndex) => {

            // Process each circuit output pins (signal sources).
            circuit.outputs.forEach((output) => {
                // not every output has a cable.
                if (!output.cableName) return;

                // Find existing cable or create a new one
                let cable = this.cables.find(c => c.cableName === output.cableName);
                if (!cable) {
                    cable = {
                        cableName: output.cableName,
                        source: {},
                        targets: []
                    };
                    this.cables.push(cable);
                }

                // todo add error validation, can't have multiple output for a same cable.

                cable.source = {
                    circuitId: circuit.id,
                    circuitIndex,
                    pinName: output.pinName
                };
            });

            // Process each circuit input pins (signal targets).
            circuit.inputs.forEach((input) => {
                // not every input has a cable.
                if (!input.cableName) return;

                let cable = this.cables.find(c => c.cableName === input.cableName);
                // add new cable.
                if (!cable) {
                    cable = {
                        cableName: input.cableName,
                        source: {},
                        targets: []
                    };
                    this.cables.push(cable);
                }

                // Append targets to cable.
                cable.targets.push({
                    circuitId: circuit.id,
                    circuitIndex,
                    pinName: input.pinName
                });
            });
        });
    }

    removeBrokenCables() {

        // Use filter to create a new array of valid cables
        const validCables = [];

        for (let i = 0; i < this.cables.length; i++) {
            const cable = this.cables[i];
            // Check if source is missing required properties or if there are no targets
            if (!cable.source ||
                Object.keys(cable.source).length === 0 ||
                !cable.source.circuitId ||
                !cable.targets.length) {
                // Add cable name to brokenCables set
                this.brokenCables.add(cable.cableName);
            } else {
                validCables.push(cable);
            }
        }

        // Replace the original cables array with the filtered one
        this.cables.length = 0;
        this.cables.push(...validCables);
    }


    determineSignalFlow() {
        for (const cable of this.cables) {
            // Each target has its own signal flow direction.
            for (const target of cable.targets) {
                target.flow = target.circuitIndex <= cable.source.circuitIndex ? UPWARD : DOWNWARD;
            }
            cable.indexRange = {
                min: cable.source.circuitIndex,
                max: Math.max(...cable.targets.map(t => t.circuitIndex))
            };
        }
    }

    assignLanes() {
        // Sort cables by their span, circuits distance.
        this.cables.sort((a, b) => {
            const spanA = a.indexRange.max - a.indexRange.min;
            const spanB = b.indexRange.max - b.indexRange.min;
            // Longer spans first.
            return spanA - spanB;
        });

        const upwardLanes = new Set();
        const downwardLanes = new Set();

        this.cables.forEach(cable => {
            for (const target of cable.targets) {
                if (target.flow === UPWARD) {
                    // assign this cable name to the first free upward lane.
                    if (!upwardLanes.has(cable.cableName)) {
                        upwardLanes.add(cable.cableName);
                    }
                    target.lane = upwardLanes.size * UPWARD;
                }
                if (target.flow === DOWNWARD) {
                    // assign this cable name to the first free downward lane.
                    if (!downwardLanes.has(cable.cableName)) {
                        downwardLanes.add(cable.cableName);
                    }
                    target.lane = downwardLanes.size * DOWNWARD;
                }
            }
        });
    }

    assignTracks() {

        const ins = {};
        const outs = {};
        const trackIn = {};
        const trackOut = {};

        this.cables.forEach(cable => {

            const sourceId = `${cable.source.circuitId}.${cable.cableName}`;

            // Output Sources
            if (!outs[sourceId]) {
                // The cable doesn't exist on this circuit side.
                trackOut[cable.source.circuitId] = trackOut[cable.source.circuitId] || 1;
                outs[sourceId] = trackOut[cable.source.circuitId];
                trackOut[cable.source.circuitId]++;
            }

            // Input Targets
            for (const target of cable.targets) {
                const targetId = `${target.circuitId}.${cable.cableName}`;
                if (!ins[targetId]) {
                    trackIn[target.circuitId] = trackIn[target.circuitId] || 1;
                    ins[targetId] = trackIn[target.circuitId];
                    trackIn[target.circuitId]++;
                }
            }
        });

        // Now set those tracks to the pins of each cable.
        this.cables.forEach(cable => {
            const sourceId = `${cable.source.circuitId}.${cable.cableName}`;
            cable.source.track = outs[sourceId];
            for (const target of cable.targets) {
                const targetId = `${target.circuitId}.${cable.cableName}`;
                target.track = ins[targetId];
            }
        });

        // Update the circuits with their total track counts
        this.circuits.forEach(circuit => {
            circuit.totalInputTracks = trackIn[circuit.id] ? trackIn[circuit.id] - 1 : 0;
            circuit.totalOutputTracks = trackOut[circuit.id] ? trackOut[circuit.id] - 1 : 0;
        });
    }

    updateSpecs() {
        this.specs.set('maxPins', this.specMaxPins());
    }

    specMaxPins() {
        let maxPins = 0;
        // Find larger circuit
        this.circuits.forEach(circuit => {
            maxPins = Math.max(maxPins, circuit.totalInputTracks);
            maxPins = Math.max(maxPins, circuit.totalOutputTracks);
        });
        return maxPins;
    }
}

