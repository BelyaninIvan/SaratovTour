var GHUtil = require('./GHUtil.js');
var GHInput = require('./GHInput.js');
var GraphHopperRouting = require('./GraphHopperRouting.js');

var GraphHopper = {
    "Util": GHUtil,
    "Input": GHInput,
    "Routing": GraphHopperRouting
};


// define GraphHopper for Node module pattern loaders, including Browserify
if (typeof module === 'object' && typeof module.exports === 'object') {
    module.exports.GraphHopper = GraphHopper;

// define GraphHopper as an AMD module
} else if (typeof define === 'function' && define.amd) {
    define(GraphHopper);
}

if (typeof window !== 'undefined') {
    window.GraphHopper = GraphHopper;
}