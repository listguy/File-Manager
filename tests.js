"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var Classes_1 = require("./Classes");
var prompt_sync_1 = __importDefault(require("prompt-sync"));
var fm = new Classes_1.FilesManager();
var prompt = prompt_sync_1.default();
// fm.print();
// //should create a new file
// fm.do("touch ");
// fm.print();
// console.log("*********************************");
// //should create new folder
// fm.do("mkdir ");
// fm.print();
// console.log("*********************************");
// //should create new file and a new folder in the new folder
// fm.do("mkdir newfolder");
// // fm.do("touch newfolder");
// fm.do("cp newfile newfolder");
// fm.print();
// fm.do("rm newfile");
// fm.print();
// fm.do("mkdir ");
// fm.do("touch newfolder");
// fm.print();
// const file: File = (fm.get("newfolder/newfile") as unknown) as File;
// console.log(file.readStream());
// file.writeStream("Hello check writestream");
// console.log(file.readStream());
//@ts-ignore
// console.log(fm.root.content.newfolder.content.newfile);
var exit = false;
var currentFolder = fm.root;
// fm.do("touch ");
// fm.do("mkdir ");
// fm.do("touch folder");
console.log("Welcome to file manager.");
console.log("you can enter the following commands:\ncd- enter a path to go down into.\ncd..- go up one step\nls- show folder's content.\ncp, mv, touch, mkdir & rm like bash");
while (!exit) {
    var prefix = currentFolder.path;
    var input = prompt(prefix + " $");
    switch (input) {
        case "x":
            exit = true;
            continue;
        case "ls":
            if (currentFolder instanceof Classes_1.Folder) {
                currentFolder.printOptions();
            }
            else {
                console.log("can't ls file content");
            }
            break;
        case "cd":
            if (currentFolder instanceof Classes_1.File) {
                console.log("can't cd into file");
                break;
            }
            var path = prompt("");
            var newFolder = currentFolder.get(path);
            if (!newFolder)
                break;
            currentFolder = newFolder;
            prefix = newFolder.path;
            break;
        case "cd..":
            if (currentFolder.title === "/") {
                console.log("can't go above root folder");
                break;
            }
            currentFolder = currentFolder.goUp();
            prefix = currentFolder.path;
        default:
            if (prefix === "/") {
                fm.do(input);
                break;
            }
            console.log(prefix);
            fm.do(input, prefix + "/");
    }
}
