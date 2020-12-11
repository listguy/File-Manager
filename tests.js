"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Classes_1 = require("./Classes");
var fm = new Classes_1.FilesManager();
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
fm.do("mkdir ");
fm.do("touch newfolder");
fm.print();
var file = fm.get("newfolder/newfile");
console.log(file.readStream());
file.writeStream("Hello check writestream");
console.log(file.readStream());
//@ts-ignore
// console.log(fm.root.content.newfolder.content.newfile);
