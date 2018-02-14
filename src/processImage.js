module.exports = function (options) {
    options.logFunction("Processing image using " + options.file);
    if (options.tool === "jimp") processUsingJimp(options);
    else processUsingSharp(options);
}

function processUsingSharp(options) {
    const sharp = require("sharp");
    const sizeOf = require("image-size");
    let dimensions = sizeOf(options.file);
    if (options.normalize) {
        sharp(options.file)
            .resize(Math.round(dimensions.width * options.scale), Math.round(dimensions.height * options.scale), {
                kernel: sharp.kernel[options.algorithm]
            })
            .normalize()
            .toFile(options.file.replace(options.inputFolder, options.outputFolder))
            .then(function () {
                options.callback();
            });
    }
    else {
        sharp(options.file)
            .resize(Math.round(dimensions.width * options.scale), Math.round(dimensions.height * options.scale), {
                kernel: sharp.kernel[options.algorithm]
            })
            .toFile(options.file.replace(options.inputFolder, options.outputFolder))
            .then(function () {
                options.callback();
            });
    }
}

function processUsingJimp(options) {
    const jimp = require("jimp");
    jimp.read(options.file, function (err, im) {
        if (err) throw err;
        if (options.algorithm === "default") {
            if (options.normalize) {
                im.resize(Math.round(im.bitmap.width * options.scale), Math.round(im.bitmap.height * options.scale))
                    .quality(options.quality)
                    .normalize()
                    .write(options.file.replace(options.inputFolder, options.outputFolder), function (err, image) {
                        options.callback();
                    });
            }
            else {
                im.resize(Math.round(im.bitmap.width * options.scale), Math.round(im.bitmap.height * options.scale))
                    .quality(options.quality)
                    .write(options.file.replace(options.inputFolder, options.outputFolder), function (err, image) {
                        options.callback();
                    });
            }
        }
        else {
            if (options.normalize) {
                im.resize(Math.round(im.bitmap.width * options.scale), Math.round(im.bitmap.height * options.scale), options.algorithm)
                    .quality(options.quality)
                    .normalize()
                    .write(options.file.replace(options.inputFolder, options.outputFolder), function (err, image) {
                        options.callback();
                    });
            }
            else {
                im.resize(Math.round(im.bitmap.width * options.scale), Math.round(im.bitmap.height * options.scale), options.algorithm)
                    .quality(options.quality)
                    .write(options.file.replace(options.inputFolder, options.outputFolder), function (err, image) {
                        options.callback();
                    });
            }
        }
    });
}