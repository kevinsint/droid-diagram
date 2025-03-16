const specifications = {
    "select": {
        "inputs": {
            "input": {
                "default": 0,
                "offset": null
            },
            "select": {},
            "selectat": {}
        },
        "outputs": {
            "output": {}
        }
    },
    "math": {
        "inputs": {
            "input1": {},
            "input2": {},
            "amount": {}
        },
        "outputs": {
            "average": {},
            "ceil": {},
            "cosine": {},
            "difference": {},
            "floor": {},
            "logarithm": {},
            "maximum": {},
            "minimum": {},
            "modulo": {},
            "negation": {},
            "power": {},
            "product": {},
            "quotient": {},
            "reciprocal": {},
            "root": {},
            "round": {},
            "sine": {},
            "square": {},
            "sum": {}
        }
    },
    "logic": {
        "inputs": {
            "countvalue": {},
            "highvalue": {},
            "input1": {},
            "input2": {},
            "input3": {},
            "input4": {},
            "input5": {},
            "input6": {},
            "input7": {},
            "input8": {},
            "lowvalue": {},
            "threshold": {}
        },
        "outputs": {
            "and": {},
            "count": {},
            "countlow": {},
            "nand": {},
            "negated": {},
            "nor": {},
            "or": {},
            "xor": {}
        }
    },
    "copy": {
        "inputs": {
            "input": {
                "default": 0
            }
        },
        "outputs": {
            "output": {}
        }
    },
    "clocktool": {
        "inputs": {
            "clock": {},
            "delay": {
                "default": 0
            },
            "divide": {
                "default": 1
            },
            "dutycycle": {},
            "gatelength": {},
            "multiply": {
                "default": 1
            },
            "reset": {},
            "inputpitch": {}
        },
        "outputs": {
            "output": {},
            "outputpitch": {}
        }
    },
    "bernoulli": {
        "inputs": {
            "distribution": {
                "default": 0.5
            },
            "input": {
                "default": 0
            }
        },
        "outputs": {
            "output1": {},
            "output2": {}
        }
    },
    "encoder": {
        "inputs": {
            "autozoom": {},
            "clear": {},
            "clearall": {},
            "color": {},
            "discrete": {},
            "dontsave": {},
            "encoder": {
                "default": 1
            },
            "led": {},
            "ledfill": {},
            "loadpreset": {},
            "mode": {},
            "movementticks": {},
            "negativecolor": {},
            "notch": {},
            "outputoffset": {},
            "outputscale": {},
            "override": {},
            "preset": {},
            "savepreset": {},
            "select": {},
            "selectat": {},
            "sensivity": {},
            "sharewithnext": {},
            "smooth": {},
            "snapforce": {},
            "snapto": {},
            "startvalue": {}
        },
        "outputs": {
            "button": {},
            "moveddown": {},
            "movedup": {},
            "output": {},
            "valuechanged": {}
        }
    },
    "switch": {
        "inputs": {
            "backward": {},
            "forward": {},
            "input1": {
                "default": 0
            },
            "input2": {
                "default": 0
            },
            "input3": {
                "default": 0
            },
            "input4": {
                "default": 0
            },
            "input5": {},
            "input6": {},
            "input7": {},
            "input8": {},
            "input9": {},
            "input10": {},
            "input11": {},
            "input12": {},
            "input13": {},
            "input14": {},
            "input15": {},
            "input16": {},
            "offset": {
                "default": 0
            },
            "reset": {}
        },
        "outputs": {
            "output1": {},
            "output2": {},
            "output3": {},
            "output4": {},
            "output5": {},
            "output6": {},
            "output7": {},
            "output8": {},
            "output9": {},
            "output10": {},
            "output11": {},
            "output12": {},
            "output13": {},
            "output14": {},
            "output15": {},
            "output16": {}
        }
    },
    "mixer": {
        "inputs": {
            "input1": {
                "default": 0
            },
            "input2": {
                "default": 0
            },
            "input3": {},
            "input4": {},
            "input5": {},
            "input6": {},
            "input7": {},
            "input8": {}
        },
        "outputs": {
            "average": {},
            "maximum": {},
            "minimum": {},
            "output": {}
        }
    },
    "random": {
        "inputs": {
            "clock": {},
            "maximum": {
                "default": 1
            },
            "minimum": {
                "default": 0
            },
            "steps": {}
        },
        "outputs": {
            "output": {}
        }
    },
    "cvlooper": {
        "inputs": {
            "clock": {},
            "cvin": {},
            "length": {
                "default": 1
            },
            "offset": {
                "default": 0
            },
            "speed": {
                "default": 1
            }
        },
        "outputs": {
            "output": {}
        }
    }
}
export default specifications;
