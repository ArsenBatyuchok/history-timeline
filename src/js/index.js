function loadJSON(callback) {   

    var xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    xobj.open('GET', 'https://script.google.com/macros/s/AKfycbw2S0RPmxM8oT8uXwY8NmG6WoHEljbx1XXDhUU2v3QYQQqRL7LO/exec', true); // Replace 'my_data' with the path to your file
    xobj.onreadystatechange = function () {
          if (xobj.readyState == 4 && xobj.status == "200") {
            // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
            callback(xobj.responseText);
          }
    };
    xobj.send(null);  
}


loadJSON(function(response) {
    // Parse JSON string into object
    var timelineData = JSON.parse(response);
    for (i in timelineData){
        event = timelineData[i];
        console.log("Event type: %s", event.evenType);
        console.log("Title: %s", event.title);
        console.log("Date: %s", event.dateFrom);
        console.log("Extra info: %s", event.extraInfo ? JSON.stringify(event.extraInfo) : '---');
        console.log("\n");
    }
});
