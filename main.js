#!/usr/bin/env node

var _ = require("underscore")._;
var winston = require("winston");

var scaler = require("./scaler");

var optimist = require("optimist")
    .options("input", {
        alias: "i",
        describe: "input folder"
    })
    .options("output", {
        alias: "o",
        describe: "output folder"
    })
    .options("scale", {
        alias: "s",
        "default": 1,
        describe: "scale factor"
    })
    .options("quality", {
        alias: "q",
        "default": 100,
        describe: "quality (0-100, PNG and JPEG only)"
    })
    .options("algorithm", {
        alias: "a",
        describe: "1-bilinear, 2-nearestNeighbor, 3-bicubic, 4-hermite, 5-bezier"
    })
    .options("verbose", {
        alias: "v",
        describe: "verbose"
    })
    .options("help", {
        alias: "h",
        describe: "help"
    });

var argv = optimist.argv;
var opts = _.extend({}, argv);

winston.remove(winston.transports.Console);
winston.add(winston.transports.Console, {
    colorize: true,
    level: argv.log,
    handleExceptions: false
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