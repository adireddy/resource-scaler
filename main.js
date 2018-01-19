#!/usr/bin/env node

var _ = require("underscore")._;
var winston = require("winston");

var scaler = require("./scaler");

var optimist = require("optimist")
    .options("input", {
        alias: "i"
        , describe: "input folder"
    })
    .options("output", {
        alias: "o"
        , describe: "output folder"
    })
    .options("scale", {
        alias: "s"
        , "default": 1
        , describe: "scale factor"
    })
    .options("quality", {
        alias: "q"
        , "default": 100
        , describe: "quality (0-100, PNG and JPEG only)"
    })
    .options("algorithm", {
        alias: "a"
        , "default": 0
        , describe: "0-bilinear, 1-nearestNeighbor, 2-bilinearInterpolation, 3-bicubicInterpolation, 4-hermiteInterpolation, 5-bezierInterpolation"
    })
    .options("verbose", {
        alias: "v"
        , describe: "verbose"
    })
    .options("help", {
        alias: "h"
        , describe: "help"
    });

var argv = optimist.argv;
var opts = _.extend({}, argv);

winston.remove(winston.transports.Console);
winston.add(winston.transports.Console, {
    colorize: true
    , level: argv.log
    , handleExceptions: false
});
winston.debug("parsed arguments", argv);

opts.logger = winston;
opts.scale = argv.scale && Number(argv.scale) > 0 ? Number(argv.scale) : 1;
opts.quality = argv.quality && Number(argv.quality) >= 0 && Number(argv.quality) <= 100 ? Number(argv.quality) : 100;
opts.algorithm = argv.algorithm && Number(argv.algorithm) >= 0 && Number(argv.algorithm) <= 5 ? Number(argv.algorithm) : 0;

if (argv.help || !opts.input || !opts.output) {
    if (!argv.help) winston.error("invalid options");
    winston.info("Usage: resource-scaler -i resources/480x320 -o resources/240x160 -s 0.5");
    winston.info(optimist.help());
    process.exit(1);
}

if (opts.scale === 1) winston.info("using scale 1");

scaler(opts);