import JSZip from "jszip";
import { saveAs } from "file-saver";

/**
 * Recursively adds files and folders to the ZIP object.
 * @param {JSZip} zip - The JSZip instance.
 * @param {Array} files - The array of files and folders.
 * @param {String} parentPath - The current path in the ZIP.
 */


const addFilesToZip = (zip:any, files:any, parentPath: string = "") => {
    // @ts-ignore
  files.forEach(file => {
    const filePath = `${parentPath}${file.name}`;
    if (file.type === "file") {
      // Add the file to the ZIP
      zip.file(filePath, file.content || "");
    } else if (file.type === "folder") {
      // Add the folder and recursively add its children
      const folder = zip.folder(filePath);
      if (file.children) {
        addFilesToZip(folder, file.children, `${filePath}/`);
      }
    }
  });
};

/**
 * Downloads the project as a ZIP file.
 * @param {Array} files - The array of files and folders to include in the ZIP.
 */
const downloadProjectAsZip = (files:any) => {
  const zip = new JSZip();

  // Add files and folders to the ZIP
  addFilesToZip(zip, files);

  // Generate the ZIP and trigger download
  zip.generateAsync({ type: "blob" }).then(blob => {
    saveAs(blob, "project.zip");
  }).catch(err => {
    console.error("Error generating ZIP file:", err);
  });
};

export default downloadProjectAsZip;
