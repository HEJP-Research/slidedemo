function getDataFromServer() {
  // sending data at /slide3data over GET as JSON
  // using GET because client doesn't need to send specific paramters to the server
  fetch("/slide5data", {
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
      console.log("client received from server @ /slide5data");
      console.log(jsonFromServer);
      removeWhiteSpace(jsonFromServer);
      buildVis5(jsonFromServer);
    });
}

function buildVis5(jsonFromServer) {
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
      return d.institutionstate;
    })
  );
  yScale.domain([
    0,
    d3.max(jsonFromServer, function(d) {
      return parseInt(d.count);
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
          return d;
        })
        .ticks(10)
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
      return xScale(d.institutionstate);
    })
    .attr("y", function(d) {
      return yScale(d.count);
    })
    .attr("width", xScale.bandwidth())
    .attr("height", function(d) {
      return height - yScale(d.count);
    })
    .attr("id", function(d) {
      return d.institutionstate;
    })
    .attr("fill", function(d) {
      if (d.count == 130) {
        return "orange";
      }
      return "#B8BBFF";
    })
    .on("mouseover", function(d) {
      d3.select("#" + d.institutionstate + "_bar").attr("font-size", "30px");
      if (d.count == 130) {
        d3.select("#" + d.institutionstate).attr("fill", "#fc6919");
        return;
      }
      d3.select("#" + d.institutionstate).attr("fill", "#243ca6");
    })
    .on("mouseout", function(d) {
      d3.select("#" + d.institutionstate + "_bar").attr("font-size", "24px");
      if (d.count == 130) {
        d3.select("#" + d.institutionstate).attr("fill", "orange");
        return;
      }
      d3.select("#" + d.institutionstate).attr("fill", "#B8BBFF");
    });

  // adding labels to bar chart

  // top text
  svg
    .append("text")
    .attr("transform", "translate(100,0)")
    .attr("x", 50)
    .attr("y", 50)
    .attr("class", "title")
    .text("Top States With Postings Outside Their Borders");

  // x axis text
  g.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(xScale))
    .append("text")
    .attr("y", height - 50)
    .attr("x", width - 10)
    .attr("text-anchor", "end")
    .attr("stroke", "black")
    .text("Institution State");

  // y axis text
  g.append("g")
    .call(
      d3
        .axisLeft(yScale)
        .tickFormat(function(d) {
          return d;
        })
        .ticks(10)
    )
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 6)
    .attr("dy", "-5.1em")
    .attr("text-anchor", "end")
    .attr("stroke", "black")
    .text("Out of State Postings (Count)");

  // text above each bar

  svg
    .selectAll("text.bar")
    .data(jsonFromServer)
    .enter()
    .append("text")
    .attr("id", function(d) {
      return d.institutionstate + "_bar";
    })
    .attr("class", "bar")
    .attr("text-anchor", "middle")
    .attr("x", function(d) {
      return xScale(d.institutionstate) + 127;
    })
    .attr("y", function(d) {
      return yScale(d.count) + 90;
    })
    .text(function(d) {
      return d.count;
    });
}

function removeWhiteSpace(jsonFromServer) {
  for (var i = 0; i < jsonFromServer.length; i++) {
    jsonFromServer[i].institutionstate = jsonFromServer[
      i
    ].institutionstate.replace(" ", "");
  }
}
