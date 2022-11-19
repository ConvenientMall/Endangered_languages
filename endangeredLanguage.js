var margin = {
        top: 10,
        right: 190,
        bottom: 10,
        left: 80
    },
    width = 1300 - margin.left - margin.right,
    height = 800 - margin.top - margin.bottom;

var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

const div = d3
    .select('body')
    .append('div')
    .attr('class', 'tooltip')
    .style('opacity', 0);

var simulation = d3.forceSimulation()
    .force("charge", d3.forceManyBody())
    .force("x", d3.forceX(width / 2).strength(.1))
    .force("y", d3.forceY(height / 2).strength(.1))
    .force('collision', d3.forceCollide(function (d) {
        return .3 * d.values.length
    }).strength(1));


d3.csv("database_file.csv").then((data) => {
    var entries = d3.nest()
        .key(function (d) {
            return d.classification.split(";")[0];
        })
        .entries(data);
    console.log(entries);

    console.log

    var slider = d3
        .sliderHorizontal()
        .min(10)
        .max(d3.max(entries, function (d) {
            return d.values.length;
        }))
        .default(d3.max(entries, function (d) {
            return d.values.length;
        }))
        .step(1)
        .width(300)
        .displayValue(false)
        .on('onchange', (val) => {
            //where its set
            d3.select('#value').text(val);
        });

    d3.select('#slider')
        .append('svg')
        .attr('width', 500)
        .attr('height', 100)
        .append('g')
        .attr('transform', 'translate(30,30)')
        .call(slider);


    var node = svg.append("g")
        .attr("class", "nodes")
        .selectAll("circle")
        .data(entries)
        .enter().append("circle")
        .attr("r", function (d) {
            //console.log(d);
            return .3 * d.values.length;
        })

        .attr("fill", function (d, i) {
            return d3.interpolateTurbo((i / entries.length));
        })
        .on('mouseover', d => {
            div
                .transition()
                .duration(200)
                .style('opacity', 0.9);
            div
                .html("Language Family:<br/>" + d.key + "<br/>Number of Languages:<br/>" + d.values.length)
                .style('left', d3.event.pageX + 'px')
                .style('top', d3.event.pageY - 28 + 'px');
        })
        .on('mouseout', () => {
            div
                .transition()
                .duration(500)
                .style('opacity', 0);
        })
        //.nodes(graph.nodes)
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));


    simulation
        .nodes(entries)
        .on("tick", ticked);



    svg.append("circle").attr("cx", width - 80).attr("cy", height - 60).attr("r", function (d) {
        return Math.sqrt(4 / Math.PI) * 10
    }).style("fill", "green").on('click', start)
    svg.append("circle").attr("cx", width - 80).attr("cy", height - 30).attr("r", function (d) {
        return Math.sqrt(4 / Math.PI) * 10
    }).style("fill", "red").on('click', stop)

    function ticked() {

        node
            .attr("cx", function (d) {
                return d.x;
            })
            .attr("cy", function (d) {
                return d.y;
            });
    }

    function stop() {
        simulation.stop()
    }

    function start() {
        //console.log(simulation.nodes(graph.nodes))
        simulation.alphaTarget(.3).restart();

    }


});

function dragstarted() {
    if (!d3.event.active) simulation.alphaTarget(0.3).restart();
    d3.event.subject.fx = d3.event.subject.x;
    d3.event.subject.fy = d3.event.subject.y;
}

function dragged() {
    d3.event.subject.fx = d3.event.x;
    d3.event.subject.fy = d3.event.y;
}

function dragended() {
    if (!d3.event.active) simulation.alphaTarget(0);
    d3.event.subject.fx = null;
    d3.event.subject.fy = null;
}
