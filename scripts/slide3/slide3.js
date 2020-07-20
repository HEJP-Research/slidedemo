function getDataFromServer() {
  // sending data at /slide3data over GET as JSON
  // using GET because client doesn't need to send specific paramters to the server
  fetch("/slide3data", {
    method: "GET",
    headers: {
      "Content-Type": "application/json"
    }
  })
    .then(response => {
      return response.json();
    })
    // data received from server is still dumped into console (but can easily be visualized using jsonFromServer)
    .then(jsonFromServer => {
      console.log("client received from server @ /slide3data");
      //console.log(jsonFromServer);
      drawLineGraph(jsonFromServer);
    });
}

function drawLineGraph(data) {
  //creating a JSON object with a field for each beazone, and the value for the field is an array of year-count pairs
  var beazones = [
    "Southeast",
    "Southwest",
    "Rocky Mountains",
    "Great Lakes",
    "New England",
    "Plains",
    "Mideast",
    "Far West"
  ];
  var beazoneCounts = {
    Southeast: [],
    Southwest: [],
    "Rocky Mountains": [],
    "Great Lakes": [],
    "New England": [],
    Plains: [],
    Mideast: [],
    "Far West": []
  };
  var max = 0;
  for (i in beazones) {
    for (j in data) {
      if (data[j].count * 1 > max * 1) {
        max = data[j].count;
      }
      if (data[j].beazone === beazones[i]) {
        beazoneCounts[beazones[i]].push({
          year: data[j].year,
          count: data[j].count
        });
      }
    }
  }

  // set the dimensions and margins of the graph
  var margin = { top: 40, right: 20, bottom: 30, left: 50 },
    width = 960 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

  // set the ranges
  var x = d3.scaleLinear().range([0, width]);
  var y = d3.scaleLinear().range([height, 0]);

  // define the line
  var valueline = d3
    .line()
    .x(function(d) {
      return x(d.year);
    })
    .y(function(d) {
      return y(d.count);
    });

  // append the svg obgect to the body of the page
  // appends a 'group' element to 'svg'
  // moves the 'group' element to the top left margin
  var svg = d3
    .select("body")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // Scale the range of the data
  x.domain(
    d3.extent(data, function(d) {
      return d.year;
    })
  );
  y.domain([0, max]);

  //add the title
  svg
    .append("text")
    .text("Total Post-Doc Counts by Home Region")
    .attr("transform", "translate(250,0)")
    .style("font-size", "1.5vw");

  for (i in beazones) {
    console.log(beazoneCounts[beazones[i]]);
    data = beazoneCounts[beazones[i]];
    // Add the line/path
    svg
      .append("path")
      .data([data])
      .attr("class", "line_" + beazones[i].split(" ").join(""))
      .attr("id", "line_" + beazones[i].split(" ").join(""))
      .attr("d", valueline)
      .attr("fill", "none")
      .attr("stroke-width", "4px")
      .on("mouseover", function() {
        d3.select(this).attr("stroke-width", "8px");
        console.log("#" + d3.select(this).attr("id") + "_text");
        d3.select("#" + d3.select(this).attr("id") + "_text").attr(
          "font-size",
          "14pt"
        );
        d3.select("#" + d3.select(this).attr("id") + "_text").attr(
          "font-variant",
          "small-caps"
        );
        d3.select("#" + d3.select(this).attr("id") + "_legend").attr(
          "height",
          "4"
        );
      })
      .on("mouseout", function() {
        d3.select(this).attr("stroke-width", "4px");
        d3.select("#" + d3.select(this).attr("id") + "_text").attr(
          "font-size",
          "12pt"
        );
        d3.select("#" + d3.select(this).attr("id") + "_text").attr(
          "font-variant",
          "normal"
        );
        d3.select("#" + d3.select(this).attr("id") + "_legend").attr(
          "height",
          "2.4"
        );
      });
    console.log("line_" + beazones[i].split(" ").join(""));
  }
  // Add the X Axis
  svg
    .append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x).tickFormat(d3.format(".0f")));

  // Add the Y Axis
  svg.append("g").call(d3.axisLeft(y));

  //Add the legend

  var lineLegend = svg
    .selectAll(".lineLegend")
    .data(beazones)
    .enter()
    .append("g")
    .attr("class", "lineLegend")
    .attr("transform", function(d, i) {
      return "translate(30," + (i * 20 + 20) + ")";
    });

  lineLegend
    .append("text")
    .attr("id", function(d) {
      return "line_" + d.split(" ").join("") + "_text";
    })
    .text(function(d) {
      return d;
    })
    .attr("transform", "translate(25,6)"); //align texts with boxes

  lineLegend
    .append("rect")
    .attr("class", function(d) {
      return "legend_" + d.split(" ").join("");
    })
    .attr("id", function(d) {
      return "line_" + d.split(" ").join("") + "_legend";
    })
    .attr("width", 20)
    .attr("height", 2.4);
}
