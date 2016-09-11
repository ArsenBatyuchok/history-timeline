// if node.js (dev env)
if (typeof window === 'undefined') {
  var d3 = require('d3');
  var fs = require('fs');
} else
var startTime = performance.now();

(function() {
  var timelineDataUrl =
    "https://script.google.com/macros/s/AKfycbw2S0RPmxM8oT8uXwY8NmG6WoHEljbx1XXDhUU2v3QYQQqRL7LO/exec";

  var d3main = function(error, data) {
    if (error) throw error;
    console.log('Data loading finished');
    // console.log('The first date: %s', data[0].dateFrom);

    ////////////////////////    INITIALIZATION    //////////////////////////////
    data = data.map(function(d) {
      // d.yearFrom = +d.dateFrom.match(/^\d{4}/)[0];
      var splt = d.dateFrom.split(', ');
      d.yearFrom = splt[0];
      d.monthFrom = splt.length > 1 ? splt[1] : null;
      return d;
    });

    // unique years with an any event (no duplicates)
    var eventYears = data.map(function(obj) { 
      return obj.yearFrom;
    }).filter(function(year, idx, allYears) {
      return allYears.indexOf(year) === idx;  // unique values only
    });

    // group event by years (when several events happen within one year)
    var gData = eventYears.map(function(y){ 
      return data.filter(function(d){ return d.yearFrom === y; });
    });

    //// QUANTITIES ////
    // flag whether to display years with events only or complete range of years (every year from birth to death year)
    var eventYearsOnlyFlag = true, 
      minYear = d3.min(eventYears),
      maxYear = d3.max(eventYears),
      yearsRange = eventYearsOnlyFlag ? eventYears : d3.range(minYear, maxYear+1);

    //// SIZES, px ////
    // month ticks within a year
    var yearWidth = 550, // the main parameter defining canvas properties
      yearScale = d3.scaleLinear().domain([0,12]).range([0, yearWidth]),
      monthTicks = d3.range(1,12+1).map(function(v){return Math.round(yearScale(v));});

    // year ticks within whole timeline
    var tlWidth = yearWidth * (yearsRange.length-1),
      tlHeight = 250,
      tlScale = d3.scaleBand().domain(yearsRange).range([0,tlWidth+yearWidth]).round(1),
      yearTicks = yearsRange.map(function(v){ return tlScale(v); }),
      yearTickHeight = 38,
      monthTickHeight = 10;


    if (typeof window === 'undefined') {
      console.log("Year width %spx ÷ %s = [%s]px", yearWidth, monthTicks.length, monthTicks);
      console.log("Years %s = [%s]", yearsRange.length, yearsRange);
      console.log("Canvas width %spx * (%s-1) = %spx ÷ %s = [%s]px", yearWidth, yearsRange.length, tlWidth, yearTicks.length, yearTicks);
      return ;
    }

    var eventsContainer = d3.select('#durer-timeline')
      .attr('width', tlWidth)
      .attr('height', tlHeight)
      .append('g')
        .attr('class', 'events-timeline')
        .attr('transform', 'scale(1,-1) translate(0,' + (-tlHeight) + ')');

    // timeline baseline
    eventsContainer.append('line')
      .attr('class', 'timeline-baseline')
      .attr('x1', 0)
      .attr('y1', 0)
      .attr('x2', 0)
      .attr('y2', 0);

    // year & month ticks
    eventsContainer.selectAll('g.event-group').data(gData)
    .enter()
      .append('g')
        .attr('class', function(d){ return 'event-group'+' '+d[0].yearFrom; })
        .attr('transform', function(d) { return 'translate(' + tlScale(d[0].yearFrom) + ', 0)'; })
      .each(function(d) {
        var dThis = d3.select(this);
        
        dThis.append('line')
          .attr('class', 'year-tick')
          .attr('y2', yearTickHeight);

        dThis.append('text')
          .attr('class', 'year-label')
          .attr('y', 40)
          .attr('dy', -12)
          .attr('transform', 'scale(1,-1)')
          .text(d[0].yearFrom);
        
        var monthsArr = d.filter(function(v){return v.monthFrom})
                         .map(function(v){return getMonthNum(v.monthFrom);});
        
        var lifeEvents = d.filter(function(v){ return v.eventType === 'Life Event'; });
        var letters    = d.filter(function(v){ return v.eventType === 'Letter'; });
        var works      = d.filter(function(v){ return v.eventType === 'Work'; });

        // if (monthsArr.length > 0) {
          d3.range(1,12).forEach(function(m){
            var hasEventStr = monthsArr.indexOf(m) > -1 ? 'has-event' : '';
            var mTick = dThis.append('line')
              .attr('class', 'month-tick'+' '+m+' '+hasEventStr)
              .attr('x1', Math.round(yearScale(m)))
              .attr('x2', Math.round(yearScale(m)))
              .attr('y1', 1)
              .attr('y2', monthTickHeight);
          });
        // }

        // console.log("LE: %s, L: %s, W: %s", lifeEvents.length, letters.length, works.length);
        // if (lifeEvents.length > 1) console.log(lifeEvents[0].dateFrom);

        if (lifeEvents.length) {
          var textBodyMargin = lifeEvents.length===1? 200 : 50;
          var textBodyWidth = yearWidth / lifeEvents.length - textBodyMargin;

          var textEl = dThis.append('foreignObject')
              .attr('y', -yearTickHeight)
              .attr('width', yearWidth)
              .attr('transform', 'scale(1,-1)')
              .append('xhtml:body')
              .attr('class', 'event-body');

          for (var i = 0; i < lifeEvents.length; i++) {
            textEl.append('div')
              .attr('class', 'event-title')
              .text(lifeEvents[i].title + '\n' + (lifeEvents[i].monthFrom || '') );
              // .text(function(d,i){d.title + '\n' + (d.monthFrom || '') });
          }
        } else {
          dThis.append('foreignObject')
            .attr('x', yearWidth/2)
            .attr('y', -yearTickHeight-40)
            .attr('width', yearWidth)
            .attr('transform', 'scale(1,-1)')
            .append('xhtml:body')
            .attr('class', 'event-body')
            .append('div')
            .attr('class', 'event-title')
            .text(function(v){ return "Events: "+v.length; });
          }
      });


    var timing = performance.now() - startTime;
    console.log('... d3 finished (%.1dms).', timing);
  }

  function getMonthNum(monthStr) {
    var monthArr = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
    return monthArr.indexOf(monthStr.match(/[A-Za-z]+/i)[0].toLowerCase())+1;
  }

  ///////////////////////////   DATA BINDING  //////////////////////////////////
  if (typeof window === 'undefined') {
    console.log('Reading local file...');
    d3main(null, JSON.parse(fs.readFileSync("../../timeline-sample-data.json")))
  } else {
    console.log('Fetching remote file...');
    d3.json(timelineDataUrl, d3main);
  }
})();