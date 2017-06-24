var assert = require("assert");
var css = require("../src/dice").css;

var LAPS = 10000;

describe("dice", function() {
    describe("css", function() {
        describe("integer", function () {
            it("should return a random CSS <integer>: string is valid CSS <integer>", function () {
                for (var lap = 0; lap < LAPS; lap++) {
                    var r = css.integer();
                    assert.equal(true, /^[+-]?[0-9]+$/.test(r.s));
                }
            });

            it("should return a random CSS <integer>: in/out values are the same", function () {
                for (var lap = 0; lap < LAPS; lap++) {
                    var r = css.integer();
                    assert.equal(true, r.o == parseInt(r.s));
                }
            });

            it("should return a random CSS <integer>: value is an integer", function () {
                for (var lap = 0; lap < LAPS; lap++) {
                    var r = css.integer();
                    assert.equal(true, r.o == parseInt(r.s));
                }
            });
        });

        describe("number", function () {
            it("should return a random CSS <number>: string is valid CSS <number>", function () {
                for (var lap = 0; lap < LAPS; lap++) {
                    var r = css.number();
                    assert.equal(true, /^[+-]?\d*.?\d+$/.test(r.s));
                }
            });

            it("should return a random CSS <number>: in/out values are the same", function () {
                for (var lap = 0; lap < LAPS; lap++) {
                    var r = css.number();
                    assert.equal(true, r.o == parseFloat(r.s));
                }
            });

            it("should return a random CSS <number>: value is a float", function () {
                for (var lap = 0; lap < LAPS; lap++) {
                    var r = css.number();
                    assert.equal(true, r.o == parseFloat(r.s));
                }
            });
        });

        describe("length", function () {
            it("should return a random CSS <length>: string is valid CSS <length>", function () {
                for (var lap = 0; lap < LAPS; lap++) {
                    var r = css.length();
                    assert.equal(true, /^([+-]?\d*.?\d+(em|ex|px|in|cm|mm|pt|pc|%)|0)$/.test(r.s));
                }
            });

            it("should return a random CSS <length>: in/out values are the same", function () {
                for (var lap = 0; lap < LAPS; lap++) {
                    var r = css.length();
                    assert.equal(true, r.o == parseFloat(r.s));
                }
            });

            it("should return a random CSS <length>: value is a float", function () {
                for (var lap = 0; lap < LAPS; lap++) {
                    var r = css.length();
                    assert.equal(true, r.o == parseFloat(r.s));
                }
            });
        });

        describe("opacityValue", function () {
            it("should return a random CSS <opacity-value>: string is valid CSS <opacity-value>", function () {
                for (var lap = 0; lap < LAPS; lap++) {
                    var r = css.opacityValue();
                    assert.equal(true, /^\d?(\.\d+([eE]-\d+)?)?$/.test(r.s));
                }
            });

            it("should return a random CSS <opacity-value>: in/out values are the same", function () {
                for (var lap = 0; lap < LAPS; lap++) {
                    var r = css.opacityValue();
                    assert.equal(true, r.o == Math.min(1, Math.max(0, parseFloat(r.s))));
                }
            });

            it("should return a random CSS <opacity-value>: value is a float", function () {
                for (var lap = 0; lap < LAPS; lap++) {
                    var r = css.opacityValue();
                    assert.equal(true, r.o == parseFloat(r.s));
                }
            });

            it("should return a random CSS <opacity-value>: value is in [0, 1]", function () {
                for (var lap = 0; lap < LAPS; lap++) {
                    var r = css.opacityValue();
                    assert.equal(true, r.o >= 0 && r.s <= 1);
                }
            });
        });

        describe("color", function () {
            it("should return a random CSS <color>: string is valid CSS <color>", function () {
                var re = new RegExp("^(#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})" +
                    "|rgb\\(\\d+%?,\\d+%?,\\d+%?\\))$");
                for (var lap = 0; lap < LAPS; lap++) {
                    var r = css.color();
                    assert.equal(["aliceblue", "antiquewhite", "aqua", "aquamarine", "azure", "beige", "bisque", "black",
                        "blanchedalmond", "blue", "blueviolet", "brown", "burlywood", "cadetblue", "chartreuse",
                        "chocolate", "coral", "cornflowerblue", "cornsilk", "crimson", "cyan", "darkblue", "darkcyan",
                        "darkgoldenrod", "darkgray", "darkgreen", "darkgrey", "darkkhaki", "darkmagenta",
                        "darkolivegreen", "darkorange", "darkorchid", "darkred", "darksalmon", "darkseagreen",
                        "darkslateblue", "darkslategray", "darkslategrey", "darkturquoise", "darkviolet", "deeppink",
                        "deepskyblue", "dimgray", "dimgrey", "dodgerblue", "firebrick", "floralwhite", "forestgreen",
                        "fuchsia", "gainsboro", "ghostwhite", "gold", "goldenrod", "gray", "green", "greenyellow",
                        "grey", "honeydew", "hotpink", "indianred", "indigo", "ivory", "khaki", "lavender",
                        "lavenderblush", "lawngreen", "lemonchiffon", "lightblue", "lightcoral", "lightcyan",
                        "lightgoldenrodyellow", "lightgray", "lightgreen", "lightgrey", "lightpink", "lightsalmon",
                        "lightseagreen", "lightskyblue", "lightslategray", "lightslategrey", "lightsteelblue",
                        "lightyellow", "lime", "limegreen", "linen", "magenta", "maroon", "mediumaquamarine",
                        "mediumblue", "mediumorchid", "mediumpurple", "mediumseagreen", "mediumslateblue",
                        "mediumspringgreen", "mediumturquoise", "mediumvioletred", "midnightblue", "mintcream",
                        "mistyrose", "moccasin", "navajowhite", "navy", "oldlace", "olive", "olivedrab", "orange",
                        "orangered", "orchid", "palegoldenrod", "palegreen", "paleturquoise", "palevioletred",
                        "papayawhip", "peachpuff", "peru", "pink", "plum", "powderblue", "purple", "red", "rosybrown",
                        "royalblue", "saddlebrown", "salmon", "sandybrown", "seagreen", "seashell", "sienna", "silver",
                        "skyblue", "slateblue", "slategray", "slategrey", "snow", "springgreen", "steelblue", "tan",
                        "teal", "thistle", "tomato", "turquoise", "violet", "wheat", "white", "whitesmoke", "yellow",
                        "yellowgreen"].indexOf(r.s) > -1 || re.test(r.s), true);
                }
            });

            it("should return a random CSS <color>: RGB values are in [0, 255]", function () {
                for (var lap = 0; lap < LAPS; lap++) {
                    var r = css.color();
                    // hex
                    if (r.s.charAt(0) == "#") {
                        var l = r.s.length;
                        for (var d=1; d<l; d++) {
                            assert.equal(parseInt(r.s.charAt(d), 16) >= 0 && parseInt(r.s.charAt(d), 16) < 16, true);
                        }
                    }
                    // rgb
                    if (r.s.slice(0, 3) == "rgb") {
                        var values = r.s.slice(4, -1).split(",");
                        for (var i=0; i<3; i++) {
                            if (values[i].indexOf("%") > -1) {
                                assert.equal(Math.floor(2.55*parseInt(values[i].replace("%", ""))) >= 0
                                    && Math.floor(2.55*parseInt(values[i].replace("%", ""))) < 256, true);
                            } else {
                                assert.equal(parseInt(values[i].replace("%", "")) >= 0
                                    && parseInt(values[i].replace("%", "")) < 256, true);
                            }
                        }
                    }
                }
            });
        });
    });
});
