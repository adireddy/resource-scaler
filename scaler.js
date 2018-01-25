var fs = require("fs");
var Jimp = require("jimp");
var iterator = require("object-recursive-iterator");
var winston = require("winston");
var lineByLine = require("n-readlines");

module.exports = function () {

    var IMAGE_EXTENSIONS = [
        /(.jpg)$/i,
        /(.jpeg)$/i,
        /(.png)$/i,
        /(.bmp)$/i
    ];

    var DATA_EXTENSIONS = [
        /(.json)$/i,
        /(.atlas)$/i
    ];

    var ALGORITHMS = [
        "default",
        "bilinearInterpolation",
        "nearestNeighbor",
        "bicubicInterpolation",
        "hermiteInterpolation",
        "bezierInterpolation"
    ];

    var opts = arguments[0];
    var inputFolder = opts.input;
    var outputFolder = opts.output;
    var scale = opts.scale;
    var quality = opts.quality;
    var algorithm = ALGORITHMS[opts.algorithm];
    var files = [];
    var imageFiles = [];
    var dataFiles = [];
    var count = 0;

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
        var folderFiles = fs.readdirSync(folder);
        folderFiles.forEach(function (item) {
            var path = folder + "/" + item;
            var stats = fs.statSync(path);
            if (stats.isDirectory()) {
                var newFolder = path.replace(inputFolder, outputFolder);
                if (!fs.existsSync(newFolder)) fs.mkdirSync(newFolder);
                addFiles(path);
            }
            else {
                IMAGE_EXTENSIONS.forEach(function (ext) {
                    if (ext.test(item)) imageFiles.push(path);
                });
                DATA_EXTENSIONS.forEach(function (ext) {
                    if (ext.test(item)) dataFiles.push(path);
                });
            }
        });
    }

    function processImageFiles() {
        imageFiles.forEach(function (file) {
            Jimp.read(file, function (err, im) {
                log("Processing " + file);
                if (err) throw err;
                if (algorithm === ALGORITHMS[0]) {
                    if (opts.normalize) {
                        im.resize(Math.round(im.bitmap.width * scale), Math.round(im.bitmap.height * scale))
                            .quality(quality)
                            .normalize()
                            .write(file.replace(inputFolder, outputFolder), function (err, image) {
                                checkCount();
                            });
                    }
                    else {
                        im.resize(Math.round(im.bitmap.width * scale), Math.round(im.bitmap.height * scale))
                            .quality(quality)
                            .write(file.replace(inputFolder, outputFolder), function (err, image) {
                                checkCount();
                            });
                    }
                }
                else {
                    if (opts.normalize) {
                        im.resize(Math.round(im.bitmap.width * scale), Math.round(im.bitmap.height * scale), algorithm)
                            .quality(quality)
                            .normalize()
                            .write(file.replace(inputFolder, outputFolder), function (err, image) {
                                checkCount();
                            });
                    }
                    else {
                        im.resize(Math.round(im.bitmap.width * scale), Math.round(im.bitmap.height * scale), algorithm)
                            .quality(quality)
                            .write(file.replace(inputFolder, outputFolder), function (err, image) {
                                checkCount();
                            });
                    }
                }
            });
        });
    }

    function processDataFiles() {
        dataFiles.forEach(function (file) {
            if (/(.json)$/i.test(file)) {
                var json = JSON.parse(fs.readFileSync(file, "utf8"));
                if (json.multipack) {
                    log("Processing multipack texture json " + file);
                    for (var i in json.textures) {
                        var textures = json.textures[i];
                        if (textures["meta"]) updateSize(textures["meta"]);
                        for (var frameData in textures["frames"]) {
                            var data = textures["frames"][frameData];
                            processTextureData(data);
                        }
                    }
                }
                else if (json["frames"]) {
                    log("Processing texture json " + file);
                    if (json["meta"]) updateSize(json["meta"]);
                    for (var frameData in json["frames"]) {
                        var data = json["frames"][frameData];
                        processTextureData(data);
                    }
                }
                else if (json["bones"]) {
                    log("Processing spine json " + file);
                    iterator.forAll(json, function (path, key, obj) {
                        if (path[path.length - 2] !== "scale" && path[path.length - 2] !== "rotate") {
                            switch (key) {
                                case "x":
                                case "y":
                                case "width":
                                case "height":
                                case "length":
                                    obj[key] = obj[key] * scale;
                                    break;
                            }
                        }
                    });
                }
                fs.writeFileSync(file.replace(inputFolder, outputFolder), JSON.stringify(json, null, 2));
            }
            else if (/(.atlas)$/i.test(file)) {
                log("Processing spine atlas " + file);

                var modifiedData = "";
                var liner = new lineByLine(file);
                var line;
                while (line = liner.next()) {
                    line = line.toString();
                    if (/.*xy:.*/g.test(line) || /.*orig:.*/g.test(line) || /.*size:.*/g.test(line)) {
                        var modified = line.replace(/ /g, "");
                        var dataVal = modified.split(":");

                        switch (dataVal[0]) {
                            case "xy":
                            case "orig":
                            case "size":
                                var valueData = dataVal[1].split(",");
                                valueData[0] = valueData[0] * scale;
                                valueData[1] = valueData[1] * scale;
                                dataVal[1] = valueData.join(",");
                                break;
                        }
                        if (dataVal[1]) modifiedData += "  " + dataVal.join(":") + "\n";
                        else modifiedData += line + "\n";
                    }
                    else {
                        modifiedData += line.toString() + "\n";
                    }
                }

                fs.writeFileSync(file.replace(inputFolder, outputFolder), modifiedData);
            }
            checkCount();
        });
    }

    function updateSize(data) {
        data.size.w = data.size.w * scale;
        data.size.h = data.size.h * scale;
    }

    function processTextureData(data) {
        for (var key in data) {
            switch (key) {
                case "frame":
                case "spriteSourceSize":
                case "sourceSize":
                    applyDataScale(data[key]);
                    break;
            }
        }
    }

    function applyDataScale(data) {
        for (var key in data) {
            switch (key) {
                case "x":
                case "y":
                case "w":
                case "h":
                    data[key] = data[key] * scale;
                    break;
            }
        }
    }

    function checkCount() {
        count++;
        if (imageFiles.length + dataFiles.length === count) {
            winston.info("Done.");
            if (opts.complete && typeof opts.complete === "function") opts.complete();
        }
    }

    function log(msg) {
        if (opts.verbose) winston.info(msg);
    }
}