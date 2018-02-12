const fs = require("fs");

module.exports = function (file, scale, inputFolder, outputFolder, callback, log, baseScale) {
    let json = JSON.parse(fs.readFileSync(file, "utf8"));
    if (json.multipack) {
        log("Processing multipack json " + file);
        for (let i in json.textures) {
            let textures = json.textures[i];
            if (textures["meta"]) updateSize(textures["meta"], scale);
            for (let frameData in textures["frames"]) {
                let data = textures["frames"][frameData];
                processTextureData(data, scale);
            }
        }
    }
    else if (json["frames"]) {
        log("Processing json " + file);
        if (json["meta"]) updateSize(json["meta"], scale);
        for (let frameData in json["frames"]) {
            let data = json["frames"][frameData];
            processTextureData(data, scale);
        }
    }
    else if (json["bones"] && baseScale) {
        log("Processing spine json " + file);
        json["scalerMetadata"] = {
            spineSkeletonScale: scale,
            baseScale: baseScale
        }
    }
    fs.writeFileSync(file.replace(inputFolder, outputFolder), JSON.stringify(json, null, 2));
    callback();
}

function processTextureData(data, scale) {
    for (let key in data) {
        switch (key) {
            case "frame":
            case "spriteSourceSize":
            case "sourceSize":
                applyDataScale(data[key], scale);
                break;
        }
    }
}

function updateSize(data, scale) {
    data.size.w = data.size.w * scale;
    data.size.h = data.size.h * scale;
}

function applyDataScale(data, scale) {
    for (let key in data) {
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