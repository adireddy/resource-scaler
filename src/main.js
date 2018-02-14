#!/usr/bin/env node

const _ = require("underscore")._;
const winston = require("winston");
const scaler = require("./scaler");

let optimist = require("optimist")
    .options("tool", {
        alias: "t",
        default: "sharp",
        describe: "jimp or sharp"
    })
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
        default: 100,
        describe: "quality (0-100, PNG and JPEG only)"
    })
    .options("jimp_algorithm", {
        alias: "ja",
        describe: "1-bilinear, 2-nearest, 3-bicubic, 4-hermite, 5-bezier"
    })
    .options("sharp_algorithm", {
        alias: "sa",
        describe: "1-nearest, 2-cubic, 3-lanczos2, 4-lanczos3"
    })
    .options("normalize", {
        alias: "n",
        describe: "normalize the channels in the image"
    })
    .options("verbose", {
        alias: "v",
        describe: "verbose"
    })
    .options("help", {
        alias: "h",
        describe: "help"
    });

let argv = optimist.argv;
let opts = _.extend({}, argv);

winston.remove(winston.transports.Console);
winston.add(winston.transports.Console, {
    colorize: true,
    level: argv.log,
    handleExceptions: false
});
winston.debug("parsed arguments", argv);

opts.logger = winston;
opts.tool = argv.tool && (argv.tool === "jimp" || argv.tool === "sharp") ? argv.tool : "sharp";
opts.scale = argv.scale && Number(argv.scale) > 0 ? Number(argv.scale) : 1;
opts.quality = argv.quality && Number(argv.quality) >= 0 && Number(argv.quality) <= 100 ? Number(argv.quality) : 100;
opts.jimp_algorithm = argv.jimp_algorithm && Number(argv.jimp_algorithm) >= 1 && Number(argv.jimp_algorithm) <= 5 ? Number(argv.jimp_algorithm) : 1;
opts.sharp_algorithm = argv.sharp_algorithm && Number(argv.sharp_algorithm) >= 1 && Number(argv.sharp_algorithm) <= 4 ? Number(argv.sharp_algorithm) : 4;

if (argv.help || !opts.input || !opts.output) {
    if (!argv.help) winston.error("invalid options");
    winston.info("Usage: resource-scaler -i resources/480x320 -o resources/240x160 -s 0.5");
    winston.info(optimist.help());
    process.exit(0);
}

if (opts.scale === 1) winston.info("using scale 1");

scaler(opts);