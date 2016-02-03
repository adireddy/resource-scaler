var fs = require("fs");
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
opts.scale = argv.scale ? parseFloat(argv.scale) : 1;

if (argv.help || !opts.input || !opts.output) {
    if (!argv.help) {
        winston.error("invalid options");
    }
    winston.info("Usage: resource-scaler -i resources/480x320 -o resources/240x160 -s 0.5");
    winston.info(optimist.help());
    process.exit(1);
}

scaler(opts, function (err, obj) {
    if (err) {
        winston.error(err);
        process.exit(0);
    }
    winston.info("done");
});