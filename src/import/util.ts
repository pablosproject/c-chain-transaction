import * as fs from "fs";

// Helper function to count lines in file
export const countLines = (filePath: string): Promise<number> => {
  return new Promise((resolve, reject) => {
    let lineCount = 0;
    fs.createReadStream(filePath)
      .on("data", (buffer) => {
        let idx = -1;
        lineCount--; // Decrease count to handle case when file doesn't end with newline
        do {
          idx = buffer.indexOf("\n", idx + 1);
          lineCount++;
        } while (idx !== -1);
      })
      .on("end", () => {
        resolve(lineCount);
      })
      .on("error", reject);
  });
};
