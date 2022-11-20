var margin = {
        top: 10,
        right: 190,
        bottom: 10,
        left: 80
    },
    width = 1300 - margin.left - margin.right,
    height = 800 - margin.top - margin.bottom,
    roots,
    families,
    languages;

var svg = d3.select("body").append("svg")
    .call(d3.zoom().scaleExtent([1 / 2, 200]).on('zoom', zoomed))
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

const transform = d3.zoomIdentity;

var link = svg.selectAll(".link"),
    node = svg.selectAll(".node");

const div = d3
    .select('body')
    .append('div')
    .attr('class', 'tooltip')
    .style('opacity', 0);

var simulation = d3.forceSimulation()
    .force("x", d3.forceX(width / 2).strength(.05))
    .force("y", d3.forceY(height / 2).strength(.05))
    .force('collision', d3.forceCollide(function (d) {
        return Math.sqrt(d.radius / Math.PI) * 20;
    }).strength(1))
    .on("tick", ticked);


d3.csv("database_file.csv").then((data) => {
    const mySet1 = new Set()
    var entries = d3.nest()
        .key(function (d) {
            return d.classification.split(";")[0];
        })
        .entries(data);
    for (let x = 0; x < entries.length; x++) {
        entries[x].name = entries[x].key;
        entries[x].radius = .3 * entries[x].values.length;
        entries[x].color = d3.interpolateSinebow(x / (entries.length));
        entries[x].tooltip = "Language Family:<br/>" + entries[x].key + "<br/>Number of Languages:<br/>" + entries[x].values.length;
        entries[x].chidren = true;
        for (let y = 0; y < entries[x].values.length; y++) {
            var status = entries[x].values[y].status;

            var vit = "";
            var fill = "";

            if (status.indexOf("At risk") !== -1) {
                vit = "At risk";
                fill = d3.interpolateRdYlGn(7 / 8);
            } else if (status.indexOf("Vulnerable") !== -1) {
                vit = "Vulnerable";
                fill = d3.interpolateRdYlGn(6 / 8);
            } else if (status.indexOf("Threatened") !== -1) {
                vit = "Threatened";
                fill = d3.interpolateRdYlGn(5 / 8);

            } else if (status.indexOf("Severely Endangered") !== -1) {
                vit = "Severely Endangered";
                fill = d3.interpolateRdYlGn(4 / 8);

            } else if (status.indexOf("Critically Endangered") !== -1) {
                vit = "Critically Endangered";
                fill = d3.interpolateRdYlGn(3 / 8);

            } else if (status.indexOf("Endangered") !== -1) {
                vit = "Endangered";
                fill = d3.interpolateRdYlGn(2 / 8);
            } else if (status.indexOf("Awakening") !== -1) {
                vit = "Awakening";
                fill = d3.interpolateRdYlGn(1 / 8);

            } else if (status.indexOf("Dormant") !== -1) {
                vit = "Dormant";
                fill = d3.interpolateRdYlGn(0 / 8);

            } else {
                vit = "Unknown";
                fill = d3.interpolateBuGn(0);
            }
            entries[x].values[y].tooltip = "Known as:<br/>" + entries[x].values[y].name + "<br/>Status:" + vit;
            entries[x].values[y].status = vit;
            entries[x].values[y].color = fill;
            entries[x].values[y].radius = 1;
        }

    }


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

    families = entries;
    roots = families;
    update();

    svg.append("circle").attr("cx", width - 80).attr("cy", height - 60).attr("r", function (d) {
        return Math.sqrt(4 / Math.PI) * 10
    }).style("fill", "green").on('click', start)

    svg.append("circle").attr("cx", width - 80).attr("cy", height - 30).attr("r", function (d) {
        return Math.sqrt(4 / Math.PI) * 10
    }).style("fill", "red").on('click', stop)


    function stop() {
        simulation.stop()
    }

    function start() {
        simulation.alphaTarget(.3).restart();

    }

});

function ticked() {
    link.attr("x1", function (d) {
            return d.source.x;
        })
        .attr("y1", function (d) {
            return d.source.y;
        })
        .attr("x2", function (d) {
            return d.target.x;
        })
        .attr("y2", function (d) {
            return d.target.y;
        });

    node
        .attr('transform', function (d) {
            return `translate(${d.x}, ${d.y})`
        })
}

function update() {
    const nodes = (roots)
    if (nodes._values) {
        console.log(node)
    }


    node = svg
        .selectAll('.node')
        .data(nodes, function (d) {
            return d.name;
        })

    node.exit().remove();


    const nodeEnter = node
        .enter()
        .append("g")
        .attr("class", "node")
        .on('click', clicked)
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));

    nodeEnter.append("circle")

        .attr("r", function (d) {
            return Math.sqrt(d.radius / Math.PI) * 20
        })
        .attr("fill", function (d, i) {
            return d.color;
        })
        .on('mouseover', d => {
            div
                .transition()
                .duration(200)
                .style('opacity', 0.9);
            div
                .html(d.tooltip)
                .style('left', d3.event.pageX + 'px')
                .style('top', d3.event.pageY - 28 + 'px');
        })
        .on('mouseout', () => {
            div
                .transition()
                .duration(500)
                .style('opacity', 0);
        });

    nodeEnter.append("text")
        .text(function (d) {
            return d.name.substring(0, 24);
        })
        .style("font-size", function (d) {
            return Math.sqrt(d.radius / Math.PI) * 4;
        })
        .style("text-anchor", "middle")
        .attr("fill", "black")
        .attr('x', 0)
        .attr('y', 0);

    node = nodeEnter.merge(node)

    simulation.nodes(nodes)
}

function clicked(d) {
    if (!d3.event.defaultPrevented) {
        if (d.chidren) {
            roots = d.values;
            roots.push(d)
            d.chidren = false;
        } else {
            d.chidren = true;
            roots = families;
        }
        update()
        if (!d3.event.active) simulation.alphaTarget(.1).restart()
        setTimeout(function () {
            simulation.alphaTarget(0);
        }, 500);

    }
}

function dragstarted(d) {
    if (!d3.event.active) simulation.alphaTarget(0.3).restart()
    d.fx = d.x
    d.fy = d.y
}

function dragged(d) {
    d.fx = d3.event.x
    d.fy = d3.event.y
}

function dragended(d) {
    if (!d3.event.active) simulation.alphaTarget(0)
    d.fx = null
    d.fy = null
}

function zoomed() {
    svg.attr('transform', d3.event.transform)
}
