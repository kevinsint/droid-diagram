# DROID Diagram

Try it here : https://droid.kevinsint.live/

I chose to go with modular synthesizers because I enjoy having physical access to the components and being able to clearly see the wiring between modules. With the Droid, which operates similarly, I missed the ability to visualize the wiring. To address this, I created a small app to display the wiring diagram for the Droid. This tool aids in understanding and debugging.

### Upcoming Features

- View cable attenuation and offset.
- View parameters on unwired pins.

#### Patch

The patch is the complete set of circuit definitions, parameters, and cable connections.

#### Circuits

A circuit represents a function within the patch.

Pins

- Input Pins: Located along the top edge of the circuit.
- Output Pins: Positioned at the bottom edge of the circuit.

#### Cables

A cable represents a connection between a source output pin and one or more target input pins.

- An output pin can connect to one or more input pins on any circuit, including itself (self-patching).
- Each cable has a unique name, denoted as cableName.
- The cable follows a designated route, consisting of tracks and lanes.

#### Signal Flow

- Signal flow, from output to input, adheres to the designated lane signal flow directions. The direction is always from an output pin to an input pin.
- Possible directions are UPWARD and DOWNWARD.

#### Route

The route refers to the specific lane and track a cable uses to connect pins.

#### Lanes

Lanes are the vertical segments of a route that run between circuits.

- Signal flow is upward in lanes positioned to the left of the circuits.
- Signal flow is downward in lanes positioned to the right of the circuits.

#### Tracks

A track is the horizontal segment of a route that connects a circuit’s pins to the lanes.

- A track can connect to one downward lane and one upward lane simultaneously.
- Tracks are assigned only to pins connected by a cable.
- Each circuit has its own set of tracks:
  - Output pins have their own tracks.
  - Input pins have their own tracks.
- Tracks are assigned from nearest to farthest from the circuit:
  - Input pin tracks: Assigned from right to left (needs revision).
  - Output pin tracks: Assigned from left to right (needs revision).
- Track assignment is independent of lane assignment.
- Tracks are identified by an index.
