const fs = require("fs");
const processImage = require("./processImage");
const processJson = require("./processJson");
const processAtlas = require("./processAtlas");
const winston = require("winston");

module.exports = function () {

    const IMAGE_EXTENSIONS = [
        /(.jpg)$/i,
        /(.jpeg)$/i,
        /(.png)$/i,
        /(.bmp)$/i
    ];

    const DATA_EXTENSIONS = [
        /(.json)$/i,
        /(.atlas)$/i
    ];

    const JIMP_ALGORITHMS = [
        "bilinearInterpolation",
        "nearestNeighbor",
        "bicubicInterpolation",
        "hermiteInterpolation",
        "bezierInterpolation"
    ];

    const SHARP_ALGORITHMS = [
        "nearest",
        "cubic",
        "lanczos2",
        "lanczos3"
    ];

    let opts = arguments[0];
    let inputFolder = opts.input;
    let outputFolder = opts.output;
    let scale = opts.scale;
    let quality = opts.quality;
    let normalize = opts.normalize;
    let algorithm = opts.tool === "jimp" ? JIMP_ALGORITHMS[opts.jimp_algorithm - 1] : SHARP_ALGORITHMS[opts.sharp_algorithm - 1];
    let files = [];
    let imageFiles = [];
    let dataFiles = [];
    let count = 0;

    if (!opts.meta) opts.meta = {};

    try {
        files = fs.readdirSync(inputFolder);
    }
    catch (e) {
        winston.error("input folder '" + inputFolder + "' not found");
    }

    if (files) {
        if (!fs.existsSync(outputFolder)) fs.mkdirSync(outputFolder);
        addFiles(inputFolder);

        winston.info("Using " + opts.tool.toUpperCase() +" with '" + algorithm.replace("Interpolation", "") + "' resizing algorithm.");
        winston.info((imageFiles.length + dataFiles.length) + " files to process...");

        try {
            processImageFiles();
            processDataFiles();
        }
        catch (e) {
            if (opts.meta.error && typeof opts.meta.error === "function") opts.meta.error();
            winston.error(e);
        }
    }

    function addFiles(folder) {
        let folderFiles = fs.readdirSync(folder);
        folderFiles.forEach((item) => {
            let path = folder + "/" + item;
            let stats = fs.statSync(path);
            if (stats.isDirectory()) {
                let newFolder = path.replace(inputFolder, outputFolder);
                if (!fs.existsSync(newFolder)) fs.mkdirSync(newFolder);
                addFiles(path);
            }
            else {
                IMAGE_EXTENSIONS.forEach((ext) => {
                    if (ext.test(item)) imageFiles.push(path);
                });
                DATA_EXTENSIONS.forEach((ext) => {
                    if (ext.test(item)) dataFiles.push(path);
                });
            }
        });
    }

    function processImageFiles() {
        imageFiles.forEach((file) => {
            processImage({
                tool: opts.tool,
                file: file,
                algorithm: algorithm,
                scale: scale,
                quality: quality,
                normalize: normalize,
                inputFolder: inputFolder,
                outputFolder: outputFolder,
                callback: checkCount,
                logFunction: log
            });
        });
    }

    function processDataFiles() {
        dataFiles.forEach((file) => {
            if (/(.json)$/i.test(file)) {
                processJson(file, scale, inputFolder, outputFolder, checkCount, log, opts.meta.baseScale);
            }
            else if (/(.atlas)$/i.test(file)) {
                processAtlas(file, scale, inputFolder, outputFolder, checkCount, log);
            }
        });
    }

    function checkCount() {
        count++;
        if (opts.meta.progress && typeof opts.meta.progress === "function") {
            let total = imageFiles.length + dataFiles.length;
            let percentage = Math.round((count / total) * 100);
            opts.meta.progress(percentage);
            log(percentage + "% complete");
        }
        if (imageFiles.length + dataFiles.length === count) {
            winston.info("Done.");
            if (opts.meta.complete && typeof opts.meta.complete === "function") opts.meta.complete();
        }
    }

    function log(msg) {
        if (opts.verbose) winston.info(msg);
    }
}