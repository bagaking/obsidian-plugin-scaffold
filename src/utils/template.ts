// fork from https://github.com/reorx/obsidian-paste-image-rename/blob/master/src/template.ts
//
import { IFileInfo } from "strtok3";
import { TFile } from "obsidian";
import {cleanFileName} from "./filename";

const dateTmplRegex = /{{DATE:(.+)}}/gm

export const replaceDateVar = (s: string, date: moment.Moment): string => {
  const m = dateTmplRegex.exec(s)
  if (!m) return s
  return s.replace(m[0], date.format(m[1]))
}

interface TemplateData {
  anchor: string
  file: TFile
}

export const renderTemplate = (tmpl: string, data: TemplateData) => {
  const now = window.moment()
  let text = tmpl
  let newtext
  while ((newtext = replaceDateVar(text, now)) != text) {
    text = newtext
  }

  text = text
    .replace(/{{Anchor}}/gm, cleanFileName(data.anchor))
    .replace(/{{FileName}}/gm, cleanFileName(data.file.basename))
    .replace(/{{DirName}}/gm, cleanFileName(data.file.parent.name))
  return text
}
