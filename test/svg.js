var assert = require("assert");
const svg = require("../src/dice").svg;

var LAPS = 10000;

describe("dice", function() {
    describe("svg", function() {
        describe("integer", function () {
            it("should return a random SVG <integer>: string is valid SVG <integer>", function () {
                for (var lap = 0; lap < LAPS; lap++) {
                    var r = svg.integer();
                    assert.equal(true, /^[+-]?[0-9]+$/.test(r.o));
                }
            });

            it("should return a random SVG <integer>: in/out values are the same", function () {
                for (var lap = 0; lap < LAPS; lap++) {
                    var r = svg.integer();
                    assert.equal(true, r.i == parseInt(r.o));
                }
            });

            it("should return a random SVG <integer>: value is an integer", function () {
                for (var lap = 0; lap < LAPS; lap++) {
                    var r = svg.integer();
                    assert.equal(true, r.i == parseInt(r.i));
                }
            });
        });

        describe("number", function () {
            it("should return a random SVG <number>: string is valid SVG <number>", function () {
                for (var lap = 0; lap < LAPS; lap++) {
                    var r = svg.number();
                    assert.equal(true, /^[+-]?[0-9]*\.?[0-9]+([Ee][+-]?[0-9]+)?$/.test(r.o));
                }
            });

            it("should return a random SVG <number>: in/out values are the same", function () {
                for (var lap = 0; lap < LAPS; lap++) {
                    var r = svg.number();
                    assert.equal(true, r.i == parseFloat(r.o));
                }
            });

            it("should return a random SVG <number>: value is a number", function () {
                for (var lap = 0; lap < LAPS; lap++) {
                    var r = svg.number();
                    assert.equal(true, r.i == parseFloat(r.i));
                }
            });
        });

        describe("length", function () {
            it("should return a random SVG <length>: string is valid SVG <length>", function () {
                for (var lap = 0; lap < LAPS; lap++) {
                    var r = svg.length();
                    assert.equal(true, /^[+-]?[0-9]*\.?[0-9]+([Ee][+-]?[0-9]+)?(em|ex|px|in|cm|mm|pt|pc|%)?$/.test(r.o));
                }
            });

            it("should return a random SVG <length>: in/out values are the same", function () {
                for (var lap = 0; lap < LAPS; lap++) {
                    var r = svg.length();
                    assert.equal(true, r.i == parseFloat(r.o));
                }
            });

            it("should return a random SVG <integer>: value is an integer", function () {
                for (var lap = 0; lap < LAPS; lap++) {
                    var r = svg.length();
                    assert.equal(true, r.i == parseFloat(r.i));
                }
            });
        });
        return;

        describe("coordinate", function () {
            it("should return a random <coordinate>", function () {
                for (var lap = 0; lap < LAPS; lap++) {
                    assert.equal(true,
                        /^[+-]?[0-9]*\.?[0-9]+([Ee][+-]?[0-9]+)?(em|ex|px|in|cm|mm|pt|pc|%)?$/.test(
                            svg.coordinate()
                        ));
                }
            });
        });

        describe("color", function () {
            it("should return a random <color>", function () {
                for (var lap = 0; lap < LAPS; lap++) {
                    var re = new RegExp("^(#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})" +
                        "|(red|green|blue)" +
                        "|rgb\\((\\d+,\\d+,\\d+|\\d+%,\\d+%,\\d+%)(,\\d*.?\\d+)?\\))$");
                    assert.equal(true, re.test(svg.color()));
                }
            });
        });

        describe("opacityValue", function () {
            it("should return a random <opacity-value>", function () {
                for (var lap = 0; lap < LAPS; lap++) {
                    assert.equal(true, /^(1|0)\.?[0-9]*$/.test(svg.opacityValue()));
                }
            });
        });

        describe("transformList", function () {
            it("should return a random <transform-list>", function () {
                var re = new RegExp("^((matrix|translate|scale|rotate|skew(X|Y))" +
                    "\\((-?\\d+\\.?\\d+,?)+\\) ?)+$");
                for (var lap = 0; lap < LAPS; lap++) {
                    assert.equal(true, re.test(svg.transformList()));
                }
            });
        });

        describe("point", function () {
            it("should return a random <point>", function () {
                for (var lap = 0; lap < LAPS; lap++) {
                    assert.equal(true, /^-?\d+\.?\d+,-?\d+\.?\d+$/.test(svg.point()));
                }
            });
        });

        describe("path()", function () {
            it("should return a random <path>", function () {
                var re = new RegExp("^( ?(m|M|l|L|h|H|v|V|c|C|s|S|q|Q|t|T|a|A|z|Z)" +
                    "( (-?\\d+\.?\\d+|1|0),?)*)+$");
                for (var lap = 0; lap < LAPS; lap++) {
                    assert.equal(true, re.test(svg.path()));
                }
            });
        });
    });
});
