"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var interfaces_1 = require("./interfaces");
var prompt_sync_1 = __importDefault(require("prompt-sync"));
var prompt = prompt_sync_1.default();
var File = /** @class */ (function () {
    function File(title, path, father) {
        this.title = title;
        this.path = path;
        this.father = father;
        this.content = "";
    }
    File.prototype.writeStream = function (content) {
        this.content = content;
    };
    File.prototype.readStream = function () {
        return this.content;
    };
    File.prototype.copy = function () {
        var copy = new File(this.title, this.path, this.father);
        copy.writeStream(this.content);
        return copy;
    };
    File.prototype.cut = function () {
        this.delete();
        return this;
    };
    File.prototype.updatePath = function (newPath) {
        if (newPath === "/") {
            this.path = this.title;
            return;
        }
        this.path = newPath + "/" + this.title;
    };
    File.prototype.delete = function () {
        this.father.content[this.title] = undefined;
    };
    File.prototype.goUp = function () {
        return this.father;
    };
    return File;
}());
exports.File = File;
var Folder = /** @class */ (function () {
    function Folder(title, path, father) {
        if (father === void 0) { father = undefined; }
        this.title = title;
        this.path = path;
        this.father = father;
        this.content = {};
    }
    Folder.prototype.copy = function () {
        var copy = new Folder(this.title, this.path, this.father);
        copy.paste(this.content);
        return copy;
    };
    Folder.prototype.cut = function () {
        if (!this.father) {
            throw "can't cut root folder";
        }
        this.delete();
        return this;
    };
    Folder.prototype.printOptions = function () {
        console.log(Object.keys(this.content).join("  "));
    };
    Folder.prototype.updatePath = function (newPath) {
        var _this = this;
        var _a;
        if (((_a = this.father) === null || _a === void 0 ? void 0 : _a.path) === "/") {
            this.path = this.title;
            return;
        }
        this.path = newPath + "/" + this.title;
        Object.keys(this.content).forEach(function (key) {
            _this.content[key].updatePath(newPath);
        });
    };
    Folder.prototype.paste = function (elements) {
        var _this = this;
        elements.forEach(function (elem) {
            elem.updatePath(_this.path);
            _this.content[elem.title] = elem;
        });
    };
    Folder.prototype.get = function (path) {
        if (path === "")
            return this;
        var endOfStep = path.indexOf("/");
        var step = endOfStep === -1 ? path : path.slice(0, endOfStep);
        var next = this.content[step];
        if (!next)
            throw "can't resolve path. one of the folders doesn't exist";
        if (endOfStep === -1)
            return next;
        if (next instanceof File)
            throw "can't resolve path. can't cd into file";
        return next.get(path.slice(endOfStep + 1));
    };
    Folder.prototype.delete = function () {
        this.father.content[this.title] = undefined;
    };
    Folder.prototype.goUp = function () {
        return this.father;
    };
    return Folder;
}());
exports.Folder = Folder;
var FilesManager = /** @class */ (function () {
    function FilesManager() {
        this.root = new Folder("/", "/");
    }
    FilesManager.prototype.do = function (command, prefix) {
        try {
            var parsedCMD = parseCommand(command);
            if (!parsedCMD)
                return;
            switch (parsedCMD.cmd) {
                case "mv":
                    this.mv(parsedCMD.src, parsedCMD.dst);
                    break;
                case "cp":
                    this.cp(parsedCMD.src, parsedCMD.dst);
                    break;
                case "mkdir":
                    this.mkdir(parsedCMD.src);
                    break;
                case "touch":
                    this.touch(parsedCMD.src);
                    break;
                case "rm":
                    this.rm(parsedCMD.src);
                    break;
            }
        }
        catch (err) {
            console.log(err);
        }
    };
    FilesManager.prototype.get = function (path) {
        try {
            return this.root.get(path);
        }
        catch (err) {
            console.log(err);
        }
    };
    FilesManager.prototype.cp = function (src, dst) {
        if (!dst) {
            console.log("No destination path given");
            return;
        }
        try {
            var source = this.root.get(src);
            var destination = this.root.get(dst);
            if (!source || !destination)
                return;
            if (destination instanceof File) {
                console.log("can't coppy into file.");
                return;
            }
            destination.paste([source.copy()]);
        }
        catch (err) {
            console.log(err);
        }
    };
    FilesManager.prototype.mv = function (src, dst) {
        if (!dst) {
            throw "No destination path given";
        }
        try {
            var source = this.root.get(src);
            var destination = this.root.get(dst);
            if (!source || !destination)
                return;
            if (destination instanceof File) {
                throw "can't move into a file.";
            }
            destination.paste([source.cut()]);
        }
        catch (err) {
            console.log(err);
        }
    };
    FilesManager.prototype.touch = function (src) {
        try {
            var father = this.root.get(src);
            // console.log(father);
            if (!(father instanceof Folder)) {
                throw "can't create new file here";
            }
            var fileName = prompt("title: ");
            var newFile = new File(fileName, src + "/" + fileName, father);
            father.paste([newFile]);
            console.log("new file create successfuly!");
        }
        catch (err) {
            console.log(err);
        }
    };
    FilesManager.prototype.mkdir = function (src) {
        try {
            var father = this.root.get(src);
            if (!(father instanceof Folder)) {
                throw "can't create new folder here";
            }
            var folderName = prompt("title: ");
            var newFolder = new Folder(folderName, src + "/" + folderName, father);
            father.paste([newFolder]);
            console.log("new folder create successfuly!");
        }
        catch (err) {
            console.log(err);
        }
    };
    FilesManager.prototype.rm = function (src) {
        var removedThing = this.root.get(src);
        if (removedThing instanceof Folder) {
            var answer = prompt("Deleting " + removedThing.title + " will delete all of it's content\nAre you sure? [y/N]");
            if (answer !== "y")
                return;
        }
        removedThing === null || removedThing === void 0 ? void 0 : removedThing.delete();
    };
    return FilesManager;
}());
exports.FilesManager = FilesManager;
function parseCommand(command, prefix) {
    if (prefix === void 0) { prefix = ""; }
    var _a;
    if (typeof command != "string") {
        throw "expected string but got " + typeof command;
    }
    var cmd = /[a-z]*/.test(command)
        ? //@ts-ignore
            command.match(/[a-z]*/)[0] in interfaces_1.legalcmdEnum
                ? //@ts-ignore
                    command.match(/[a-z]*/)[0]
                : null
        : null;
    if (!cmd) {
        throw "command ilegal";
    }
    var pathes = command.match(/\s[a-z\/]*/g);
    if (pathes === null) {
        throw "src path is ilegal.";
    }
    var src = prefix + pathes[0].slice(1);
    console.log(src);
    var dst = (_a = pathes[1]) === null || _a === void 0 ? void 0 : _a.slice(1);
    return { cmd: cmd, src: src, dst: dst }; //TODO fix this arab thingy
}
// const file = new File("check", "/");
// const copy = file.copy();
// const file2 = file.cut();
// console.log(file);
// console.log(copy);
// console.log(file2);
// file2.writeStream("booboboobobb");
// console.log(file);
// console.log(copy);
// console.log(file2);
// console.log(file === file2);
// console.log(parseCommand("mkdir nitzanos"));
