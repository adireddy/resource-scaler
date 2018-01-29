const Jimp = require("jimp");

module.exports = function (file, algorithm, scale, quality, normalize, inputFolder, outputFolder, callback, log) {
    log("Processing image " + file);
    Jimp.read(file, function (err, im) {
        if (err) throw err;
        if (algorithm === "default") {
            if (normalize) {
                im.resize(Math.round(im.bitmap.width * scale), Math.round(im.bitmap.height * scale))
                    .quality(quality)
                    .normalize()
                    .write(file.replace(inputFolder, outputFolder), function (err, image) {
                        callback();
                    });
            }
            else {
                im.resize(Math.round(im.bitmap.width * scale), Math.round(im.bitmap.height * scale))
                    .quality(quality)
                    .write(file.replace(inputFolder, outputFolder), function (err, image) {
                        callback();
                    });
            }
        }
        else {
            if (normalize) {
                im.resize(Math.round(im.bitmap.width * scale), Math.round(im.bitmap.height * scale), algorithm)
                    .quality(quality)
                    .normalize()
                    .write(file.replace(inputFolder, outputFolder), function (err, image) {
                        callback();
                    });
            }
            else {
                im.resize(Math.round(im.bitmap.width * scale), Math.round(im.bitmap.height * scale), algorithm)
                    .quality(quality)
                    .write(file.replace(inputFolder, outputFolder), function (err, image) {
                        callback();
                    });
            }
        }
    });
}