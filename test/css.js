var assert = require("assert");
var css = require("../src/dice").css;

var LAPS = 10000;

describe("pick", function() {
    describe("css", function() {
        describe("integer()", function () {
            it("should return a random CSS <integer>", function () {
                for (var lap = 0; lap < LAPS; lap++) {
                    assert.equal(true, /^[+-]?[0-9]+$/.test(css.integer()));
                }
            });
        });

        describe("number()", function () {
            it("should return a random CSS <number>", function () {
                for (var lap = 0; lap < LAPS; lap++) {
                    assert.equal(true, /^[+-]?[0-9]*\.?[0-9]+$/.test(css.number()));
                }
            });
        });

        describe("length()", function () {
            it("should return a random CSS <length>", function () {
                for (var lap = 0; lap < LAPS; lap++) {
                    assert.equal(true,
                        /^[+-]?[0-9]*\.?[0-9]+([Ee][+-]?[0-9]+)?(em|ex|px|in|cm|mm|pt|pc|%)$/.test(
                            css.length(Math.random() < 0.5)
                        ));
                }
            });
        });

        describe("color()", function () {
            it("should return a random CSS <color>", function () {
                for (var lap = 0; lap < LAPS; lap++) {
                    var re = new RegExp("^(#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})" +
                        "|(red|green|blue)" +
                        "|rgb\\(\\d+%?,\\d+%?,\\d+%?(,\\d*.?\\d+)?\\))$");
                    assert.equal(true, re.test(css.color()));
                }
            });
        });

        describe("opacityValue()", function () {
            it("should return a random CSS <opacity-value>", function () {
                for (var lap = 0; lap < LAPS; lap++) {
                    assert.equal(true, /^[0-9]*\.?[0-9]+$/.test(css.opacityValue()));
                }
            });
        });
    });
});
