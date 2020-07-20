// This is the main file that sends data to the client and accesses the postgres database on turing

var express = require("express");
const { Client } = require("pg");

// The client will be used to query the hejp postgres DB on turing using an environmental variable USERFLAG we can
// run the program with the credentials of chami, ruth, or eitan
client = new Client({
  host: "/var/run/postgresql",
  user: process.env.USERFLAG,
  password: "",
  database: "hejp"
});

// attempt to connect to server
client.connect(err => {
  if (err) {
    console.error("connection error", err.stack);
  } else {
    console.log("connected");
  }
});

// Initialize express app
var app = express();

// This will be used to parse the request body sent by the client to the server into a JSON array
// N.B. the body parser is a separate NPM package that was installed
var bodyParser = require("body-parser");

// support json encoded bodies
app.use(bodyParser.json());

// Allows us to use scripts, views and organized for each visualization
// views holds the ejs files for each visualization
// scripts associated with the ejs files files for each visualization
app.use(express.static(__dirname + "/"));

// Marks that we will be using ejs templating
app.set("view engine", "ejs");

/*
 This code posts the result of a SQL query on the database to /slide1data to be picked
 up by the client. Specifically, this code will query the database based on the year
 and subject selections on the client side. 
 */
app.post("/slide1data", function(req, res) {
  // logging the request info for debugging
  console.log(req.body);

  // parse the input years from request body
  let year1 = parseInt(req.body[0].value);
  let year2 = parseInt(req.body[1].value);

  // build query strings with year1, year2 for post doc and hejp (non-postdoc) jobs
  let year1PostDocQueryStr =
    "select beazone, count(beazone) from job_beazone where postdoc='1' and year=" +
    year1 +
    " group by beazone;";

  let year2PostDocQueryStr =
    "select beazone, count(beazone) from job_beazone where postdoc='1' and year=" +
    year2 +
    " group by beazone;";

  let year1HejpQueryStr =
    "select beazone, count(beazone) from job_beazone where postdoc='0' and year=" +
    year1 +
    " group by beazone;";

  let year2HejpQueryStr =
    "select beazone, count(beazone) from job_beazone where postdoc='0' and year=" +
    year2 +
    " group by beazone;";

  // run the postgres query and send it back to the client
  client
    .query(year1PostDocQueryStr)
    .then(year1PostDocData => {
      client.query(year2PostDocQueryStr).then(year2PostDocData => {
        client.query(year1HejpQueryStr).then(year1HejpData => {
          client.query(year2HejpQueryStr).then(year2HejpData => {
            // The data will be formatted in the following manner for use with D3 on client side:

            // the data is formatted in the following manner:
            // an array of Json objects where each object is a key, value pair with key being the beazone and the value
            // being an array of json objects. these json objects contain name, value pairs with a name marking the
            // data type (e.g. year1PostDoc v. year2Hejp) and value marking the count of jobs for that beazone and name

            // furthermore, the query's select returns the beazones in a different order (L -> R) than what's on the slides
            // therefore, they were manually reordered to match the slides (hence the indices being hardcoded below to match
            // the array returned from the SQL query)

            // lastly, the hejp data is divided by 100 to be in hundreds (this is indicated to the user client-side )
            // the post doc data is multiplied by 1 to make it integer not string...
            var beazoneToJobData = [
              {
                beazone: "Rocky Mountains",
                jobData: [
                  {
                    name: year1 + "hejpData",
                    value: year1HejpData.rows[2].count / 100
                  },
                  {
                    name: year1 + "postDocData",
                    value: year1PostDocData.rows[2].count * 1
                  },
                  {
                    name: year2 + "hejpData",
                    value: year2HejpData.rows[2].count / 100
                  },
                  {
                    name: year2 + "postDocData",
                    value: year2PostDocData.rows[2].count * 1
                  }
                ]
              },
              {
                beazone: "Mideast",
                jobData: [
                  {
                    name: year1 + "hejpData",
                    value: year1HejpData.rows[4].count / 100
                  },
                  {
                    name: year1 + "postDocData",
                    value: year1PostDocData.rows[4].count * 1
                  },
                  {
                    name: year2 + "hejpData",
                    value: year2HejpData.rows[4].count / 100
                  },
                  {
                    name: year2 + "postDocData",
                    value: year2PostDocData.rows[4].count * 1
                  }
                ]
              },
              {
                beazone: "Southeast",
                jobData: [
                  {
                    name: year1 + "hejpData",
                    value: year1HejpData.rows[0].count / 100
                  },
                  {
                    name: year1 + "postDocData",
                    value: year1PostDocData.rows[0].count * 1
                  },
                  {
                    name: year2 + "hejpData",
                    value: year2HejpData.rows[0].count / 100
                  },
                  {
                    name: year2 + "postDocData",
                    value: year2PostDocData.rows[0].count * 1
                  }
                ]
              },
              {
                beazone: "Plains",
                jobData: [
                  {
                    name: year1 + "hejpData",
                    value: year1HejpData.rows[1].count / 100
                  },
                  {
                    name: year1 + "postDocData",
                    value: year1PostDocData.rows[1].count * 1
                  },
                  {
                    name: year2 + "hejpData",
                    value: year2HejpData.rows[1].count / 100
                  },
                  {
                    name: year2 + "postDocData",
                    value: year2PostDocData.rows[1].count * 1
                  }
                ]
              },
              {
                beazone: "Great Lakes",
                jobData: [
                  {
                    name: year1 + "hejpData",
                    value: year1HejpData.rows[5].count / 100
                  },
                  {
                    name: year1 + "postDocData",
                    value: year1PostDocData.rows[5].count * 1
                  },
                  {
                    name: year2 + "hejpData",
                    value: year2HejpData.rows[5].count / 100
                  },
                  {
                    name: year2 + "postDocData",
                    value: year2PostDocData.rows[5].count * 1
                  }
                ]
              },
              {
                beazone: "Far West",
                jobData: [
                  {
                    name: year1 + "hejpData",
                    value: year1HejpData.rows[3].count / 100
                  },
                  {
                    name: year1 + "postDocData",
                    value: year1PostDocData.rows[3].count * 1
                  },
                  {
                    name: year2 + "hejpData",
                    value: year2HejpData.rows[3].count / 100
                  },
                  {
                    name: year2 + "postDocData",
                    value: year2PostDocData.rows[3].count * 1
                  }
                ]
              },
              {
                beazone: "New England",
                jobData: [
                  {
                    name: year1 + "hejpData",
                    value: year1HejpData.rows[7].count / 100
                  },
                  {
                    name: year1 + "postDocData",
                    value: year1PostDocData.rows[7].count * 1
                  },
                  {
                    name: year2 + "hejpData",
                    value: year2HejpData.rows[7].count / 100
                  },
                  {
                    name: year2 + "postDocData",
                    value: year2PostDocData.rows[7].count * 1
                  }
                ]
              },
              {
                beazone: "Southwest",
                jobData: [
                  {
                    name: year1 + "hejpData",
                    value: year1HejpData.rows[6].count / 100
                  },
                  {
                    name: year1 + "postDocData",
                    value: year1PostDocData.rows[6].count * 1
                  },
                  {
                    name: year2 + "hejpData",
                    value: year2HejpData.rows[6].count / 100
                  },
                  {
                    name: year2 + "postDocData",
                    value: year2PostDocData.rows[6].count * 1
                  }
                ]
              }
            ];

            res.json(beazoneToJobData);
          });
        });
      });
    })
    .catch(e => console.error(e.stack));
});

var startYrHEJPCount = -1;
var startYrPostDocCount = -1;
var endYrHEJPCount = -1;
var endYRPostDocCount = -1;

function buildGrowthArr() {
  let postDocGrowth =
    ((endYRPostDocCount - startYrPostDocCount) / startYrPostDocCount) * 100.0;
  let hejpGrowth =
    ((endYrHEJPCount - startYrHEJPCount) / startYrHEJPCount) * 100.0;

  var growthArr = [
    { growth: "Post-Doc", percent: postDocGrowth },
    { growth: "HEJP", percent: hejpGrowth },
    { growth: "BSL", percent: 7.0 }
  ];

  return growthArr;
}

/*
 This code posts the result of a SQL query on the database to /slide2data to be picked
 up by the client. Specifically, this code will query the database based on the year selections
 on the client side.
 */
app.post("/slide2data", function(req, res) {
  // logging the request info for debugging
  console.log(req.body);

  let startYr = parseInt(req.body[0].value);
  let endYr = req.body[1].value;
  let change = req.body[2].value;

  let startYrPostDocQueryStr =
    "SELECT COUNT(jobid) FROM nsftable WHERE postdoctoral='1' and year = " +
    startYr +
    ";";
  let startYrHEJPQueryStr =
    "SELECT COUNT(jobid) FROM nsftable WHERE postdoctoral='0' and year = " +
    startYr +
    ";";
  let endYrPostDocQueryStr =
    "SELECT COUNT(jobid) FROM nsftable WHERE postdoctoral='1' and year = " +
    endYr +
    ";";
  let endYrHEJPQueryStr =
    "SELECT COUNT(jobid) FROM nsftable WHERE postdoctoral='0' and year = " +
    endYr +
    ";";

  if (startYrHEJPCount == -1) {
    client.query(endYrPostDocQueryStr).then(endYrPostDocData => {
      client.query(endYrHEJPQueryStr).then(endYrHEJPData => {
        client.query(startYrPostDocQueryStr).then(startYrPostDocData => {
          client.query(startYrHEJPQueryStr).then(startYrHEJPData => {
            startYrPostDocCount = startYrPostDocData.rows[0].count;
            startYrHEJPCount = startYrHEJPData.rows[0].count;
            endYRPostDocCount = endYrPostDocData.rows[0].count;
            endYrHEJPCount = endYrHEJPData.rows[0].count;
            res.json(buildGrowthArr());
          });
        });
      });
    });
  } else if (change == "start") {
    client.query(startYrPostDocQueryStr).then(startYrPostDocData => {
      client.query(startYrHEJPQueryStr).then(startYrHEJPData => {
        startYrPostDocCount = startYrPostDocData.rows[0].count;
        startYrHEJPCount = startYrHEJPData.rows[0].count;
        res.json(buildGrowthArr());
      });
    });
  } else {
    client.query(endYrPostDocQueryStr).then(endYrPostDocData => {
      client.query(endYrHEJPQueryStr).then(endYrHEJPData => {
        endYRPostDocCount = endYrPostDocData.rows[0].count;
        endYrHEJPCount = endYrHEJPData.rows[0].count;
        res.json(buildGrowthArr());
      });
    });
  }
});

/*
This puts the result of a SQL query onto the /slide3data URL for pick up by the client.
*/
app.get("/slide3data", function(req, res) {
  client
    .query(
      "select beazone, year, count(beazone) from job_beazone where postdoc='1' group by beazone, year order by year;"
    )
    .then(data => {
      res.json(data.rows);
    })
    .catch(e => console.error(e.stack));
});

/*
 This data posts the result of a SQL query on the database to /slide4data to be picked
 up by the client. Specifically, this code will query the database based on the year
 and subject selections on the client side. 
 */
app.post("/slide4data", function(req, res) {
  // logging the request info for debugging
  console.log(req.body);

  // parse the input year, subject from the request body
  let yr = parseInt(req.body[0].value);
  let subj = req.body[1].value;
});

/*
 This data puts the result of a SQL query on the database to /slide5data to be picked
 up by the client. 
 */
app.get("/slide5data", function(req, res) {
  client
    .query(
      "select institutionstate, count(jobid) from job_state where state not like institutionstate group by institutionstate order by count(jobid) desc limit 10;"
    )
    .then(data => {
      res.json(data.rows);
    })
    .catch(e => console.error(e.stack));
});

/*
 This data posts the result of a SQL query on the database to /slide6data to be picked
 up by the client. Specifically, this code will query the database based on the year
 and subject selections on the client side. 

 To make these queries easier, a new table was built on the database "post_doc_slides_data"
 that connected the necessary skills and postdoctoral data.
 */
app.post("/slide6data", function(req, res) {
  // logging the request info for debugging
  console.log(req.body);

  // parse the input year, subject from the request body
  let yr = parseInt(req.body[0].value);
  let subj = req.body[1].value;

  // query the post doc data for the selected yr and subj from the client (for more on query see Google doc)
  let queryStrCurrYear =
    "select skillname,count(skillname) as frequency from post_doc_slides_data where " +
    subj +
    " = '1' and year = " +
    yr +
    " and postdoc = '1' group by skillname order by count(skillname) desc limit 10;";

  /*
   queryStr2010 = query that will be used to get the percentages for the top 10 skills of 'yr' in 2010
   queryStr2017 = query that will be used to get the percentages for the top 10 skills of 'yr' in 2017
   data2010 = data taken from the query 'queryStr2010'
   data2017 = data taken from the query 'queryStr2017'
  */
  var queryStr2010, queryStr2017, data2010, data2017;

  client
    // First, the top 10 skills for the selected yr and subject are queried
    .query(queryStrCurrYear)
    .then(data => {
      top10skills = data.rows;

      // this is a string that will be used in the SQL queries for 2010, 2017 to identify
      // the top 10 skills from the selected year. e.g. ('microscope', 'java', 'research')
      top10skillnames = "(";
      for (let i = 0; i < top10skills.length - 1; i++) {
        top10skillnames += "'" + top10skills[i].skillname + "', ";
      }
      top10skillnames +=
        "'" + top10skills[top10skills.length - 1].skillname + "')";

      // log this for debugging
      console.log("skillnames = " + top10skillnames);

      // build the queries for top 10 selected year skills in 2010, 2017 using the above string
      // for more on these, see Google doc
      queryStr2010 =
        "select skillname, cast(count(jobid) as float) / (select count(*) from nsftable where year = 2010 and " +
        (subj == "econ"
          ? "economics"
          : subj == "biomed"
          ? "biologicalandbiomedicalsciences"
          : "chemistry") +
        "='1' and postdoctoral = '1') percentage from post_doc_slides_data where postdoc = '1' and " +
        subj +
        " = '1' and year = 2010 and skillname in " +
        top10skillnames +
        " group by skillname order by count(skillname) desc limit 10;";
      queryStr2017 =
        "select skillname, cast(count(jobid) as float) / (select count(*) from nsftable where year = 2017 and " +
        (subj == "econ"
          ? "economics"
          : subj == "biomed"
          ? "biologicalandbiomedicalsciences"
          : "chemistry") +
        "='1' and postdoctoral = '1') percentage from post_doc_slides_data where postdoc = '1' and " +
        subj +
        " = '1' and year = 2017 and skillname in " +
        top10skillnames +
        " group by skillname order by count(skillname) desc limit 10;";

      // run 2010, 2017 queries
      client.query(queryStr2010).then(data10 => {
        data2010 = data10.rows;
      });
      client
        .query(queryStr2017)

        // once 2017 data has been queries, can now begin building the data for the 2nd graph
        .then(data17 => {
          data2017 = data17.rows;

          // log the 2010, 2017 data for debugging (make sure percentages make sense)
          console.log("DATA FOR " + subj + " FOR 2010:");
          console.log(data2010);
          console.log("DATA FOR " + subj + " FOR 2017:");
          console.log(data2017);

          /*
         Sometimes, the top 10 skills from the selected year may not have existed in 2010 or
         2017. Thus, the returned JSON arrays 'data2010' and 'data2017' will have less than 10
         entries. Hence, we will pad the arrays with 'null' to simplify the client side D3
         code used to build the graphs. 
        */
          while (data2010.length < 10) {
            data2010.push(null);
          }
          while (data2017.length < 10) {
            data2017.push(null);
          }

          // Send to the user a 30 element array with the first 10 elements being data from
          // the selected year, the second 10 elements from 2010, and the last 10 elements
          // from 2017
          res.json(data.rows.concat(data2010).concat(data2017));
        });
    })
    .catch(e => console.error(e.stack));
});

//shortened names of all subjects for slide 7
let subjNames = [
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

/*
 This is a helper function for getQueryForDiv() that gets the SQL query that creates 1 row of the result of the 
 table created by getQueryForDiv(). That is, given a subject (identified by index for the SQL string attribute
 'subjects'), a year, and pos that signifies R1 or four year, it generates a query that gets a 4 element tuple:
    element 1: the subject name 
    element 2: the number of contingent jobs
    element 3: the number of tenureline jobs
    element 4: the number of total jobs

  @param subjIndex index to signify a subject's location in the SQL string attrbute 'subjects' 
  @param year the year from which to get job data for this subject
  @param pos either research 1 or four year 

  @return a string with the SQL query that returns what's described above 
*/
function getQueryForSubj(subjIndex, year, pos) {
  query =
    "select '" +
    // add the first item to the selected tuple : the subject name using the global array above with subject names
    // this item will be called 'subject' in the resulting SQL query
    subjNames[subjIndex - 1] +
    // next use an inner query to get the contingent jobs for this subject, year, and pos
    // this item will be called 'contingent' in the resulting SQL query
    "' as subject, (select count(*) from faculty_job_openings where contingent = '1' and substring(subjects, " +
    subjIndex +
    ", 1) = '1' and year = " +
    year +
    " and " +
    pos +
    // next use an inner query to get the tenureline jobs for this subject, year, and pos
    // this item will be called 'tenureline' in the resulting SQL query
    " = '1') as contingent, (select count(*) from faculty_job_openings where tenureline = '1' and substring(subjects, " +
    subjIndex +
    ", 1) = '1' and year = " +
    year +
    " and " +
    pos +
    // lastly use an inner query to get the total jobs for this subject, year, and pos
    // this item will be called 'total' in the resulting SQL query
    " = '1') as tenureline, (select count(*) from faculty_job_openings where substring(subjects, " +
    subjIndex +
    ", 1) = '1' and year = " +
    year +
    " and " +
    pos +
    " = '1')  as total";
  return query;
}

// map that associates a division to the range of indices in the 'subjects' attribute of the faculty_job_openings
// SQL table that correlate to the subjects in the division
let divToSubj = new Map([
  ["soc_sci", [1, 6]],
  ["sci", [7, 12]],
  ["hum", [13, 16]],
  ["other", [17, 19]]
]);

/*
 The client sends the server a division from which subject data must be retrieved. This function takes a division
 and dynamically creates a SQL query to get the necessary data for each subject in the division by utilizing the
 map divToSubj above as well as the helper function getQueryForSubj() 

 @param div the division sent by the client (e.g. soc_sci, sci, etc.)
 @param year the year sent by the client (e.g. 2007, 2010, etc.)
 @param pos poorly named variable that means is the position of job desired by the user (sent from client) R1 or is
 it four year 

 @return a string which is the SQL query that returns what's described above
*/
function getQueryForDiv(div, year, pos) {
  query = "";

  // get the range of indices from the 'subjects' string SQL attribute that pertain to this division
  // they have been ordered in table construction to be grouped together and ordered in the same way as the slides
  // sent by Sarah. for example: social science division takes up subjects anthropology, economics, etc. which are
  // indices 1, 2,.. 6
  subjRange = divToSubj.get(div);

  // loop over the first to second to last indices getting the SQL query that gets the contingent, tenureline, and
  // total jobs for each of these subjects and then appending a 'union'. The query that gets the tuple containing
  // these 3 job counts is done by the helper function getQueryForSubj. The 'union' serves to place each of these
  // subjects query results on different rows of the returned table. That way the client D3 code can work with a
  // table with 4 entries per each subject in the division. For example, social science's returned table will have
  // 6 rows for 6 subjects. Each row has subject name, contingent count, tenureline count, and total count
  for (var i = subjRange[0]; i < subjRange[1]; i++) {
    query += getQueryForSubj(i, year, pos) + " union ";
  }

  // don't append a union after the last year in the range. if this was social science, put unions after subject
  // queries 1,..,5 and then append query for the last subject (6)
  query += getQueryForSubj(subjRange[1], year, pos);
  return query;
}

/*
 This data posts the result of a SQL query on the database to /slide7data to be picked
 up by the client. Specifically, this code will query the database based on the year
 and subject selections on the client side. 

 To make these queries easier, a new table was built on the database "faculty_job_openings"
 that only contain the faculty job data for the subjects in the divisions that are required for the 
 slides needed to replicate sent by Sarah on 3/31/2020
*/
app.post("/slide7data", function(req, res) {
  // logging the request info for debugging
  console.log(req.body);

  // parse the input year, subject, "pos" :) from the request body
  let yr = parseInt(req.body[0].value);
  let div = req.body[1].value;
  let pos = req.body[2].value;

  // run the query for the division and send the rows back to the client
  // the helper method getQueryForDiv() will format the data in the proper manner to be used in client-side D3
  client.query(getQueryForDiv(div, yr, pos)).then(data => {
    res.json(data.rows);
  });
});

// Different Visualization Page are rendered at these URLS
// That is, when the links on index.html are clicked, those URLs are requested, and the ejs pages in the views
// subfolders are rendered.
app.get("/slide1", function(req, res) {
  res.render("slide1/slide1");
});

app.get("/slide2", function(req, res) {
  res.render("slide2/slide2");
});

app.get("/slide3", function(req, res) {
  res.render("slide3/slide3");
});

app.get("/slide4", function(req, res) {
  res.render("slide4/slide4");
});

app.get("/slide5", function(req, res) {
  res.render("slide5/slide5");
});

app.get("/slide6", function(req, res) {
  res.render("slide6/slide6");
});

app.get("/slide7", function(req, res) {
  res.render("slide7/slide7");
});

// server running on port 8000
app.listen(8000);
