const fs = require("fs")
const path = require("path")

const getLatestFileName = (fileStartsWith = "", directoryPath) => {
  let fileName = ""
  let latestFile = null
  let latestYear = 0
//   console.log(fileStartsWith)
  fs.readdir("./sportsDataCSV", function (err, files) {
    if (err) {
      console.log("Error getting directory information:", err)
    } else {
      files.forEach(function (file) {
        // console.log(file, "filefilefile")
        if (file.startsWith(fileStartsWith) && file.endsWith(".csv")) {
          const year = parseInt(file.split(".")[1])
          if (year > latestYear) {
            latestYear = year
            latestFile = path.join("./sportsDataCSV", file)
          }
        }
      })

      fileName = latestFile?.split("/")[1]
    }
  })
  return fileName
}

function calculateMedian(data) {
  
}

module.exports = { getLatestFileName }
