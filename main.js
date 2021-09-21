function BuildGraph() {

  // set margins and create the svg
  var margin = {
    top: 10,
    right: 100,
    bottom: 30,
    left: 30
  };
  fullwidth = 750;
  fullheight = 300;
  width = fullwidth - margin.left - margin.right;
  height = fullheight - margin.top - margin.bottom;
  var viewbox = [0, 0, fullwidth, fullheight];
  var svg = d3.select(".main")
    .append("svg")
    .attr("viewBox", viewbox)
    .attr("preserveAspectRatio", "xMinYMin")
    .append("g")
    .attr("transform",
      "translate(" + margin.left + "," + margin.top + ")");

  //Data fomart function
  var format = function(d) {
    return {
      date: d3.timeParse("%Y-%m-%d")(d.date),
      upper: +d.upper,
      lower: +d.lower,
      est: +d.est,
      polls: (d.polls === "NA") ? null : +d.polls,
      party: d.party
    }; //Parse data
  }

  //Load prediction data
  d3.csv(filename, format).then(function(data) {

    //Set important variables

    //Set x scale (-1 on earliest day, to avoid points overlapping with y-axis)
    r = d3.extent(data.map(function(item) {
      return (item.date);
    }));
    var extent = 1;
    r[0] = r[0].setDate(r[0].getDate() - extent);
    //solves strange bug where first date on csv automatically binds to earliest date on scale
    data[0].date = data[0].date.setDate(data[0].date.getDate() + extent);

    //group data, get parties from group
    const sumstat = d3.group(data, d => d.party);
    const parties = Array.from(sumstat.keys());

    //Map to get party full names from code
    const fullName = new Map();
    fullName.set("con", {
      name: "Conservatives"
    });
    fullName.set("lab", {
      name: "Labour"
    });
    fullName.set("lib", {
      name: "Liberal Democrats"
    });
    fullName.set("snp", {
      name: "SNP"
    });
    fullName.set("grn", {
      name: "Greens"
    });

    //important functions
    var bisect = d3.bisector(d => d.date).left;
    var datef = d3.timeFormat("%e-%b-%Y");

    //Create scales (x +y +colour)
    const color = d3.scaleOrdinal()
      .domain(["con", "lab", "lib", "snp", "grn"])
      .range(["#0597F2", "#BF1717", "#D96704", "#F2E750", "#04BF7B"]);

    var x = d3.scaleTime()
      .domain(r)
      .range([0, width]);

    var y = d3.scaleLinear()
      .domain([0, 0.6])
      .range([height, 0]);

    //append x + y scales
    svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));

    svg.append("g")
      .call(d3.axisLeft(y).tickFormat(d3.format(".0%")));

    //Create focusgroup elements dots
    var focusgroup = svg.append("g");

    //add dashed line market
    focusgroup
      .append("line")
      .attr("id", "focusLine")
      .attr("stroke-dasharray", "5, 5");

    //Cycle through parties to add elements
    const Annotations = [];
    parties.forEach((item, i) => {

      //Get the last y + x value for each group
      var y3 = sumstat.get(item);
      var x0 = y3[y3.length - 1].date;
      var yval = y3[y3.length - 1].est;
      var yval_f = Math.round(yval * 100) + "%";
      var headfig = "#" + item;

      //Add in circles for each group
      focusgroup
        .append('circle')
        .style("fill", "none")
        .style("fill", color(item))
        .attr('r', 3)
        .attr("class", "track_" + item)
        .style("opacity", 1)
        .attr("cx", x(x0))
        .attr("cy", y(yval));

      //add in formatted % marker for headline
      d3.select(headfig)
        .html(yval_f)
        .style("color", color(item));

      //add in latest date
      d3.select("#date")
        .html(datef(x0));

      //add party labels for end of graph
      name = fullName.get(item).name
      Annotations.push({
        note: {
          label: name,
          orientation: "leftRight",
          align: "middle",
          wrap: 200
        },
        data: {
          y: yval,
          x: x0,
        },

        dx: 10,
        id: item,
        color: color(item),
        type: d3.annotationLabel,
        disable: ["connector"]
      })
    });

    //make sure labels don't overlapp by sorting then checking y-distance
    Annotations.sort(
      (a, b) =>
      b.data.y - a.data.y
    );
    let prev_y = 1;
    Annotations.forEach((item, i) => {
      if (prev_y - item.data.y < 0.03) {
        item.data.y -= 0.01;
      }
      prev_y = item.data.y;
    });

    //append annotations
    const makeAnnotations = d3.annotation()
      .accessors({
        x: function(d) {
          return x(d.x);
        },
        y: function(d) {
          return y(d.y);
        }
      })
      .annotations(Annotations);
    svg.append("g")
      .call(makeAnnotations);

    //Add interactive functions

    //on mouseover, reveal line
    function mouseover() {
      d3.select("#focusLine")
        .style("opacity", 1);
    }

    //on mouse move, change circle pos + line pos + update headline
    function mousemove(e) {
      e.preventDefault();

      //recover date from x pos
      var x0 = x.invert(d3.pointer(e)[0]);

      //update date headline fig
      d3.select("#date")
        .html(datef(x0));

      //Update line position
      d3.select("#focusLine")
        .attr('x1', x(x0)).attr('y1', y(0))
        .attr('x2', x(x0)).attr('y2', y(0.6));

      //For each party, bisect x with group y val
      parties.forEach((item) => {
        const element = ".track_" + item;

        var y3 = sumstat.get(item);
        var i = bisect(y3, x0);

        //If mouse is past graph, set bisect (index) value to max
        if (i > y3.length - 1) {
          i = y3.length - 1;
        }

        //get y value for group
        var yval = y3[i].est;

        //update circle positions
        d3.select(element)
          .attr("cx", x(x0))
          .attr("cy", y(yval));

        //update headline
        var yval_f = Math.round(yval * 100) + "%";
        var headfig = "#" + item;
        d3.select(headfig)
          .html(yval_f);
      });
    }

    // on mouse out, clear line + reset circle positions
    function mouseout() {
      //clear line
      d3.select("#focusLine")
        .style("opacity", 0);

      //reset circle positiosn (same code as rendering circles)
      parties.forEach((item) => {
        const element = ".track_" + item;
        var headfig = "#" + item;
        var y3 = sumstat.get(item);
        var x0 = y3[y3.length - 1].date;
        var yval = y3[y3.length - 1].est;
        var yval_f = Math.round(yval * 100) + "%";

        d3.select(element)
          .attr("cx", x(x0))
          .attr("cy", y(yval));

        d3.select(headfig)
          .html(yval_f);
        d3.select("#date")
          .html(datef(x0));
      });
    }

    //Add polling circles
    svg.append('g')
      .selectAll("dot")
      .data(data)
      .enter()
      .append("circle")
      .filter(function(d) {
        return d.polls;
      })
      .attr("class", function(d) {
        return "dots " + d.party;
      })
      .attr("cx", function(d) {
        return x(d.date);
      })
      .attr("cy", function(d) {
        return y(d.polls);
      })
      .attr("r", 1.5)
      .style("fill", function(d) {
        return color(d.party);
      });

    //Add condifence intervals by group
    svg.append("g")
      .selectAll("area")
      .data(sumstat)
      .join("path")
      .attr("fill", function(d) {
        return color(d[0])
      })
      .attr("stroke", "none")
      .attr("class", function(d) {
        return "conf area_" + d[0];
      })
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
      });

    //Add central line estimates by group
    svg.append("g")
      .selectAll(".line")
      .data(sumstat)
      .join("path")
      .attr("fill", "none")
      .attr("stroke", function(d) {
        return color(d[0])
      })
      .attr("class", function(d) {
        return "line line_" + d[0];
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
      });

    //Add investiable rectangle to register mouse interaction on graph
    svg
      .append("g")
      .append('rect')
      .style("fill", "none")
      .style("pointer-events", "all")
      .attr('width', width)
      .attr('height', height)
      .on('mouseover', mouseover)
      .on('mousemove', mousemove)
      .on('mouseout', mouseout);
  })
}

function dl(){
  window.open(exportname);
}
