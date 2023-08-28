const overlayVersion = "1.0.6",
worldDATA = JSON.parse(JSON.stringify(WorldData)),
huntLIST = JSON.parse(JSON.stringify(HuntData))

document.querySelector("#input_verNum").textContent = overlayVersion


let myName = null,
myId = null,
currZone = null,
currWorld = null,
inZoneTime = null,
addTime03 = null,
addTime261 = null,
currMobId03 = null,
savedMobId03 = null,
currMobId261 = null,
savedMobId261 = null,
sendLog261 = null,
sendLog03 = null,
savedLog261 = null,
savedLog03 = null

function catchLogs(data) {
  const logLine = data.line
  const rawLine = data.rawLine

  switch(logLine[0]) {
    case '01':
      inZoneTime = new Date()
      currZone = logLine[3]
      document.querySelector("#input_currZone").textContent = currZone
    break
    case '02':
      myId = logLine[2]
      myName = logLine[3]
      document.querySelector("#input_myName").textContent = myName
    break
    case '03':
      addTime03 = new Date()
      currMobId03 = logLine[2]
      if(logLine[9] in huntLIST && addTime03 - inZoneTime > 200 && currMobId03 !== savedMobId03 && inZoneTime !== null) {
        console.warn(`03: ${addTime03}, ${inZoneTime}, ${addTime03 - inZoneTime}`)
        console.warn(rawLine)
        savedMobId03 = currMobId03
        savedName03 = logLine[3]
        sendLog03 = rawLine
      }
    break
    case '261':
      if(logLine[2] === 'Add') {
        if (logLine[3] == myId) {
          myDataCombatant(logLine)
        }
        else{
          addTime261 = new Date()
          currMobId261 = logLine[3]
          bNpcNameId = parseInt(logLine[logLine.indexOf('BNpcNameID') + 1], 16)
          if(bNpcNameId in huntLIST && currMobId261 !== savedMobId261 && inZoneTime261 !== null) {
            savedMobId261 = currMobId261
            sendLog261 = rawLine
          }
        }
      }
    break
  }
  if(savedLog261 !== sendLog261 && savedLog03 !== sendLog03 && savedMobId03 == savedMobId261) {
    reportTime = dateFormat(new Date())
    savedName261 = logLine[logLine.indexOf('Name') + 1]
    savedLog261 = sendLog261
    savedLog03 = sendLog03
    SendLogToSheet()
    document.querySelector("#reportlog_time").textContent = `[${reportTime}]`
    document.querySelector("#reportLog_status").textContent = `기록 완료: [${currWorld}]${savedName03}(${savedMobId261})`
    console.log(`기록 완료: [${currWorld}] ${savedName03}`)
  }
}

function myDataCombatant(log) {
  let currWorldID = log[log.indexOf('CurrentWorldID') + 1]
  let worldName = worldDATA[currWorldID]["UserType"]
  currWorld = !(worldName == 0 || worldName == undefined || !worldName) ? worldDATA[currWorldID]["UserType"] : ''
  document.querySelector("#input_currWorld").textContent = currWorld
}

addOverlayListener('LogLine', catchLogs)
startOverlayEvents()

function dateFormat(date) {
  let hour = date.getHours();
  let minute = date.getMinutes();

  hour = hour >= 10 ? hour : '0' + hour;
  minute = minute >= 10 ? minute : '0' + minute;

  return hour + ':' + minute
}

function SendLogToSheet() {
  $.ajax({
    type: "GET",
    url: "https://script.google.com/macros/s/AKfycbz0SWpNJ27M-RMHUihT3BrsxuZSFYbT5U6q54dPOI3l90CITDCqgfBcCt6NEJN1a1sGLA/exec",
    data: {
      "No.":            null,
      "Name":           savedName03,
      "ID":             null,
      "D":              null,
      "UserName":       `${myName} (ACT)`,
      "261 Logs":       sendLog261,
      "03 Logs":        sendLog03,
      "Zone/Server":   `${currZone}/${currWorld}`
    }
  })
}
