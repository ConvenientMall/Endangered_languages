var margin = {top: 50, right: 80, bottom: 50, left: 80},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var svg = d3.select("body")
    .append("svg")
    .call(d3.zoom().scaleExtent([1/2,200]).on('zoom',zoomed))
    .attr("height", height + margin.top + margin.bottom)
    .attr("width", width + margin.left + margin.right)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

const transform = d3.zoomIdentity;

var tooltip = d3.select("body").append("div").attr("class", "toolTip");
var countryMap = d3.map();
d3.queue()
    .defer(d3.json, "world.topojson")
    .defer(d3.csv, "database_file.csv", function(data) {
        countryList = data["country"].split(";");
        var i = 0;
        while (i < countryList.length-1) {
            val  = countryMap.get(countryList[i]);
            val = val === undefined ? 1 : val+1;
            countryMap.set(countryList[i], val+1); 
            i++; 
        }
    })
    .await(ready);

var projection = d3.geoMercator()
    .translate([width/2, height/2])
    .scale(100)

var path = d3.geoPath()
    .projection(projection)
var color = d3.scaleThreshold()
    .domain([1, 5, 10, 25, 50, 75, 100, 200])
    .range(d3.schemeOrRd[9]);
function ready (error, data, langs) {
    console.log(countryMap);
    console.log(data)
    countryMap["$United States"] = countryMap.get("USA");
    var countries = topojson.feature(data, data.objects.countries).features
    console.log("gurp",countries)
    svg.selectAll(".country")
        .data(countries)
        .enter().append("path")
        .attr("class", "country")
        .attr("d", path)
        .attr("fill", function(d) {
            var val = countryMap.get(d.properties["name"]);
            val = val === undefined ? 0 : val
            return color(val)})
        .on("mouseover", function(d) {
        var countryCount = countryMap.get(d.properties["name"]) === undefined ? 0 : countryMap.get(d.properties["name"]);
        tooltip
          .style("left", d3.event.pageX - 50 + "px")
          .style("top", d3.event.pageY - 70 + "px")
          .style("display", "inline-block")
          .html("Country Name:"+" "+ String(d.properties["name"])+"<br>Amount of Endangered Languages: "+ String(countryCount));
    })
    .on("mouseout", function(d){
            tooltip
                .style("display", "none");
    });
    
    console.log(langs)
    svg.selectAll(".lang-circle")
    .data(langs)
    .enter().append("circle")
    .attr("r", 2)
    .attr("cx", function(d) {
        return 10;
    })
    .attr("cx", function(d) {
        return 10;
    })
    
        
}

function zoomed() {
    svg.attr('transform', d3.event.transform)
}