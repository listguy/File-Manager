import {
  IFile,
  IFolder,
  IFilesManager,
  ParsedCommand,
  legalcmd,
  legalcmdEnum,
} from "./interfaces";

export class File implements IFile {
  title: string;
  path: string;
  content: string;
  father: Folder;

  constructor(title: string, path: string, father: Folder) {
    this.title = title;
    this.path = path;
    this.father = father;
    this.content = "";
  }

  writeStream(content: string) {
    this.content = content;
  }

  readStream() {
    return this.content;
  }

  copy() {
    const copy = new File(this.title, this.path, this.father);
    copy.writeStream(this.content);
    return copy;
  }

  cut() {
    this.delete();
    return this;
  }

  updatePath(newPath: String) {
    if (newPath === "/") {
      this.path = this.title;
      return;
    }
    this.path = `${newPath}/${this.title}`;
  }

  delete() {
    this.father!.content[this.title] = undefined;
  }
}

export class Folder implements IFolder {
  title: string;
  path: string;
  content: any; //TODO fix type
  father: Folder | undefined;

  constructor(
    title: string,
    path: string,
    father: Folder | undefined = undefined
  ) {
    this.title = title;
    this.path = path;
    this.father = father;
    this.content = {};
  }

  copy() {
    const copy = new Folder(this.title, this.path, this.father);
    copy.paste(this.content);
    return copy;
  }

  cut() {
    if (!this.father) {
      throw "can't cut root folder";
    }
    this.delete();
    return this;
  }

  updatePath(newPath: string) {
    if (this.father?.path === "/") {
      this.path = this.title;
      return;
    }

    this.path = `${newPath}/${this.title}`;

    Object.keys(this.content).forEach((key: string) => {
      this.content[key].updatePath(newPath);
    });
  }

  paste(elements: (IFile | IFolder)[]) {
    elements.forEach((elem: IFolder | IFile) => {
      elem.updatePath(this.path);
      this.content[elem.title] = elem;
    });
  }

  get(path: string): File | Folder | undefined {
    if (path === "") return this;

    const endOfStep: number = path.indexOf("/");
    const step: string = endOfStep === -1 ? path : path.slice(0, endOfStep);
    const next: File | Folder = this.content[step];

    console.log("next");
    console.log(next);
    console.log(endOfStep);
    console.log("next!!!");
    if (!next) throw "can't resolve path. one of the folders doesn't exist";
    if (endOfStep === -1) return next;
    if (next instanceof File) throw "can't resolve path. can't cd into file";
    return next.get(path.slice(endOfStep + 1));
  }

  delete() {
    this.father!.content[this.title] = undefined;
  }
}

export class FilesManager implements IFilesManager {
  root: Folder;

  constructor() {
    this.root = new Folder("/", "/");
  }

  do(command: string) {
    const parsedCMD = parseCommand(command);
    if (!parsedCMD) return;

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

  print() {
    console.log(this.root.content);
  }

  get(path: string) {
    return this.root.get(path);
  }

  private cp(src: string, dst: string | undefined) {
    if (!dst) {
      console.log("No destination path given");
      return;
    }
    try {
      const source: File | Folder | undefined = this.root.get(src);
      const destination: Folder | undefined | File = this.root.get(dst);

      if (!source || !destination) return;
      if (destination instanceof File) {
        console.log("can't coppy into file.");
        return;
      }

      destination.paste([source.copy()]);
    } catch (err) {
      console.log(err.message);
    }
  }

  private mv(src: string, dst: string | undefined) {
    if (!dst) {
      throw "No destination path given";
    }
    try {
      const source: File | Folder | undefined = this.root.get(src);
      const destination: Folder | undefined | File = this.root.get(dst);

      if (!source || !destination) return;
      if (destination instanceof File) {
        throw "can't move into a file.";
      }

      destination.paste([source.cut()]);
    } catch (err) {
      console.log(err.message);
    }
  }

  private touch(src: string) {
    try {
      const father: Folder | File | undefined = this.root.get(src);
      console.log(father);
      if (!(father instanceof Folder)) {
        throw "can't create new file here";
      }

      const newFile = new File("newfile", `${src}/newfile`, father);
      father.paste([newFile]);
      console.log("new file create successfuly!");
    } catch (err) {
      console.log(err.message);
    }
  }

  private mkdir(src: string) {
    try {
      const father: Folder | File | undefined = this.root.get(src);

      if (!(father instanceof Folder)) {
        throw "can't create new folder here";
      }

      const newFile = new Folder("newfolder", `${src}/newfile`, father);
      father.paste([newFile]);
      console.log("new folder create successfuly!");
    } catch (err) {
      console.log(err.message);
    }
  }

  private rm(src: string) {
    const removedThing: File | Folder | undefined = this.root.get(src);
    removedThing?.delete();
  }
}

function parseCommand(command: string): ParsedCommand | void {
  if (typeof command != "string") {
    throw `expected string but got ${typeof command}`;
  }

  const cmd: string | null = /[a-z]*/.test(command)
    ? //@ts-ignore
      command.match(/[a-z]*/)[0] in legalcmdEnum
      ? //@ts-ignore
        command.match(/[a-z]*/)[0]
      : null
    : null;

  if (!cmd) {
    throw "command ilegal";
  }

  const pathes: string[] | null = command.match(/\s[a-z\/]*/g);
  if (pathes === null) {
    throw "src path is ilegal.";
  }

  const src: string = pathes[0].slice(1);
  const dst: string = pathes[1]?.slice(1);

  return { cmd: (cmd as unknown) as legalcmd, src, dst }; //TODO fix this arab thingy
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
