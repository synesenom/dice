var assert = require('assert');
var core = require('../src/dice').core;

var LAPS = 1000;
function add(dist, value) {
    if (!dist.hasOwnProperty(value))
        dist[value] = 1;
    else
        dist[value]++;
}

describe('dice', function() {
    describe('core', function() {
        describe('float(min, max, k)', function() {
            it('should return an array of floats uniformly distributed in (min, max)', function() {
                for (var trial=0; trial<50; trial++) {
                    var freqs = {};
                    var min = Math.random() * 200 - 100;
                    var max = Math.random() * 200 - 100;
                    var k = Math.floor(Math.random()*40 - 20);
                    for (var lap=0; lap<LAPS; lap++) {
                        var r = core.float(min, max, k);
                        if (k < 2)
                            r = [r];
                        r.forEach(function (ri) {
                            add(freqs, Math.floor(ri));
                            // Value is in range
                            assert.equal(true, (min<max ? min : max) <= ri && ri <= (min<max ? max : min));
                        });
                        // Length is correct
                        assert.equal(k < 2 ? 1 : k, r.length);
                    }
                    for (var i in freqs) {
                        // Distribution is uniform
                        assert.equal(true, freqs[i] > 0);
                    }
                }
            });
        });

        describe('float(min, max)', function() {
            it('should return a float uniformly distributed in (min, max)', function() {
                for (var trial=0; trial<50; trial++) {
                    var freqs = {};
                    var min = Math.random() * 200 - 100;
                    var max = Math.random() * 200 - 100;
                    for (var lap=0; lap<LAPS; lap++) {
                        var r = core.float(min, max);
                        add(freqs, Math.floor(r));
                        // Value is in range
                        assert.equal(true, (min<max ? min : max) <= r && r <= (min<max ? max : min));
                    }
                    for (var i in freqs) {
                        // Distribution is uniform
                        assert.equal(true, freqs[i] > 0);
                    }
                }
            });
        });

        describe('float(max)', function() {
            it('should return a float uniformly distributed in (0, max)', function() {
                for (var trial=0; trial<50; trial++) {
                    var freqs = {};
                    var max = Math.random() * 200 - 100;
                    for (var lap=0; lap<LAPS; lap++) {
                        var r = core.float(max);
                        add(freqs, Math.floor(r));
                        // Value is in range
                        assert.equal(true, (0<max ? 0 : max) <= r && r <= (0<max ? max : 0));
                    }
                    for (var i in freqs) {
                        // Distribution is uniform
                        assert.equal(true, freqs[i] > 0);
                    }
                }
            });
        });

        describe('float()', function() {
            it('should return a float uniformly distributed in (0, 1)', function() {
                for (var trial=0; trial<50; trial++) {
                    var freqs = {};
                    for (var lap=0; lap<LAPS; lap++) {
                        var r = core.float();
                        add(freqs, Math.floor(r*100));
                        // Value is in range
                        assert.equal(true, 0 <= r && r <= 1);
                    }
                    for (var i in freqs) {
                        // Distribution is uniform
                        assert.equal(true, freqs[i] > 0);
                    }
                }
            });
        });

        describe('int(min, max, k)', function() {
            it('should return an array of integers uniformly distributed in (min, max)', function() {
                for (var trial=0; trial<50; trial++) {
                    var freqs = {};
                    var min = Math.random() * 200 - 100;
                    var max = Math.random() * 200 - 100;
                    var k = Math.floor(Math.random()*40 - 20);
                    for (var lap=0; lap<LAPS; lap++) {
                        var r = core.float(min, max, k);
                        if (k < 2)
                            r = [r];
                        r.forEach(function (ri) {
                            add(freqs, ri);
                            // Value is in range
                            assert.equal(true, (min<max ? min : max) <= ri && ri <= (min<max ? max : min));
                        });
                        // Length is correct
                        assert.equal(k < 2 ? 1 : k, r.length);
                    }
                    for (var i in freqs) {
                        // Distribution is uniform
                        assert.equal(true, freqs[i] > 0);
                    }
                }
            });
        });

        describe('int(min, max)', function() {
            it('should return an integer uniformly distributed in (min, max)', function() {
                for (var trial=0; trial<50; trial++) {
                    var freqs = {};
                    var min = Math.floor(Math.random() * 200 - 100);
                    var max = Math.floor(Math.random() * 200 - 100);
                    for (var lap=0; lap<LAPS; lap++) {
                        var r = core.int(min, max);
                        add(freqs, r);
                        // Value is in range
                        assert.equal(true, (min<max ? min : max) <= r && r <= (min<max ? max : min));

                        // Value is integer
                        assert.equal(r, parseInt(r, 10));
                    }
                    for (var i in freqs) {
                        // Distribution is uniform
                        assert.equal(true, freqs[i] > 0);
                    }
                }
            });
        });

        describe('int(max)', function() {
            it('should return an integer uniformly distributed in (0, max)', function() {
                for (var trial=0; trial<50; trial++) {
                    var freqs = {};
                    var max = Math.floor(Math.random() * 200 - 100);
                    for (var lap=0; lap<LAPS; lap++) {
                        var r = core.int(max);
                        add(freqs, r);
                        // Value is in range
                        assert.equal(true, (0<max ? 0 : max) <= r && r <= (0<max ? max : 0));
                        assert.equal(r, parseInt(r, 10));
                    }
                    for (var i in freqs) {
                        // Distribution is uniform
                        assert.equal(true, freqs[i] > 0);
                    }
                }
            });
        });

        describe('choice(values, k)', function() {
            it('should return some random elements of an array', function() {
                for (var trial=0; trial<50; trial++) {
                    var values = ['a', 'b', 'c'];
                    var freqs = {};
                    var k = Math.floor(Math.random()*200 - 100);
                    for (var lap=0; lap<LAPS; lap++) {
                        var r = core.choice(values, k);
                        if (k < 2)
                            r = [r];
                        r.forEach(function (ri) {
                            add(freqs, ri);
                            // Value is in array
                            assert.equal(values.indexOf(ri) > -1, true);
                        });
                        // Length is correct
                        assert.equal(k < 2 ? 1 : k, r.length);
                    }
                    for (var i in values) {
                        // Distribution is uniform
                        assert.equal(true, freqs[values[i]] > 0);
                    }
                    for (i in freqs) {
                        assert.equal(values.indexOf(i) > -1, true)
                    }
                }
            });
        });

        describe('choice(values)', function() {
            it('should return a random element of an array', function() {
                for (var trial=0; trial<50; trial++) {
                    var values = ['a', 'b', 'c', 2, 4, 1.234];
                    var freqs = {};
                    for (var lap=0; lap<LAPS; lap++) {
                        var r = core.choice(values);
                        add(freqs, r);
                        // Character is in string
                        assert.equal(true, values.indexOf(r) > -1);
                    }
                    for (var i in values) {
                        // Distribution is uniform
                        assert.equal(true, freqs[values[i]] > 0);
                    }
                }
            });
        });

        describe('char(string, k)', function() {
            it('should return some random characters of a string', function() {
                for (var trial=0; trial<50; trial++) {
                    var string = "abcdefghijkl51313#^!#?><;!-_=+.,/:{}()";
                    var freqs = {};
                    var k = Math.floor(Math.random()*200 - 100);
                    for (var lap=0; lap<LAPS; lap++) {
                        var r = core.char(string, k);
                        if (k < 2)
                            r = [r];
                        r.forEach(function (ri) {
                            add(freqs, ri);
                            // Character is in array
                            assert.equal(true, string.indexOf(ri) > -1);
                        });
                        // Length is correct
                        assert.equal(k < 2 ? 1 : k, r.length);
                    }
                    for (var i in freqs) {
                        // Distribution is uniform
                        assert.equal(true, freqs[i] > 0);
                    }
                }
            });
        });

        describe('shuffle(values)', function() {
            it('should shuffle an array', function() {
                for (var trial=0; trial<50; trial++) {
                    var values = [];
                    var pos = [];
                    for (var i=0; i<100; i++) {
                        values.push(i);
                        pos.push({});
                    }

                    for (var lap=0; lap<LAPS; lap++) {
                        core.shuffle(values);
                        values.forEach(function(v, i) {
                            add(pos[v], i);
                        });
                    }
                    pos.forEach(function(p) {
                        for (i in p)
                            assert.equal(true, p[i] > 0);
                    });
                }
            });
        });
    });
});
