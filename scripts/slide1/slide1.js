/*
 This file contains the functions that are needed by slide1.ejs. 
*/

// These global variables track the last valid entries for year1, year2
var lastValidYear1 = -1
var lastValidYear2 = -1

/*
  This function displays new data to the webpage whenever the user updates one of the two year selection sliders. 

  Specifically, this code requests new data from the server based on the year inputs. In future, this could be sped
  up by only running the 2 queries for the slider that was updated. As of now, 4 queries are run for each update. 
*/
function updateYear() {
  // get the years from the range sliders
  var year1 = $("#year1SliderID").val();
  var year2 = $("#year2SliderID").val();

  // No data for years 2008, 2009
  // can't be comparing the same year
  if (
    year1 == year2 ||
    year1 == 2008 ||
    year1 == 2009 ||
    year2 == 2008 ||
    year2 == 2009
  ) {

    // Update the sliders to be at the last valid year entries and then return
    // don't want to do any querying for invalid data inputs 
    $("#year1SliderID").val(lastValidYear1)
    $("#year2SliderID").val(lastValidYear2)
    return 
  }
  // if user just keeps clicking on the same start and end years, don't want to keep re-running the queries..
  else if (year1 == lastValidYear1 && year2 == lastValidYear2) {
    return
  }
  else {
    lastValidYear1 = year1
    lastValidYear2 = year2
  }

  // sending data at /slide1data over POST as JSON
  fetch("/slide1data", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },

    // send request with body that holds both year inputs
    body: JSON.stringify(
      $("#year1SliderID")
        .serializeArray()
        .concat($("#year2SliderID").serializeArray())
    )
  })
    .then(response => {
      return response.json();
    })
    // data received from server is still dumped into console (but can easily be visualized using jsonFromServer)

    // the data is formatted in the following manner from the server:
    // an array of Json objects where each object is a key, value pair with key being the beazone and the value
    // being an array of json objects. these json objects contain name, value pairs with a name marking the
    // data type (e.g. year1PostDoc v. year2Hejp) and value marking the count of jobs for that beazone and name

    // this data set up was needed for D3

    .then(jsonFromServer => {
      // logging to client for debugging
      console.log("client received from server @ /slide1data");
      console.log(
        "BEAZONE DATA FOR (HEJP YEAR 1), (POST-DOC YEAR 1), (HEJP YEAR 2), (POST-DOC YEAR 2)"
      );
      console.log(jsonFromServer);

      // runs d3 data visualization to generate the graph
      drawData(jsonFromServer, year1, year2);
    });
}

/*
  Visualizes the server data for 2 selected years using D3. 

  @param data the data picked up from the server (described above)
  @param year1 the first year selected 
  @param year2 the second year selected
*/
function drawData(data, year1, year2) {
  //
  d3.select("#beazoneGraph")
    .selectAll("*")
    .remove();

  var margin = { top: 20, right: 20, bottom: 30, left: 40 },
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

  // ordinal scaling function for "big groups" = bea zones
  var x0 = d3
    .scaleBand()

    // adjusted width of bar chart to make space for legends and text objects
    .range([0, width - 200])

    // this is how spaces are placed between beazones
    .paddingInner(0.1)
    .paddingOuter(0.3);

  // ordinal scaling function for small elements (year 1 postdoc, year 1 hejp, year 2 postdoc, year 2 hejp)
  var x1 = d3.scaleBand();

  // y axis scaling
  var y = d3.scaleLinear().range([height, 0]);

  // coloring for the 4 different elements
  var color = d3
    .scaleOrdinal()
    .range(["#0099ff", "#0066cc", "#ffcc00", "#cc9900"]);

  // x-axis function
  var xAxis = d3.axisBottom().scale(x0);

  // y-axis function
  var yAxis = d3
    .axisLeft()
    .scale(y)
    .tickFormat(d3.format(".2s"));

  var svg = d3
    .select("#beazoneGraph")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // set the domain for x0 ordinal scale function
  // just using year 1 postdoc data for beazones, all arrays have same 8 beazones..
  x0.domain(
    data.map(function(d) {
      return d.beazone;
    })
  );

  // These are the names in each beazone JSON object (bezone key -> [ array of name, value pairs ])
  var dataNames = [
    year1 + "hejpData",
    year1 + "postDocData",
    year2 + "hejpData",
    year2 + "postDocData"
  ];

  x1.domain(dataNames).range([0, x0.bandwidth()]);

  // Scale y according to the maximum of the data we have
  y.domain([
    0,
    d3.max(data, function(d) {
      return d3.max(d.jobData, function(d) {
        return d.value;
      });
    })
  ]);

  svg
    .append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis);

  svg
    .append("g")
    .attr("class", "y axis")
    .call(yAxis)
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 6)
    .attr("dy", ".71em")
    .style("text-anchor", "end")
    .text("Jobs");

  var beazone = svg
    .selectAll(".beazone")
    .data(data)
    .enter()
    .append("g")

    // when you hover over a beazone, there are 4 text objects that are updated
    .on("mouseover", function(d) {
      // the first text object holds year1 hejp data for the hovered zone. This data is multiplied by 100 to get the
      // real result (rememember: the bar graph displays HEJP data in hundreds). It is rounded to maintain an integer
      // value (we are multiplying floats)
      year1HejpText.text(
        d.beazone +
          " " +
          year1 +
          " HEJP " +
          Math.round(d.jobData[0].value * 100.0)
      );
      // the second text object holds year1 post doc data for the hovered zone
      year1PostDocText.text(
        d.beazone + " " + year1 + " Post Doc " + d.jobData[1].value
      );
      // the third text object holds year2 hejp data for the hovered zone. again, this data is multiplied by 100 and rounded
      year2HejpText.text(
        d.beazone +
          " " +
          year2 +
          " HEJP " +
          Math.round(d.jobData[2].value * 100.0)
      );
      // the fourth text object holds year1 postdoc data for the hovered zone
      year2PostDocText.text(
        d.beazone + " " + year2 + " Post Doc " + d.jobData[3].value
      );
    })

    // when you hover out of that zone, the text objects are cleared
    .on("mouseout", function(d) {
      year1HejpText.text("");
      year1PostDocText.text("");
      year2HejpText.text("");
      year2PostDocText.text("");
    })
    .attr("class", "g")
    .attr("transform", function(d) {
      return "translate(" + x0(d.beazone) + ",0)";
    });

  // draw the bars for each of the 4 data elements in a beazone's portion of the graph
  beazone
    .selectAll("rect")
    .data(function(d) {
      return d.jobData;
    })
    .enter()
    .append("rect")
    .attr("width", x1.bandwidth())
    .attr("x", function(d) {
      return x1(d.name);
    })
    .attr("y", function(d) {
      return y(d.value);
    })
    .attr("height", function(d) {
      return height - y(d.value);
    })
    .style("fill", function(d) {
      return color(d.name);
    });

  // these are the names that are showed in the legend for the 4 data elements - make sure to note hejp is in hundreds
  var legendNames = [
    year1 + " HEJP (Hundreds)",
    year1 + " Post Doc",
    year2 + " HEJP (Hundreds)",
    year2 + " Post Doc"
  ];

  var legend = svg
    .selectAll(".legend")
    .data(legendNames.slice())
    .enter()
    .append("g")
    .attr("class", "legend")
    .attr("transform", function(d, i) {
      return "translate(0," + i * 20 + ")";
    });

  legend
    .append("rect")
    .attr("x", width - 18)
    .attr("width", 18)
    .attr("height", 18)
    .style("fill", color);

  legend
    .append("text")
    .attr("x", width - 24)
    .attr("y", 9)
    .attr("dy", ".35em")
    .style("text-anchor", "end")
    .text(function(d) {
      return d;
    });

  // text object for year1 hejp data (appears on the top of the 4 text objects)
  var year1HejpText = svg
    .append("text")
    .attr("x", width)
    .attr("y", 100)
    .attr("dy", ".35em")
    .style("text-anchor", "end");

  // text object for year1 post doc data
  var year1PostDocText = svg
    .append("text")
    .attr("x", width)
    .attr("y", 125)
    .attr("dy", ".35em")
    .style("text-anchor", "end");

  // text object for year2 hejp data
  var year2HejpText = svg
    .append("text")
    .attr("x", width)
    .attr("y", 150)
    .attr("dy", ".35em")
    .style("text-anchor", "end");

  // text object for year2 postdoc data (appears on bottom of 4 text objects)
  var year2PostDocText = svg
    .append("text")
    .attr("x", width)
    .attr("y", 175)
    .attr("dy", ".35em")
    .style("text-anchor", "end");
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
  document.getElementById("graphGenID").disabled = true;
}

// enables go button
function enableGo() {
  document.getElementById("graphGenID").disabled = false;
}

// Runs animation
const delay = ms => new Promise(res => setTimeout(res, ms));

const animateYears = async () => {
  disableGo();
  var button = document.getElementById("animate");
  updateButton(button, true);

  // Nested loop to animate all possible year 1, year 2 pairings following the constraints of year 1, year 2
  // explained at top of updateYear()

  // Outer loop: loop 2007, 2010 - 2016 (year 1)
  // Inner loop: loop 2010 - 2017 (year 2)
  for (var i = 2007; i <= 2016; i++) {
    // Skip over 2008, 2009 in the outer loop
    if (i == 2008 || i == 2009) {
      continue;
    }

    // Update year 1 slider to reflect looping
    $("#year1SliderID").val(i);

    // Loop over year 2 choices now 
    // Loop from 2010 if year 1 = 2007
    // Otherwise, loop from the year following the choice for year 1
    for (var j = i == 2007 ? 2010 : i + 1; j <= 2017; j++) {

      // ALlows user to pause animation
      if (button.value == "0") {
        updateButton(button, false);
        break;
      }

      // No pause => keep going. Update the year 2 slider with j
      $("#year2SliderID").val(j);

      // Re-generate the graph, display it for 2 seconds 
      updateYear();
      await delay(2000);
    }
  }

  // Reset, allow user to manually generate graph
  resetButton(button);
  enableGo();
};
