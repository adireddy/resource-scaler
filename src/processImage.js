module.exports = function (options) {
    options.logFunction("Processing image using " + options.file);
    if (options.tool === "jimp") processUsingJimp(options);
    else processUsingSharp(options);
}

function processUsingSharp(options) {
    const sharp = require("sharp");
    const sizeOf = require("image-size");
    let dimensions = sizeOf(options.file);

    let process = sharp(options.file);
    process = process.resize(width, height, {
        kernel: sharp.kernel[options.algorithm]
    });
    if (options.normalize) {
        process = process.normalize();
    }
    process.toFile(options.file.replace(options.inputFolder, options.outputFolder)).then(function () {
        options.callback();
    });
}

function processUsingJimp(options) {
    const jimp = require("jimp");
    jimp.read(options.file, function (err, im) {
        if (err) throw err;
        let process;
        if (options.algorithm === "default") {
            process = im.resize(Math.round(im.bitmap.width * options.scale), Math.round(im.bitmap.height * options.scale));
        }
        else {
            process = im.resize(Math.round(im.bitmap.width * options.scale), Math.round(im.bitmap.height * options.scale), options.algorithm);
        }
        process = process.quality(options.quality);
        if (options.normalize) {
            process = process.normalize();
        }
        process = process.write(options.file.replace(options.inputFolder, options.outputFolder), function (err, image) {
            options.callback();
        });
    });
}