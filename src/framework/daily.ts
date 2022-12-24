import { getAllDailyNotes, getDailyNote } from "obsidian-daily-notes-interface";
import moment from "moment";
import { TFile } from "obsidian";

export function getDailyFileToday(): TFile {
  let allDaily = getAllDailyNotes();
  // @ts-ignore
  return getDailyNote(moment(), allDaily);
}
