const worldDATA = JSON.parse(JSON.stringify(WorldData))
const huntLIST = JSON.parse(JSON.stringify(HuntData))

const nowVersion = '1.0.0'
document.querySelector("#input_verNum").textContent = nowVersion

let myName = null,
myId = null,
currZone = null,
currWorld = null,
inZoneTime = null,
addTime03 = null,
addTime261 = null,
currMobId = null,
savedmobId = null,
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
      if(logLine[9] in huntLIST && (addTime03 - inZoneTime) > 200) {
        savedName = logLine[3]
        sendLog03 = rawLine
      }
    break
    case '261':
      addTime261 = new Date()
      if(logLine[2] === 'Add') {
        if (logLine[3] == myId) {
          myDataCombatant(logLine)
        }
        else{
          currMobId = logLine[4]
          bNpcNameId = parseInt(logLine[logLine.indexOf('BNpcNameID') + 1], 16)
          if(!(bNpcNameId == undefined || !bNpcNameId) && (bNpcNameId in huntLIST) && savedmobId !== currMobId && ((addTime261 - inZoneTime) > 200)) {
            savedmobId = currMobId
            sendLog261 = rawLine
          }
        }
      }
    break
  }
  if(sendLog261 !== 0 && sendLog03 !== 0 && savedLog261 !== sendLog261 && savedLog03 !== sendLog03) {
    mobName = logLine[logLine.indexOf('Name') + 1]
    savedLog261 = sendLog261
    savedLog03 = sendLog03
    document.querySelector("#reportLog_List").textContent = '기록 시작'
    SendLogToSheet()
    document.querySelector("#reportLog_List").textContent = `기록 완료: [${currWorld}] ${mobName}`
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

function SendLogToSheet() {
  document.querySelector("#reportLog_List").textContent = '기록중...'
  $.ajax({
    type: "GET",
    url: "https://script.google.com/macros/s/AKfycbz0SWpNJ27M-RMHUihT3BrsxuZSFYbT5U6q54dPOI3l90CITDCqgfBcCt6NEJN1a1sGLA/exec",
    data: {
      "No.":            null,
      "Name":           mobName,
      "ID":             null,
      "D":              null,
      "UserName":       `${myName}(ACT)`,
      "261 Logs":       sendLog261,
      "03 Logs":        sendLog03,
      "Zone/Server":   `${currZone}/${currWorld}`
    }
  })
}