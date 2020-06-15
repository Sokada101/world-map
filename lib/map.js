document.addEventListener("DOMContentLoaded", () => {

const width = Math.max(document.documentElement.clientWidth, window.innerWidth || 0),
height = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);

let centered, clicked_point;

const div = d3.select(".map")
    .append("div")
    .attr("class", "tooltip")

div.html("Guess country and its capital")

const svg = d3
  .select("body")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

svg.attr("viewBox",`0 0 ${width} ${height}`)
    .attr("preserveAspectRatio", "xMinYMin");

const g = svg.append("g")
    .attr("class", "map");

d3.queue()
    .defer(d3.json, "./data/50m.json")
    .defer(d3.csv, "./data/cap.csv")
    .await(function (error, world, data) {
        if (error) {
            console.error('Oh dear, something went wrong: ' + error);
        }
        else {
            drawMap(world, data);
        }
    });

function drawMap(world, cap) {
    // geoMercator projection
    var projection = d3.geoMercator() //d3.geoOrthographic()
        .scale(200)
        .translate([width / 2, height / 1.5]);

    // geoPath projection //draw lines 
    var path = d3.geoPath().projection(projection);
    
    var features = topojson.feature(world, world.objects.countries).features;

    var capitalById = {};

    cap.forEach(function (d) {
        capitalById[d.CountryName] = {
           capital: d.CapitalName
        };
    });

    features.forEach(function (d) {
        d.details = capitalById[d.properties.name] ? capitalById[d.properties.name] : {capital: "Not found. Please contact me for correction."};
    });

    g.selectAll("path")
        .data(features)
        .enter().append("path")
        .attr("name", function (d) {
            return d.properties.name;
        })
        .attr("d",path)
        .attr("class","country")
        .on("click", clicked)

        function clicked(d) {
          div.html(`Country: ${d.properties.name}` + "<br />" + `Capital:${d.details.capital}`)
          var x, y, k;
          //if not centered into that country and clicked country in visited countries
          if (d && centered !== d) {
            var centroid = path.centroid(d); //get center of country
            var bounds = path.bounds(d); //get bounds of country
            var dx = bounds[1][0] - bounds[0][0], //get bounding box
              dy = bounds[1][1] - bounds[0][1];
            //get transformation values
            x = (bounds[0][0] + bounds[1][0]) / 2;
            y = (bounds[0][1] + bounds[1][1]) / 2;
            k = Math.min((width - 150)/ dx, (height - 150) / dy);
            centered = d;
          } else {
            //else reset to world view
            div.html("Guess country and its capital")

            x = width / 2;
            y = height / 2;
            k = 1;
            centered = null;
          }
          //set class of country to .active
          g.selectAll("path").classed(
            "active",
            centered &&
              function (d) {
                return d === centered;
              }
          );

          

          // make contours thinner before zoom for smoothness
          if (centered !== null) {
            g.selectAll("path").style("stroke-width", 0.75 / k + "px");
          }

          // map transition
          g.transition()
            //.style("stroke-width", (0.75 / k) + "px")
            .duration(750)
            .attr(
              "transform",
              "translate(" +
                width / 2 +
                "," +
                height / 2 +
                ")scale(" +
                k +
                ")translate(" +
                -x +
                "," +
                -y +
                ")"
            )
            .on("end", function () {
              if (centered === null) {
                g.selectAll("path").style("stroke-width", 0.75 / k + "px");
              }
            });

        }
        
       };
});


//   const margin = { top: 50, left: 50, right: 50, bottom: 50 },
//     height = 400 - margin.top - margin.bottom,
//     width = 800 - margin.left - margin.right;

//   const svg = d3
//     .select("#map")
//     .append("svg")
//     .attr("height", height + margin.top + margin.bottom)
//     .attr("width", width + margin.left + margin.right)
//     .append("g")
//     .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

//     d3.queue()
//     .defer(d3.json, "../lib/world.topojson")
//     .defer(d3.csv, "../lib/cap.csv")
//     .await(ready)

//     function ready (error,data, cap) {

//         const countries = topojson.feature(data,data.objects.countries).features

// // translate round globe to flat screen 
//      const projection = d3.geoMercator()
//      .translate([width/2, height/2])
//      .scale(110)

// // line generetor 
//      const path = d3.geoPath()
//      .projection(projection)
     
// let selectedCap = false; 

//     svg
//     .selectAll(".country")
//     .data(countries)
//     .enter()
//     .append("path")
//     .attr("class", "country")
//     .attr("d", path)
//     .on("mouseover", function (d) {
//         d3.select(this).classed("selected", true)
//         selectedCap = true 
//     })
//     .on("mouseout", function (d) {
//         d3.select(this).classed("selected", false)
//         selectedCap = false; 
//     });

//     svg
//       .selectAll(".cap")
//       .data(cap)
//       .enter()
//       .append("circle")
//       .attr("r", 1.5)
//       .attr("cx", function (d) {
//         let coord = projection([d.CapitalLongitude, d.CapitalLatitude]);
//         return coord[0];
//       })
//       .attr("cy", function (d) {
//         let coord = projection([d.CapitalLongitude, d.CapitalLatitude]);
//         return coord[1];
//       })

//     //   .on("mouseout", function (d) {
//     //     d3.select(this).classed("selected-cap", false);
//     //   });

//     }
  
