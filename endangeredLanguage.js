      var margin = {
            left: 80,
            right: 80,
            top: 50,
            bottom: 50
        },
        width = 960 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom,
        roots,
        families,
        familyname,
        languages;

    var svg = d3.select("body").append("svg")
        .call(d3.zoom().scaleExtent([1 / 2, 100]).translateExtent([[-width, -height], [width * 2, height * 2]]).on('zoom', zoomed))
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
        .force("x", d3.forceX(width / 2).strength(.025))
        .force("y", d3.forceY(height / 2).strength(.025))
        .force('collision', d3.forceCollide(function (d) {
            return Math.sqrt(d.radius / Math.PI) * 10;
        }).strength(1))
        .on("tick", ticked);
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////

    // select the svg area

    // create a list of keys
    var keys = ["At risk", "Vulnerable", "Threatened", "Endangered", "Severely Endangered", "Critically Endangered", "Awakening", "Dormant"]

    // Usually you have a color scale in your chart already
    var color = d3.scaleOrdinal()
        .domain(keys)
        .range(d3.schemeRdYlGn[10].slice(0, 9).reverse());

    // Add one dot in the legend for each name.
    var size = 20
    svg.selectAll("mydots")
        .data(keys)
        .enter()
        .append("rect")
        .attr("x", +800)
        .attr("y", function (d, i) {
            return 100 + i * (size + 5)
        }) // 100 is where the first dot appears. 25 is the distance between dots
        .attr("width", size)
        .attr("height", size)
        .style("fill", function (d) {
            return color(d)
        })

    // Add one dot in the legend for each name.
    svg.selectAll("mylabels")
        .data(keys)
        .enter()
        .append("text")
        .attr("x", +800 + size * 1.2)
        .attr("y", function (d, i) {
            return 100 + i * (size + 5) + (size / 2)
        }) // 100 is where the first dot appears. 25 is the distance between dots
        .style("fill", function (d) {
            return color(d)
        })
        .text(function (d) {
            return d
        })
        .attr("text-anchor", "left")
        .style("alignment-baseline", "middle")

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////
    d3.csv("database_file.csv").then((data) => {
        const mySet1 = new Set()
        var entries = d3.nest()
            .key(function (d) {

                return d.classification.split(";")[0].split(",")[0];
            })
            .entries(data);
        for (let x = 0; x < entries.length; x++) {
            entries[x].name = entries[x].key;
            entries[x].radius = entries[x].values.length;
            entries[x].tooltip = "Language Family:<br/>" + entries[x].key + "<br/>Number of Languages:<br/>" + entries[x].values.length;
            entries[x].chidren = true;
            var colr = 0;
            for (let y = 0; y < entries[x].values.length; y++) {
                var status = entries[x].values[y].status;
                var vit = "";
                var fill = "";
                if (status.indexOf("At risk") !== -1) {
                    colr += 9;
                    vit = "At risk";
                    fill = d3.interpolateRdYlGn(9 / 10);
                } else if (status.indexOf("Vulnerable") !== -1) {
                    colr += 8;
                    vit = "Vulnerable";
                    fill = d3.interpolateRdYlGn(8 / 10);
                } else if (status.indexOf("Threatened") !== -1) {
                    colr += 7;
                    vit = "Threatened";
                    fill = d3.interpolateRdYlGn(7 / 10);

                } else if (status.indexOf("Endangered") !== -1) {
                    colr += 6;
                    vit = "Endangered";
                    fill = d3.interpolateRdYlGn(6 / 10);

                } else if (status.indexOf("Severely Endangered") !== -1) {
                    colr += 4;
                    vit = "Severely Endangered";
                    fill = d3.interpolateRdYlGn(4 / 10);

                } else if (status.indexOf("Critically Endangered") !== -1) {
                    colr += 3;
                    vit = "Critically Endangered";
                    fill = d3.interpolateRdYlGn(3 / 10);
                } else if (status.indexOf("Awakening") !== -1) {
                    colr += 2;
                    vit = "Awakening";
                    fill = d3.interpolateRdYlGn(2 / 10);

                } else if (status.indexOf("Dormant") !== -1) {
                    colr += 1;
                    vit = "Dormant";
                    fill = d3.interpolateRdYlGn(1 / 10);

                } else {
                    colr += 1;
                    vit = "Unknown";
                    fill = d3.interpolateBuGn(0);
                }
                entries[x].values[y].tooltip = "Known as:<br/>" + entries[x].values[y].name + "<br/>Status:" + vit;
                entries[x].values[y].status = vit;
                entries[x].values[y].color = fill;
                entries[x].values[y].radius = 1;
                entries[x].values[y].chidren = false;
            }
            entries[x].color = d3.interpolateRdYlGn(colr / ((entries[x].values.length) * 10));

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


        function stop() {
            simulation.stop()
        }

        function start() {
            simulation.alphaTarget(.0025).restart();

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
        svg.selectAll(".familyTitle").remove();

        const nodeEnter = node
            .enter()
            .append("g")
            .attr("class", "node")
            .on('click', (d) => {
                clicked(d);
                div
                    .transition()
                    .duration(500)
                    .style('opacity', 0)

            })

            .call(d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended));


        nodeEnter.append("circle")
            .attr("r", function (d) {
                return Math.sqrt(d.radius / Math.PI) * 10
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
                return Math.sqrt(d.radius / Math.PI) * 2 + "px";
            })
            .style("text-anchor", "middle")
            .attr("fill", "black")
            .attr('x', 0)
            .attr('y', 0);

        svg.append("text")
            .attr("class", "titleFamily")
            .text(function (d) {
                return familyname;
            })
            .style("font-size", function (d) {
                return 50 + "px";
            })
            .style("text-anchor", "middle")
            .attr("fill", "black")
            .attr('x', width / 2)
            .attr('y', height / 2 - 300);

        node = nodeEnter.merge(node)
        simulation.nodes(nodes)
    }


    function clicked(d) {
        svg.selectAll(".titleFamily").remove();
        console.log(d.chidren)
        if (!d3.event.defaultPrevented) {
            if (d.chidren) {
                familyname = d.key;
                roots = d.values;
            } else {
                familyname = "";
                roots = families;
            }
            update()
            console.log("start")
            simulation.force("x", d3.forceX(width / 2).strength(.2))
                .force("y", d3.forceY(height / 2).strength(.2))
            setTimeout(function () {
                simulation.force("x", d3.forceX(width / 2).strength(.05))
                    .force("y", d3.forceY(height / 2).strength(.05))
            }, 3500);
            console.log("end")

        }
    }

    function dragstarted(d) {
        if (!d3.event.active) simulation.alphaTarget(0.015).restart()
        d.fx = d.x
        d.fy = d.y
    }

    function dragged(d) {
        d.fx = d3.event.x
        d.fy = d3.event.y
    }

    function dragended(d) {
        if (!d3.event.active) simulation.alphaTarget(0.015)
        d.fx = null
        d.fy = null
    }

    function zoomed() {
        svg.attr('transform', d3.event.transform)
    }
