/*
 This file contains the functions that are needed by slide2.ejs
*/
// Static variable for postdoc slide name
let postDocGrowth = "Post-Doc"
// These global variables track the last valid start and end years
var lastValidStart = -1;
var lastValidEnd = -1;

function updateYear() {
  var startYr = $("#startYearSliderID").val();
  var endYr = $("#endYearSliderID").val();
  var changeTracker = { name: "changedYear", value: "" };

  // startYr cannot be greater than or equal to end year s
  if (
    startYr >= endYr ||
    startYr == 2008 ||
    startYr == 2009 ||
    endYr == 2008 ||
    endYr == 2009
  ) {
    // Update the sliders to be at the last valid year entries and then return
    // don't want to do any querying for invalid data inputs 
    $("#startYearSliderID").val(lastValidStart);
    $("#endYearSliderID").val(lastValidEnd);
    return
  }
  // if user just keeps clicking on the same start and end years, don't want to keep re-running the queries..
  else if (startYr == lastValidStart && endYr == lastValidEnd) {
    return
  }
  // at this point, user has entered valid start and end years and one of the 2 years is different from the 
  // last recorded valid start and end years 
  else {
    if (startYr != lastValidStart) {
      changeTracker.value = "start"
      lastValidStart = startYr
    }
    else {
      changeTracker.value = "end"
      lastValidEnd = endYr
    }
  }

  // sending data at /slide2data over POST as JSON
  fetch("/slide2data", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },

    // concatenate the 2 json arrays that hold the data from the 2 sliders
    body: JSON.stringify(
      $("#startYearSliderID")
        .serializeArray()
        .concat($("#endYearSliderID").serializeArray().concat(changeTracker))
    )
  })
    .then(response => {
      return response.json();
    })
    // data received from server is still dumped into console (but can easily be visualized using jsonFromServer)
    .then(jsonFromServer => {
      // logging to client for debugging
      console.log("client received from server @ /slide2data");
      console.log("POST-DOC CATEGORICAL GROWTH = ");
      console.log(jsonFromServer[0]);
      console.log("HEJP CATEGORICAL GROWTH = ");
      console.log(jsonFromServer[1]);
      buildVis2(jsonFromServer);
    });
}

function buildVis2(jsonFromServer, startYr, endYr) {
  d3.select("svg")
    .selectAll("*")
    .remove();

  var svg = d3.select("svg");
  (margin = { top: 60, right: 180, bottom: 80, left: 100 }),
    (width = 1200 - margin.left - margin.right),
    (height = 700 - margin.top - margin.bottom);

  svg
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom);

  var xScale = d3
      .scaleBand()
      .range([0, width])
      .padding(0.4),
    yScale = d3.scaleLinear().range([height, 0]);

  var g = svg
    .append("g")
    .attr("transform", "translate(" + 100 + "," + 100 + ")");

  xScale.domain(
    jsonFromServer.map(function(d) {
      return d.growth;
    })
  );
  yScale.domain([
    0,
    d3.max(jsonFromServer, function(d) {
      return parseInt(d.percent);
    })
  ]);

  // draing x axis

  g.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(xScale))
    .attr("class", "x axis");

  // drawing y axis

  g.append("g")
    .call(
      d3
        .axisLeft(yScale)
        .tickFormat(function(d) {
          return d + "%";
        })
        .ticks(12)
    )
    .append("text")
    .attr("y", 6)
    .attr("dy", "0.71em")
    .attr("text-anchor", "end")
    .attr("class", "y axis")
    .text("count");

  // drawing bars

  g.selectAll(".bar")
    .data(jsonFromServer)
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("x", function(d) {
      return xScale(d.growth);
    })
    .attr("y", function(d) {
      return yScale(d.percent);
    })
    .attr("width", xScale.bandwidth())
    .attr("height", function(d) {
      return height - yScale(d.percent);
    })
    .attr("id", function(d) {
      return d.growth;
    })
    .attr("fill", function(d) {
      if (d.growth == postDocGrowth) {
        return "orange";
      }
      return "#B8BBFF";
    })
    .on("mouseover", function(d) {
      d3.select("#" + d.growth + "_bar").attr("font-size", "30px");
      if (d.growth == postDocGrowth) {
        d3.select("#" + d.growth).attr("fill", "#fc6919");
        return;
      }
      d3.select("#" + d.growth).attr("fill", "#243ca6");
    })
    .on("mouseout", function(d) {
      d3.select("#" + d.growth + "_bar").attr("font-size", "24px");
      if (d.growth == postDocGrowth) {
        d3.select("#" + d.growth).attr("fill", "orange");
        return;
      }
      d3.select("#" + d.growth).attr("fill", "#B8BBFF");
    });

  // adding labels to bar chart

  // top text
  svg
    .append("text")
    .attr("transform", "translate(100,0)")
    .attr("x", 50)
    .attr("y", 30)
    .attr("class", "title")
    .text("Overall Categorical Growths");

  svg
    .append("text")
    .attr("transform", "translate(100,0)")
    .attr("x", 50 + 100)
    .attr("y", 50)
    .attr("class", "bigyear")
    .text($("#startYearSliderID").val() + " - " + $("#endYearSliderID").val());

  // y axis text
  g.append("g")
    .call(
      d3
        .axisLeft(yScale)
        .tickFormat(function(d) {
          return d + "%";
        })
        .ticks(12)
    )
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 6)
    .attr("dy", "-5.1em")
    .attr("text-anchor", "end")
    .attr("stroke", "black")
    .text("Growth Percentage");

  // text above each bar

  svg
    .selectAll("text.bar")
    .data(jsonFromServer)
    .enter()
    .append("text")
    .attr("id", function(d) {
      return d.growth + "_bar";
    })
    .attr("class", "bar")
    .attr("text-anchor", "middle")
    .attr("x", function(d) {
      return xScale(d.growth) + 175;
    })
    .attr("y", function(d) {
      return yScale(d.percent) + 90;
    })
    .text(function(d) {
      return Math.round(d.percent) + "%";
    });
}
