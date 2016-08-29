// timeline params
var tl = {
    dataUrl: 'https://script.google.com/macros/s/AKfycbw2S0RPmxM8oT8uXwY8NmG6WoHEljbx1XXDhUU2v3QYQQqRL7LO/exec',
    
    EVENTS_CANVAS_ID: '#events-canvas',
    WORKS_CANVAS_ID: '#works-canvas',

    margin: { top: 20, right: 20, bottom: 30, left: 40 }
}


d3.json(tl.dataUrl, function(error, data){
    if (error) throw error;
})
