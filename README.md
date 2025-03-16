# DROID Diagram



#### Patch

The patch is the ensemble all circuits definitions parameters and the cables connections.

### Circuits

A circuit is a function in the patch.

#### Pins

- Input Pins: Located along the top edge of the circuit.

- Output Pins: Positioned at the bottom edge of the circuit.

### Cables

A cable represents a connection between an source output pin and one or more target input pins.

- An output pin can connect to one or more input pins of any circuit, including itself (self-patching).
- Each cable has a unique name, denoted as `cableName`.
- The cable follows the designated route, consisting of tracks and lanes.

#### Signal flow

- The signal flow, from output to input, follows the designated lane signal flow directions.
The direction of signal flow is always from an output pin to an input pin.
- The Possible directions are `UPWARD` and `DOWNWARD`.

#### Route

The route refers to the specific lane and track a cable uses to connect pins.

#### Lanes

Lanes are the vertical segments of a route that run between circuits.

- Signal flow is upward on lanes positioned to the left of the circuits.
- Signal flow is downward on lanes positioned to the right of the circuits.

#### Track

A track is the horizontal segment of a route that connects a circuit’s pins to the lanes.

- A track can connect to one downward lane and one upward lane simultaneously.
- Tracks are assigned only to pins connected by a cable.
- Each circuit has its own set of tracks:
  - Output pins have their own tracks.
  - Input pins have their own tracks.
- Tracks are assigned from nearest to farthest from the circuit:
  - Input pin tracks: Assigned from right to left (need revision).
  - Output pin tracks: Assigned from left to right (need revision).
- Track assignment is independent of lane assignment.
- Tracks are identified by an index.



