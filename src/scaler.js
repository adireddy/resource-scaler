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

    const ALGORITHMS = [
        "default",
        "bilinearInterpolation",
        "nearestNeighbor",
        "bicubicInterpolation",
        "hermiteInterpolation",
        "bezierInterpolation"
    ];

    let opts = arguments[0];
    let inputFolder = opts.input;
    let outputFolder = opts.output;
    let scale = opts.scale;
    let quality = opts.quality;
    let normalize = opts.normalize;
    let algorithm = ALGORITHMS[opts.algorithm];
    let files = [];
    let imageFiles = [];
    let dataFiles = [];
    let count = 0;

    try {
        files = fs.readdirSync(inputFolder);
    }
    catch (e) {
        winston.error("input folder '" + inputFolder + "' not found");
    }

    if (files) {
        if (!fs.existsSync(outputFolder)) fs.mkdirSync(outputFolder);
        addFiles(inputFolder);

        winston.info("Using '" + algorithm.replace("Interpolation", "") + "' resizing algorithm.");
        winston.info((imageFiles.length + dataFiles.length) + " files to process...");

        try {
            processImageFiles();
            processDataFiles();
        }
        catch (e) {
            if (opts.error && typeof opts.error === "function") opts.error();
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
            processImage(file, algorithm, scale, quality, normalize, inputFolder, outputFolder, checkCount, log);
        });
    }

    function processDataFiles() {
        dataFiles.forEach((file) => {
            if (/(.json)$/i.test(file)) {
                processJson(file, scale, inputFolder, outputFolder, checkCount, log);
            }
            else if (/(.atlas)$/i.test(file)) {
                processAtlas(file, scale, inputFolder, outputFolder, checkCount, log);
            }
        });
    }

    function checkCount() {
        count++;
        if (opts.progress && typeof opts.progress === "function") {
            let total = imageFiles.length + dataFiles.length;
            let percentage = Math.round((count / total) * 100);
            opts.progress(percentage);
            log(percentage + "% complete");
        }
        if (imageFiles.length + dataFiles.length === count) {
            winston.info("Done.");
            if (opts.complete && typeof opts.complete === "function") opts.complete();
        }
    }

    function log(msg) {
        if (opts.verbose) winston.info(msg);
    }
}