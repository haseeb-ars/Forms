// src/saveAsCompat.js
import FileSaver from "file-saver";

// Some environments export default, others have named export `saveAs`
export default function saveAsCompat(blob, filename) {
  if (FileSaver && typeof FileSaver.saveAs === "function") {
    FileSaver.saveAs(blob, filename);
  } else if (typeof FileSaver === "function") {
    FileSaver(blob, filename);
  } else {
    console.error("No saveAs function found in file-saver");
  }
}
