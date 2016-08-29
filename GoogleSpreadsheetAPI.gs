// TODO API executable
// https://developers.google.com/apps-script/guides/rest/api
// https://developers.google.com/apps-script/guides/rest/quickstart/js

function doGet(request) {
// request object mock (debug)
//  if (request === undefined)
//    request = { parameter : { json: 'type2', zip: 0, debug: 0, nocache: 1, barcode: 'patterns' /*, pretty : 0*/ } }; 
//  Logger.log('Params: ' + JSON.stringify(parseParams(request)/*, null, '\t'*/));

  var scriptTime = new Date();
  
  var ss = SpreadsheetApp.openById("1rAAVwDyRfGfFecmwBEgQw4-4E0bcRotBSchO3CnfHw8");
  var sheet = ss.getSheetByName('Timeline');
  var dataArr = sheet.getRange(3, 1, sheet.getLastRow()-2, sheet.getLastColumn()).getValues();
  var workImageUrls   = sheet.getRange(3, 12, sheet.getLastRow()-2)
                        .getFormulas().map( function(v){ 
                          return v[0].length > 0 ? v[0].match(/image\(['"](.*)['"]\)/i)[1] : ""; 
                        } );
  var letterImageUrls = sheet.getRange(3, 14, sheet.getLastRow()-2)
                        .getFormulas().map( function(v){ 
                          return v[0].length > 0 ? v[0].match(/image\(['"](.*)['"]\)/i)[1] : ""; 
                        } );
  // Logger.log(letterImages);
  
  
  
  var responseArr = [];
  
  for (i in dataArr) {
    //Logger.log(dataArr[i]);
    
    var eventType  = dataArr[i][0],
        title      = dataArr[i][1],
        dateFrom   = parseSheetDate(dataArr[i][2], dataArr[i][3], dataArr[i][4]),
        dateTo     = parseSheetDate(dataArr[i][5], dataArr[i][6], dataArr[i][7]),
        annotation = dataArr[i][8],
        workTechnique  = dataArr[i][9],
        workSize       = dataArr[i][10],
        workImage      = workImageUrls[i],
        letterAddressee= dataArr[i][12],
        letterImage    = letterImageUrls[i],
        letterContent  = dataArr[i][14],
        externalUrl    = dataArr[i][15];
    
    var extraInfo = {};
    if (eventType.match(/work/i)){
      if (workTechnique) extraInfo['technique'] = workTechnique;
      if (workSize)  extraInfo['size']     = workSize;
      if (workImage) extraInfo['imageURL'] = workImage;
    }
    else if (eventType.match(/letter/i)){
      if (letterAddressee) extraInfo['addressee'] = letterAddressee;
      if (letterImage)   extraInfo['imageURL'] = letterImage;
      if (letterContent) extraInfo['content']  = letterContent;
    }
    // dirty test for empty object
    if (JSON.stringify(extraInfo).length === 2) 
      extraInfo = null;
    
    timelineObj = {};
    if (eventType)  timelineObj["evenType"]  = eventType;
    if (title)      timelineObj["title"]     = title;
    if (dateFrom)   timelineObj["dateFrom"]  = dateFrom.string;
    if (dateTo)     timelineObj["dateTo"]    = dateTo.string;
    if (annotation) timelineObj["annotation"]= annotation;
    if (extraInfo)  timelineObj["extraInfo"] = extraInfo;
    if (externalUrl)timelineObj["externalURL"]=externalUrl;
    timelineObj['compareDate'] = dateFrom ? dateFrom.date : null;
    
    responseArr.push(timelineObj);
    
  } // <-- for i in dataArr
  
  // in-place sorting of timeline objects by date
  responseArr.sort(function(a,b){ return a.compareDate > b.compareDate ? 1 : -1; });
  
  var response = JSON.stringify(responseArr, null, '\t');
  //  response = compress(jsonStr);
  // Logger.log('Output size: ' + response.length + '\n' + response);
  
  scriptTime = ( (new Date()).getTime() - scriptTime.getTime() ) / 1000;
  Logger.log('Script running time: ' + scriptTime);
  
  return ContentService.createTextOutput(response).setMimeType(ContentService.MimeType.JSON);
}




function parseSheetDate(yearStr, monthStr, dayStr)
{
  var monthArr = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
  var monthIdx = monthArr.indexOf(monthStr.toLowerCase());
      
  yearStr = yearStr ? String(yearStr).match(/\d{4}/)[0] : '';
  return {
    string: yearStr + (monthStr ? ', '+monthStr + (dayStr ? ' '+dayStr : '') : ''),
    date: new Date(yearStr, monthIdx, dayStr)
  };
}
