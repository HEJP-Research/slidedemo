// This file is a script that holds the necessary functions used on the slide 6 webpage.

/*
  Given a year, updates the webpage and sends a new post request to the server to query
  new data given subject and year parameters. 
*/
function updateYear(yr) {
  //
  if (yr != null) {
    $("#yearSlider").val(yr);
  }

  // log the selected year for debuggin
  console.log($("#yearSlider").val());

  // don't do anything for 2008, 2009 (no data)
  if ($("#yearSlider").val() == 2008 || $("#yearSlider").val() == 2009) {
    console.log("STOP!!!!!!!!");
    return;
  }

  // sending data at /slide6data over POST as JSON
  fetch("/slide6data", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },

    // body of the request will be a concatenation of 2 JSON arrays (1 that holds name, value pair of data in
    // slider and the other holds name, value pair that is held in subject text field)
    body: JSON.stringify(
      $("#yearSlider")
        .serializeArray()
        .concat($("#subj_select_id").serializeArray())
    )
  })

    // Once the server sends back a response, we can operate on the returned json array
    .then(response => {
      return response.json();
    })

    // left and right graph correspond to their positioning on their slides. These correspond
    // to bargraph1 and bargraph2 on the webpage. 
    .then(jsonFromServer => {

      // load first graph data from first 10 elements of query result 
      var leftGraphData = new Array();
      for (var i = 0; i < 10; i++) {
        leftGraphData[i] = jsonFromServer[i];
      }

      // load second graph data (2010) from second 10 elements of query result 
      var rightGraphData2010 = new Array();
      for (var i = 10; i < 20; i++) {
        rightGraphData2010[i - 10] = jsonFromServer[i];
      }

      // load second graph data (2017) from last 10 elements of query result 
      var rightGraphData2017 = new Array();
      for (var i = 20; i < 30; i++) {
        rightGraphData2017[i - 20] = jsonFromServer[i];
      }

      // logging to client side console that we picked up the correct data 
      console.log("client received from server @ /slide6data");
      console.log("left graph data:");
      console.log(JSON.stringify(leftGraphData));
      console.log("right graph 2010 data:");
      console.log(JSON.stringify(rightGraphData2010));
      console.log("right graph 2017 data:");
      console.log(JSON.stringify(rightGraphData2017));

      // run D3 methods to visualize the data (first graph, second graph)
      drawFrequencyBarGraph(leftGraphData);
      drawChangeInRepresentationGraph(rightGraphData2010, rightGraphData2017);
    });
}

/*
 Draws the frequency bar graph using D3. The frequency bar graph shows the percentages 
 of the top 10 skills for a given subject in a given year.

 @param data this holds the top 10 skills data for a given year, subject determined
 by the client using HTML range, select elements. The data is the result of the SQL
 query on the server.
*/
function drawFrequencyBarGraph(data) {
  
  var margin = { top: 60, right: 180, bottom: 80, left: 100 },
    width = 1200 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

  var x = d3
    .scaleBand()
    .range([0, width])
    .paddingInner(0.1)
    .paddingOuter(0.3);

  var y = d3.scaleLinear().range([height, 0]);

  var xAxis = d3.axisBottom(x);

  var yAxis = d3.axisLeft(y).ticks(8);

  d3.select("#barGraph1")
    .selectAll("*")
    .remove();

  var svg = d3
    .select("#barGraph1")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  year = svg.append("g").attr("id", "bigYear");
  year
    .append("text")
    .attr("x", 720)
    .attr("y", 60)
    .text($("#yearSlider").val())
    .style("font-size", "6vw")
    .attr("alignment-baseline", "middle")
    .attr("value", "2017");

  x.domain(data.map(d => d.skillname));
  y.domain([0, d3.max(data, d => d.frequency * 1.1)]);

  // Translate subject to correspond to their slide subject vs. what we have as the possible
  // selections on the webpage
  var subject = "";
  var year = document.getElementById("yearSlider").value;
  if (document.getElementById("subj_select_id").value == "econ") {
    subject = "Economics";
  }
  if (document.getElementById("subj_select_id").value == "chem") {
    subject = "Chemistry";
  }
  if (document.getElementById("subj_select_id").value == "bio") {
    subject = "Biology";
  }

  svg
    .append("text")
    .attr("class", "title")
    .attr("x", 20)
    .attr("y", -26)
    .text("Top " + subject + " Post-Doc Skills in " + year);

  svg
    .append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0, " + height + ")")
    .call(xAxis)
    .selectAll(".tick text")
    .call(wrap, x.bandwidth());

  svg
    .append("g")
    .attr("class", "y axis")
    .call(yAxis);

  svg
    .selectAll(".bar")
    .data(data)
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("x", d => x(d.skillname))
    .attr("width", x.bandwidth())
    .attr("y", d => y(d.frequency))
    .attr("height", d => height - y(d.frequency));
}

function wrap(text, width) {
  text.each(function() {
    var text = d3.select(this),
      words = text
        .text()
        .split(/\s+/)
        .reverse(),
      word,
      line = [],
      lineNumber = 0,
      lineHeight = 1.1, // ems
      y = text.attr("y"),
      dy = parseFloat(text.attr("dy")),
      tspan = text
        .text(null)
        .append("tspan")
        .attr("x", 0)
        .attr("y", y)
        .attr("dy", dy + "em");
    while ((word = words.pop())) {
      line.push(word);
      tspan.text(line.join(" "));
      if (tspan.node().getComputedTextLength() > width) {
        line.pop();
        tspan.text(line.join(" "));
        line = [word];
        tspan = text
          .append("tspan")
          .attr("x", 0)
          .attr("y", y)
          .attr("dy", ++lineNumber * lineHeight + dy + "em")
          .text(word);
      }
    }
  });
}

/*
  This method draws the second graph which compares percentages of top 10 skills of given
  year, subject for 2010 and 2017. 

  @param data2010 the data for 2010 (i.e. percentages of top 10 given year skills in 2010)
  @param data2017 the data for 2017 (i.e. percentages of top 10 given year skills in 2017)
 */
function drawChangeInRepresentationGraph(data2010, data2017) {

  // Get rid of nulls. The nulls were just used so we could structure the data into a 30
  // element array when passing from server -> client. 
  data2010 = data2010.filter(function(d) {
    return d != null;
  });
  data2017 = data2017.filter(function(d) {
    return d != null;
  });

  // Sort the 2 arrays on the skillname which will make percentage changes easier to compute
  data2010.sort(function(a, b) {
    return a.skillname.localeCompare(b.skillname);
  });
  data2017.sort(function(a, b) {
    return a.skillname.localeCompare(b.skillname);
  });

  // log sorted data to the console for debugging purposes
  console.log("SORTED DATA:");
  console.log(data2010);
  console.log(data2017);

  // create a new array of the percentage differences that is sorted alphabetically on 
  // skill name 
  var differences = new Array();

  // i loops over 2010 data, j loops over 2017 data, k loops over differences 
  var i = 0;
  var j = 0;
  var k = 0;

  // loop while both i, j less then there lengths. We only want differences for skills
  // that occur in BOTH 2010 and 2017
  while (i < data2010.length && j < data2017.length) {

    // If skills match, compute difference and associate it with the skillname
    // i.e. create JSON object to load into differences 
    if (data2010[i].skillname == data2017[j].skillname) {
      differences[k] = {
        skillname: data2010[i].skillname,
        percentage: data2017[j].percentage - data2010[i].percentage
      };

      // increase all counters, i and j both move up and k will be for next insertion
      // into differences
      i++;
      j++;
      k++;
    }
    // if 2010 data has a skill that 2017 doesn't have (i.e. 2017 now has alphabetically
    // larger skillname) we skip the 2010 skill by moving i
    else if (data2010[i].skillname.localeCompare(data2017[j].skillname) < 0) {
      i++;
    } 
    // similar to above, if 2017 data has skill 2010 doesn't have, skip it by moving j
    else {
      j++;
    }
  }

  // now that differences have been computed, sort it so that we go smallest -> largest
  // difference 
  differences.sort(function(a, b) {
    return a.percentage - b.percentage;
  });

  // log differences for debugging 
  console.log(differences);

  // build graph with D3 
  var data = differences;

  // width, height, margins and padding
  var margin = { top: 20, right: 500, bottom: 100, left: 100 },
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

  // scales
  var xScale = d3.scaleLinear().range([0, width]);

  var yScale = d3
    .scaleBand()
    .rangeRound([0, height])
    .paddingInner(0.1);

  // domains
  //		xScale.domain([-.23, .18]); // approximates values in csv
  xScale
    .domain(
      d3.extent(data, function(d) {
        return d.percentage;
      })
    )
    .nice();
  yScale.domain(
    data.map(function(d) {
      return d.skillname;
    })
  );

  // define X axis
  var formatAsPercentage = d3.format("1.0%");

  var xAxis = d3
    .axisBottom()
    .scale(xScale)
    .tickFormat(formatAsPercentage);

  d3.select("#barGraph2")
    .selectAll("*")
    .remove();
  // create svg
  var svg = d3
    .select("#barGraph2")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // create  bars
  svg
    .selectAll(".bar")
    .data(data)
    .enter()
    .append("rect")
    .attr("class", function(d) {
      return "bar bar--" + (d.percentage < 0 ? "negative" : "positive");
    })
    .attr("x", function(d) {
      return xScale(Math.min(0, d.percentage));
    })
    .attr("y", function(d) {
      return yScale(d.skillname);
    })
    .attr("transform", "translate(0," + 50 + ")")
    .attr("width", function(d) {
      return Math.abs(xScale(d.percentage) - xScale(0));
    })
    .attr("height", yScale.bandwidth());

  //document.getElementById("barGraph2Title").innerText = "Change in Skill Representation 2010 to 2017"
  svg
    .append("text")
    .attr("class", "title")
    .attr("transform", "translate(0," + 20 + ")")
    .text("Change in Skill Representation 2010 to 2017");

  // var shiftHeight = height + 100;

  svg
    .append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + (height + 50) + ")")
    .call(xAxis);

  // add tickNegative
  var tickNeg = svg
    .append("g")
    .attr("class", "y axis")
    .attr("transform", "translate(" + xScale(0) + ",50)")
    .call(d3.axisLeft(yScale))
    .selectAll(".tick")
    .filter(function(d, i) {
      return data[i].percentage < 0;
    });

  tickNeg.select("line").attr("x2", 6);

  tickNeg
    .select("text")
    .attr("x", 9)
    .style("text-anchor", "start");
}

// Updates the animate button when clicked 
function updateButton(button, clicked) {
  button.innerText = clicked ? "Pause" : "Animate";
  updateColor(button, button.value);
}

// Updates the animate button color 
function updateColor(button, value) {
  button.style.backgroundColor =
    value == "1" ? "#b786f0" : "#525aff" /* blue */;
}

// Reverts the animate button color to original 
function revertColor(button) {
  button.style.backgroundColor = "white";
}

// Resets the button
function resetButton(button) {
  button.value = this.value == "0" ? "1" : "0";
  updateButton(button, false);
  revertColor(button);
}

/*
 * disables go button
 */
function disableGo() {
  document.getElementById("go").disabled = true;
}

// enables go button
function enableGo() {
  document.getElementById("go").disabled = false;
}

// Runs animation 
const delay = ms => new Promise(res => setTimeout(res, ms));

const animateYears = async () => {
  disableGo();
  var button = document.getElementById("animate");
  updateButton(button, true);
  for (var i = 2007; i <= 2017; i++) {
    if (i != 2008 && i != 2009) {
      if (button.value == "0") {
        updateButton(button, false);
        break;
      }
      document.getElementById("yearSlider").value = i;
      updateYear(i);
      await delay(1900);
      d3.select("#bigYear")
        .select("text")
        .attr("value", i);
      d3.select("#bigYear")
        .select("text")
        .text(i);
    }
  }
  resetButton(button);
  enableGo();
};
