import { Folder } from "./Classes";

export interface IFilesManager {
  root: Folder;
  do(command: string): void;
}

export interface IFolder {
  title: string;
  path: string;
  content: IFolder | IFile;
  copy(): any; //TODO fix type
  cut(): any; //TODO fix type
  paste(elements: (IFolder | IFile)[]): void;
  get(path: string): any; //TODO fix type
  updatePath(newPath: string): void;
}

export interface IFile {
  title: string;
  path: string;
  content: string;
  writeStream(content: string): void;
  readStream(): string;
  copy(): any; //TODO fix type
  cut(): any; //TODO fix type
  updatePath(newPath: string): void;
}

export interface ParsedCommand {
  cmd: legalcmd;
  src: string;
  dst?: string;
}

export type legalcmd = "mv" | "cp" | "touch" | "mkdir" | "rm";

export enum legalcmdEnum {
  "mv",
  "cp",
  "touch",
  "mkdir",
  "rm",
}
