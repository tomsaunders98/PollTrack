function BuildGraph() {
  //set variables

  //build svg box and append to div
  var margin = {
    top: 10,
    right: 30,
    bottom: 30,
    left: 60
  };
  width = 800 - margin.left - margin.right;
  height = 400 - margin.top - margin.bottom;
  aspratio = 50 * height / width + "%";
  var viewbox = [0, 0, 800, 400];
  var svg2 = d3.select("#main")
    .append("div") //clever hack to make svg responsive
    .classed("svg-container", true)
    .style("padding-bottom", aspratio) //container class to make it responsive
    .append("svg")
    .attr("viewBox", viewbox)
    .attr("preserveAspectRatio", "xMinYMin meet")
    .classed("svg-content-responsive", true)
    .append("g")
    .attr("transform",
      "translate(" + margin.left + "," + margin.top + ")");


  var format = function(d) {
    return {
      date: d3.timeParse("%Y-%m-%d")(d.date_long),
      upper: d.upper,
      lower: d.lower,
      est: d.est,
      polls: d.polls,
      party: d.party
    }; //Parse data

  }


  //Load state data
  d3.csv("pred_r.csv", format).then(function(data) {
    console.log(data)

    const sumstat = d3.group(data, d => d.party);




    const color = d3.scaleOrdinal()
      .domain(["con", "lib", "lab", "grn", "snp"])
      .range(d3.schemeSet2);

    //set x date scale
    var x = d3.scaleTime()
      .domain(d3.extent(data.map(function(item) {
        return (item.date);
      })))
      .range([0, width]);

    //append x scale
    svg2.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));
    //set y scale
    var y = d3.scaleLinear()
      .domain([0, 0.6])
      .range([height, 0]);
    //append y scale
    svg2.append("g")
      .call(d3.axisLeft(y).tickFormat(d3.format(".0%")));

    svg2.append('g')
      .selectAll("dot")
      .data(data)
      .enter()
      .append("circle")
      .attr("class", function(d) {
        return color(d.party)
      })
      .attr("cx", function(d) {
        return x(d.date);
      })
      .attr("cy", function(d) {
        return y(d.polls);
      })
      .attr("r", 1.5)
      .style("fill", function(d) {
        return color(d.party)
      })
    svg2.selectAll("area")
      .data(sumstat)
      .join("path")
      .attr("fill", function(d) {
        return color(d[0])
      })
      .attr("stroke", "none")
      .attr("class", "conf")
      .attr("opacity", 0.3)
      .attr("stroke-width", 1.5)
      .attr("d", function(d) {
        return d3.area()
          .x(function(d) {
            return x(d.date);
          })
          .y0(function(d) {
            return y(+d.upper);
          })
          .y1(function(d) {
            return y(+d.lower);
          })
          (d[1])
      })
    svg2.selectAll(".line")
      .data(sumstat)
      .join("path")
      .attr("fill", "none")
      .attr("stroke", function(d) {
        return color(d[0])
      })
      .attr("stroke-width", 1)
      .attr("d", function(d) {
        return d3.line()
          .x(function(d) {
            return x(d.date);
          })
          .y(function(d) {
            return y(+d.est);
          })
          (d[1])
      })



  })
}
