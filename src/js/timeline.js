var timelineApp = (function(){
    var public = {};

    var EVENTS_CANVAS_ID = '#events-canvas',
        WORKS_CANVAS_ID  = '#works-canvas';

    var margin = {top: 20, right: 20, bottom: 30, left: 40};


   // INITIALIZATION

    var initStarted = false,
        dataLoadStarted = false;

    public.tlData = null;

    public.initTimelines = function(){
        initStarted = true;
        if (public.tlData)
            init();
        else // wait for dataLoadedCallback
            if (dataLoadStarted)
                console.log('Waiting for data to finish loading...');
            else
                console.warn('Timeline data expected to be loaded first.');
    };

    public.loadTimelineData = function(jsonDataUrl) {
        dataLoadStarted = true;
        var xObj = new XMLHttpRequest();
        xObj.overrideMimeType("application/json");
        xObj.open('GET', jsonDataUrl, true);
        xObj.onreadystatechange = function () {
              if (xObj.readyState == 4 && xObj.status == '200') {
                dataLoadedCallback(xObj.responseText);
              }
              if (xObj.readyState == 4 && xObj.status != '200') {
                 console.error("Error loading data: %s", xObj.status);
              }
        };
        xObj.send(null);  
    }

    // callback invoked by AJAX to load timeline data
    var dataLoadedCallback = function(jsonDataRaw) {
        tdata = JSON.parse(jsonDataRaw);
        // for (i in tlData){
        //     event = tlData[i];
        //     console.log("Event type: %s", event.evenType);
        //     console.log("Title: %s", event.title);
        //     console.log("Date: %s", event.dateFrom);
        //     console.log("Extra info: %s", event.extraInfo ? JSON.stringify(event.extraInfo) : '---');
        //     console.log("\n");
        // }
        if (initStarted){
            console.log('data loading finished.');
            init();
        }
    }

    var init = function(){
        eventsTimeline();
        worksTimeline();
    };

    var eventsTimeline = function(){

    };

    var worksTimeline = function(){
        console.log('no works, Durer is on vacation');
    };


    return public;

})();
