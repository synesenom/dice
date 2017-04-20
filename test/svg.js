var assert = require("assert");
const svg = require("../src/dice").svg;

var LAPS = 10000;

describe("dice", function() {
    describe("svg", function() {
        describe("integer()", function () {
            it("should return a random <integer>", function () {
                for (var lap = 0; lap < LAPS; lap++) {
                    assert.equal(true, /^[+-]?[0-9]+$/.test(svg.integer()));
                }
            });
        });

        describe("number()", function () {
            it("should return a random <number>", function () {
                for (var lap = 0; lap < LAPS; lap++) {
                    assert.equal(true, /^[+-]?[0-9]*\.?[0-9]+([Ee][+-]?[0-9]+)?$/.test(svg.number()));
                }
            });
        });

        describe("length()", function () {
            it("should return a random <length>", function () {
                for (var lap = 0; lap < LAPS; lap++) {
                    assert.equal(true,
                        /^[+-]?[0-9]*\.?[0-9]+([Ee][+-]?[0-9]+)?(em|ex|px|in|cm|mm|pt|pc|%)?$/.test(
                            svg.length(Math.random() < 0.5)
                        ));
                }
            });
        });

        describe("coordinate()", function () {
            it("should return a random <coordinate>", function () {
                for (var lap = 0; lap < LAPS; lap++) {
                    assert.equal(true,
                        /^[+-]?[0-9]*\.?[0-9]+([Ee][+-]?[0-9]+)?(em|ex|px|in|cm|mm|pt|pc|%)?$/.test(
                            svg.coordinate()
                        ));
                }
            });
        });

        describe("color()", function () {
            it("should return a random <color>", function () {
                for (var lap = 0; lap < LAPS; lap++) {
                    var re = new RegExp("^(#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})" +
                        "|(red|green|blue)" +
                        "|rgb\\((\\d+,\\d+,\\d+|\\d+%,\\d+%,\\d+%)(,\\d*.?\\d+)?\\))$");
                    assert.equal(true, re.test(svg.color()));
                }
            });
        });

        describe("opacityValue()", function () {
            it("should return a random <opacity-value>", function () {
                for (var lap = 0; lap < LAPS; lap++) {
                    assert.equal(true, /^(1|0)\.?[0-9]+$/.test(svg.opacityValue()));
                }
            });
        });

        describe("transformList()", function () {
            it("should return a random <transform-list>", function () {
                var re = new RegExp("^((matrix|translate|scale|rotate|skew(X|Y))" +
                    "\\((-?\\d+\\.?\\d+,?)+\\) ?)+$");
                for (var lap = 0; lap < LAPS; lap++) {
                    assert.equal(true, re.test(svg.transformList()));
                }
            });
        });

        describe("point()", function () {
            it("should return a random <point>", function () {
                for (var lap = 0; lap < LAPS; lap++) {
                    assert.equal(true, /^-?\d+\.?\d+,-?\d+\.?\d+$/.test(svg.point()));
                }
            });
        });
    });
});
