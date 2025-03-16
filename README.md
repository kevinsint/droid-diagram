# DROID Diagram



#### Patch

The patch is the ensemble all circuits definitions parameters and the cables connections.

### Circuits

#### Circuit

A circuit is a function in the patch.

#### Pins

- Input Pins: Located along the top edge of the circuit.

- Output Pins: Positioned at the bottom edge of the circuit.

### Cables

#### Cable

A cable represents a connection between an output pin and one or more input pins.

- An output pin can connect to one or more input pins of any circuit, including itself (self-patching).
- Each cable has a unique name, denoted as `cableName`.
- The signal flow must always follow the designated lane signal flow directions.

#### Signal flow

The direction of signal flow is always from an output pin to an input pin.

- Possible directions: `upward`, `downward`.

#### Lanes

Lanes are the vertical segments of a cable that run between circuits.

- Signal flow is upward on lanes positioned to the left of the circuits.
- Signal flow is downward on lanes positioned to the right of the circuits.
- Shorter cables should use the lanes closest to the circuit.
- Cables are be assigned to lanes without gaps, starting from the lanes nearest the circuit.

#### Track

A track is the horizontal segment of a cable that connects a circuit’s pins to the lanes.

- A track can connect to one downward lane and one upward lane simultaneously.
- Tracks are assigned only to pins connected by a cable.
- Each circuit has its own set of tracks:
  - Output pins have their own tracks.
  - Input pins have their own tracks.
- Tracks are assigned from nearest to farthest from the circuit:
  - Input pin tracks: Assigned from right to left.
  - Output pin tracks: Assigned from left to right.
- Track assignment is independent of lane assignment.
- Tracks are identified by `trackIndex`.

#### Route

The route refers to the specific lane and track a cable uses to connect pins.

