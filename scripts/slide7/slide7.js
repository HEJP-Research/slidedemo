function updateData() {
  var yr = $("#yearSlider").val();

  if (yr == 2008 || yr == 2009) {
    $("#yearSlider").val(2007);
    return;
  }

  // sending data at /slide7data over POST as JSON
  fetch("/slide7data", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },

    // send request with body that holds both year inputs
    body: JSON.stringify(
      $("#yearSlider")
        .serializeArray()
        .concat($("#division_select_id").serializeArray())
        .concat($("#position_select_id").serializeArray())
    )
  })
    .then(response => {
      return response.json();
    })
    .then(jsonFromServer => {
      console.log(jsonFromServer);
      reformatData(jsonFromServer);
      drawData(
        jsonFromServer,
        $("#yearSlider").serializeArray()[0].value,
        $("#division_select_id").serializeArray()[0].value,
        $("#position_select_id").serializeArray()[0].value
      );
    });
}

/*
  formats the JSON array that we got from the server side to be in the right order and 
  with the full subject names to graph using D3
*/
function reformatData(data) {
  data.sort(function(a, b) {
    if (a.subject.includes("other") && !b.subject.includes("other")) {
      return 1;
    } else if (!a.subject.includes("other") && b.subject.includes("other")) {
      return -1;
    }
    return a.subject.localeCompare(b.subject);
  });
  var shortNames = [
    "anth",
    "econ",
    "polisci",
    "psych",
    "soc",
    "othersocsci",
    "biomed",
    "chem",
    "cosi",
    "geosci",
    "math",
    "phys",
    "foreignlang",
    "history",
    "letters",
    "otherhumanities",
    "busma",
    "fs_edu",
    "fs_eng"
  ];
  var longNames = [
    "Anthropology",
    "Economics",
    "Political Science and Government",
    "Psychology",
    "Sociology",
    "Other Social Sciences",
    "Biological and Biomedical Sciences",
    "Chemistry",
    "Computer and Information Sciences",
    "Geosciences, Atmospheric and Ocean Sciences",
    "Mathematics and Statistics",
    "Physics and Astronomy",
    "Foreign Languages and Literature",
    "History",
    "Letters",
    "Other Humanities and Arts",
    "Business Management and Administration",
    "Education",
    "Engineering"
  ];
  for (var i = 0; i < data.length; i++) {
    for (var j = 0; j < shortNames.length; j++) {
      if (data[i].subject == shortNames[j]) {
        data[i].subject = longNames[j];
      }
    }
  }
}

/*
  Visualizes the server data for the selected year, division, and position using D3. 

  @param data the data picked up from the server (described above)
  @param year1 the first year selected 
  @param year2 the second year selected
*/
function drawData(data, year, division, position) {
  d3.select("#barGraph")
    .selectAll("*")
    .remove();

  var margin = { top: 60, right: 150, bottom: 200, left: 60 },
    width = 1200 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

  // ordinal scaling function for "big groups" = subjects
  var x0 = d3
    .scaleBand()

    // adjusted width of bar chart to make space for legends and text objects
    .range([0, width - 200])

    // this is how spaces are placed between subjects
    .paddingInner(0.6)
    .paddingOuter(0.6);

  // ordinal scaling function for small elements (contingent, tenureline, total)
  var x1 = d3.scaleBand();

  // left y axis scaling
  var y1 = d3.scaleLinear().range([height, 0]);

  // right y axis scaling
  var y2 = d3.scaleLinear().range([height, 0]);

  // coloring for the 3 different elements (total count, contingent share, tenureline share)
  var color = d3.scaleOrdinal().range(["#d6d6d6", "#3b7cff", "#ff4529"]);

  // x-axis function
  var xAxis = d3.axisBottom().scale(x0);

  // y-axis function
  var yAxisLeft = d3
    .axisLeft(y1)
    .scale(y1)
    .tickFormat(d3.format(".0%"));

  // y-axis function
  var yAxisRight = d3.axisRight(y2).scale(y2);

  var svg = d3
    .select("#barGraph")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // set the domain for x0 ordinal scale function
  x0.domain(
    data.map(function(d) {
      return d.subject;
    })
  );

  // These are the names for each column for each subject
  var dataNames = ["tenureline", "contingent"];

  x1.domain(dataNames).range([0, x0.bandwidth()]);

  // Scale right y-axis according to the maximum of the data we have
  y2.domain([
    0,
    d3.max(data, function(d) {
      return d.total * 1;
    })
  ]);

  //generate title string
  var titleLine1 = year + " ";
  var titleLine2 = "(";
  if (division == "sci") {
    titleLine1 += "Sciences";
  } else if (division == "soc_sci") {
    titleLine1 += "Social Sciences";
  } else if (division == "hum") {
    titleLine1 += "Humanities";
  } else if (division == "other") {
    titleLine1 += "Other";
  }
  titleLine1 += " Faculty Job Openings Composition";
  if (position == "isr1") {
    titleLine2 = "(R1 Institutions)";
  } else if (position == "fouryear") {
    titleLine2 = "(4-year Institutions)";
  }

  //add the title
  svg
    .append("text")
    .text(titleLine1)
    .attr("transform", "translate(" + (width / 2 - 100) + ",-30)")
    .style("font-size", "18")
    .style("text-anchor", "middle");
  svg
    .append("text")
    .text(titleLine2)
    .attr("transform", "translate(" + (width / 2 - 100) + ",-10)")
    .style("font-size", "18")
    .style("text-anchor", "middle");

  //add axes
  svg
    .append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis)
    .selectAll(".tick text")
    .call(wrap, x1.bandwidth());
  svg
    .append("g")
    .attr("class", "y axis")
    .call(yAxisLeft);
  svg
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x", 0 - height / 2)
    .attr("dy", ".71em")
    .style("text-anchor", "middle")
    .text("Share of Postings");
  svg
    .append("g")
    .attr("transform", "translate(" + x0.range()[1] + ", 0)")
    .attr("class", "y axis")
    .call(yAxisRight);
  svg
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", x0.range()[1] + 50)
    .attr("x", 0 - height / 2)
    .attr("dy", ".71em")
    .style("text-anchor", "middle")
    .text("Total Number of Postings");

  var subject1 = svg
    .selectAll(".subject1")
    .data(data)
    .enter()
    .append("g")
    // when you hover over a total count for a subject, there are 3 text objects that are updated
    .on("mouseover", function(d) {
      d3.select(this)
        .attr("stroke", "black")
        .attr("stroke-width", 2);

      // the first text object holds total openings count for the hovered subject.
      totalText.text(d.subject + " Total Faculty Job Openings: " + d.total);
      // the second text object holds tenureline count and percentage for the hovered subject.
      tenurelineText.text(
        "    Tenure Line Job Openings: " +
          d.tenureline +
          " (" +
          (
            (d.tenureline * 100) /
            (d.contingent * 1 + d.tenureline * 1)
          ).toFixed(2) +
          "%)"
      );
      // the third text object holds contingent count and percentage for the hovered subject.
      contingentText.text(
        "    Contingent Job Openings: " +
          d.contingent +
          " (" +
          (
            (d.contingent * 100) /
            (d.contingent * 1 + d.tenureline * 1)
          ).toFixed(2) +
          "%)"
      );
    })
    // when you hover out of that subjects, the text objects are cleared
    .on("mouseout", function(d) {
      d3.select(this).attr("stroke", "null");
      totalText.text("");
      tenurelineText.text("");
      contingentText.text("");
    })
    .attr("class", "g")
    .attr("transform", function(d) {
      return "translate(" + x0(d.subject) + ",0)";
    });

  var subject2 = svg
    .selectAll(".subject2")
    .data(data)
    .enter()
    .append("g")
    .on("mouseover", function(d) {
      // the first text object holds total openings count for the hovered subject.
      totalText.text(d.subject + " Total Faculty Job Openings: " + d.total);
      // the second text object holds tenureline count and percentage for the hovered subject.
      tenurelineText.text(
        "    Tenure Line Job Openings: " +
          d.tenureline +
          " (" +
          (
            (d.tenureline * 100) /
            (d.contingent * 1 + d.tenureline * 1)
          ).toFixed(2) +
          "%)"
      );
      // the third text object holds contingent count and percentage for the hovered subject.
      contingentText.text(
        "    Contingent Job Openings: " +
          d.contingent +
          " (" +
          (
            (d.contingent * 100) /
            (d.contingent * 1 + d.tenureline * 1)
          ).toFixed(2) +
          "%)"
      );
    })
    // when you hover out of that zone, the text objects are cleared
    .on("mouseout", function(d) {
      totalText.text("");
      tenurelineText.text("");
      contingentText.text("");
    })
    .attr("class", "g")
    .attr("transform", function(d) {
      return "translate(" + x0(d.subject) + ",0)";
    });

  // draw the bar for total number of postings for a subject's portion of the graph
  subject1
    .selectAll("rect")
    .data(function(d) {
      console.log({ name: "total", value: d.total * 1 });
      return [{ name: "total", value: d.total * 1 }];
    })
    .enter()
    .append("rect")
    .attr("width", x1.bandwidth() * 3)
    .attr("x", function(d) {
      return x1(d.name);
    })
    .attr("transform", "translate(" + x1.bandwidth() / -2 + ",0)")
    .attr("y", function(d) {
      return y2(d.value);
    })
    .attr("height", function(d) {
      return height - y2(d.value);
    })
    .style("fill", function(d) {
      return color(d.name);
    });

  // draw the bars for each of tenure and contingent for a subject's portion of the graph
  subject2
    .selectAll("rect")
    .data(function(d) {
      return [
        {
          name: "tenureline",
          value: d.tenureline / (d.tenureline * 1 + d.contingent * 1)
        },
        {
          name: "contingent",
          value: d.contingent / (d.tenureline * 1 + d.contingent * 1)
        }
      ];
    })
    .enter()
    .append("rect")
    .on("mouseover", function(d) {
      d3.select(this)
        .attr("stroke", "black")
        .attr("stroke-width", 2);
    })
    .on("mouseout", function(d) {
      d3.select(this).attr("stroke", "null");
    })
    .attr("width", x1.bandwidth() - 3)
    .attr("x", function(d) {
      return x1(d.name) + 1.5;
    })
    .attr("y", function(d) {
      return y1(d.value);
    })
    .attr("height", function(d) {
      return height - y1(d.value);
    })
    .style("fill", function(d) {
      return color(d.name);
    });

  //names for legend
  var legendNames = [
    "Total Number of Openings",
    "Contingent Share",
    "Tenure-Line Share"
  ];
  //adding the legend
  var legend = svg
    .selectAll(".legend")
    .data(legendNames.slice())
    .enter()
    .append("g")
    .attr("class", "legend")
    .attr("transform", function(d, i) {
      return "translate(10," + i * 20 + ")";
    })
    .style("font-size",14);
  //squares for the legend
  legend
    .append("rect")
    .attr("x", width)
    .attr("width", 18)
    .attr("height", 18)
    .style("font-size",14)
    .style("fill", color);
  //labels for the legend
  legend
    .append("text")
    .attr("x", width - 6)
    .attr("y", 9)
    .attr("dy", ".35em")
    .style("font-size",14)
    .style("text-anchor", "end")
    .text(function(d) {
      return d;
    });

  // text object for total openings data
  var totalText = svg
    .append("text")
    .attr("x", 50)
    .attr("y", height + 80)
    .attr("dy", ".35em")
    .style("text-anchor", "start")
    .attr("font-size", 16)
    .attr("font-weight", 800);

  // text object for tenureline data
  var tenurelineText = svg
    .append("text")
    .attr("x", 50)
    .attr("y", height + 105)
    .attr("dy", ".35em")
    .style("text-anchor", "start");

  // text object for contingent data
  var contingentText = svg
    .append("text")
    .attr("x", 50)
    .attr("y", height + 130)
    .attr("dy", ".35em")
    .style("text-anchor", "start");
}

//wraps text label to >1 line if it's too long
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

//cycles through all possible years (2007, 2010-2017) and generates the bar graph for each year
const animateYears = async () => {
  disableGo();
  var button = document.getElementById("animate");
  updateButton(button, true);
  for (var i = 2007; i <= 2017; i++) {
    // Skip over 2008, 2009 in the outer loop
    if (i == 2008 || i == 2009) {
      continue;
    }
    $("#yearSlider").val(i);
    // ALlows user to pause animation
    if (button.value == "0") {
      updateButton(button, false);
      break;
    }
    // Re-generate the graph, display it for 2 seconds
    updateData();
    await delay(2000);
  }
  // Reset, allow user to manually generate graph
  resetButton(button);
  enableGo();
};
