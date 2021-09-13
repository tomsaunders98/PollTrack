// var onHighlight = function(event, d){
//   console.log(d.party);
//   party = d.party;
//
// //Change dots
//   d3.selectAll(".dots")
//     .transition()
//     .duration(200)
//     .style("fill", "lightgrey")
//     .attr("r", 1)
//
//   d3.selectAll("." + party)
//     .transition()
//     .duration(200)
//     .style("fill", color(party))
//     .attr("r", 1.5)
//
//     // Change area
//   d3.selectAll(".conf")
//     .transition()
//     .duration(200)
//     .style("fill", "lightgrey")
//     .style("display", "none")
//
//   d3.selectAll(".area_" + party)
//     .transition()
//     .duration(200)
//     .style("fill", color(party))
//     .style("display", "inherit")
//
//   //Change line colour
//
//   d3.selectAll(".line")
//     .transition()
//     .duration(200)
//     .style("stroke", "lightgrey")
//
//   d3.selectAll(".line_" + party)
//     .transition()
//     .duration(200)
//     .style("stroke", color(party))
//
// }
//
//
// var onLeave = function(event, d){
//   party = d.party;
//   fill = d3.select(d)
//   console.log(fill)
//   d3.selectAll(".dots")
//     .transition()
//     .duration(200)
//     .style("fill", "initial")
//     .attr("r", 1.5)
//   d3.selectAll(".conf")
//     .transition()
//     .duration(200)
//     .style("fill", color(party))
//     .style("display", "inherit")
//   d3.selectAll(".line")
//     .transition()
//     .duration(200)
//     .style("stroke", color(party))
// }
