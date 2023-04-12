const request = require("request");
const fs = require("fs");
let outputArrayCopy = require("./outputArray copy.json");
const { DownloaderHelper } = require("node-downloader-helper");

async function downAllMp3(array) {
  console.log(array.length);
  for (let i = 0; i < array.length; i++) {
    let dataRaw = {
      body: null, //  Request body, can be any, string, object, etc.
      method: "GET", // Request Method Verb
      headers: {}, // Custom HTTP Header ex: Authorization, User-Agent
      timeout: -1, // Request timeout in milliseconds (-1 use default), is the equivalent of 'httpRequestOptions: { timeout: value }' (also applied to https)
      metadata: {}, // custom metadata for the user retrieve later (default:null)
      resumeOnIncomplete: true, // Resume download if the file is incomplete (set false if using any pipe that modifies the file)
      resumeOnIncompleteMaxRetry: 5, // Max retry when resumeOnIncomplete is true
      resumeIfFileExists: false, // it will resume if a file already exists and is not completed, you might want to set removeOnStop and removeOnFail to false. If you used pipe for compression it will produce corrupted files
      fileName: array[i].title, // Custom filename when saved
      retry: { maxRetries: 2, delay: 100 }, // { maxRetries: number, delay: number in ms } or false to disable (default)
      forceResume: false, // If the server does not return the "accept-ranges" header, can be force if it does support it
      removeOnStop: true, // remove the file when is stopped (default:true)
      removeOnFail: true, // remove the file when fail (default:true)
      progressThrottle: 1000, // interval time of the 'progress.throttled' event will be emitted
      override: true, // Behavior when local file already exists
      httpRequestOptions: {}, // Override the http request options
      httpsRequestOptions: {}, // Override the https request options, ex: to add SSL Certs
    };
    let data = await JSON.stringify(dataRaw);
    let url = array[i].linkMP3;
    const dl = new DownloaderHelper(url, "./mp3TitlesFormat", {
      method: "GET",
      body: data,
      headers: {
        "Content-Type": "application/json",
        "Content-Length": data.length,
      },
    });

    dl.on("end", () => console.log(`Download file number ${i} Completed`));
    dl.on("error", (err) =>
      console.log(`Download file number ${i} Failed`, err),
    );
    dl.start().catch((err) => console.error(err));
  }
  return array;
}

async function saveToJson(array) {
  const outJSON = await JSON.stringify(array);
  await fs.writeFile("output.json", outJSON, function (err) {
    if (err) throw err;
    console.log("Output saved to output.json");
  });
  console.log("Done crawling for the filter");
}

async function main() {
  await downAllMp3(outputArrayCopy).then((result) => saveToJson(result));
  // await saveToJson(outputArrayCopy);
}
main();
