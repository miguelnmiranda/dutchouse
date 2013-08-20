// (It's CSV, but GitHub Pages only gzip's JSON at the moment.)
d3.csv("data.json", function(answers) {

  // Various formatters.
  var formatNumber = d3.format(",d");
	  /*formatBuy = d3.format("d"),
      formatSoldOut = d3.format("d"),
      formatExtra = d3.time.format("d"),
      formatAge = d3.time.format("d");*/

  // A nest operator, for grouping the answer list.
  var nestByAge = d3.nest()
      .key(function(d) { return d.age; });

  // A little coercion, since the CSV is untyped.
  answers.forEach(function(d, i) {
    d.index = i;
    d.buy = +d.buy;
	d.soldout = +d.soldout;
	d.extra = +d.extra;
	d.gender = +d.gender;
	d.age = +d.age;
	d.dataset = +d.dataset;
  });

  // Create the crossfilter for the relevant dimensions and groups.
  var answer = crossfilter(answers),
      all = answer.groupAll(),
      buy = answer.dimension(function(d) { return d.buy; }),
      buys = buy.group(),
      soldout = answer.dimension(function(d) { return d.soldout; }),
      soldouts = soldout.group(),
      extra = answer.dimension(function(d) { return d.extra; }),
      extras = extra.group(),
	  gender = answer.dimension(function(d) { return d.gender; }),
      genders = gender.group(),
      age = answer.dimension(function(d) { return d.age; }),
      ages = age.group(),
	  data = answer.dimension(function(d) { return d.dataset; }),
      datas = data.group();

  function ticket(v) {
	if(v == 1) return "y";
	else if(v == 0) return "n";
	else return v;
  }
  
  function tgender(v) {
	if(v == 1) return "f";
	else if(v == 0) return "m";
	else return v;
  }
  
  function tdata(v) {
	if(v == 1) return "B";
	else if(v == 0) return "A";
	else return v;
  }

  var charts = [
    barChart()
        .dimension(buy)
        .group(buys)
		.round(Math.round)
		.axis(d3.svg.axis().orient("bottom").ticks(2).tickFormat(ticket))
		.centerTicks(true)
      .x(d3.scale.linear()
        .domain([0, 1.99])
        .rangeRound([0, 10 * 2])),

    barChart()
        .dimension(soldout)
        .group(soldouts)
		.round(Math.round)
		.axis(d3.svg.axis().orient("bottom").ticks(2).tickFormat(ticket))
		.centerTicks(true)
      .x(d3.scale.linear()
        .domain([0, 1.99])
        .rangeRound([0, 10 * 2])),

    barChart()
        .dimension(extra)
        .group(extras)
		.round(Math.round)
		.axis(d3.svg.axis().orient("bottom").ticks(2).tickFormat(ticket))
		.centerTicks(true)
      .x(d3.scale.linear()
        .domain([0, 1.99])
        .rangeRound([0, 10 * 2])),
	
	barChart()
        .dimension(data)
        .group(datas)
		.round(Math.round)
		.axis(d3.svg.axis().orient("bottom").ticks(2).tickFormat(tdata))
		.centerTicks(true)
      .x(d3.scale.linear()
        .domain([0, 1.99])
        .rangeRound([0, 10 * 2])),
	
	barChart()
        .dimension(gender)
        .group(genders)
		.round(Math.round)
		.axis(d3.svg.axis().orient("bottom").ticks(2).tickFormat(tgender))
		.centerTicks(true)
      .x(d3.scale.linear()
        .domain([0, 1.99])
        .rangeRound([0, 10 * 2])),

    barChart()
        .dimension(age)
        .group(ages)
		.round(Math.round)
      .x(d3.scale.linear()
        .domain([15, 65])
        .rangeRound([0, 10 * 50])),
  ];

  // Given our array of charts, which we assume are in the same order as the
  // .chart elements in the DOM, bind the charts to the DOM and render them.
  // We also listen to the chart's brush events to update the display.
  var chart = d3.selectAll(".chart")
      .data(charts)
      .each(function(chart) { chart.on("brush", renderAll).on("brushend", renderAll); });

  // Render the total.
  d3.selectAll("#total")
      .text(formatNumber(answer.size()));

  renderAll();

  // Renders the specified chart or list.
  function render(method) {
    d3.select(this).call(method);
  }

  // Whenever the brush moves, re-rendering everything.
  function renderAll() {
    chart.each(render);
    d3.select("#active").text(formatNumber(all.value()));
	d3.select("#perc").text(formatNumber(Math.round((all.value()*100)/answer.size())));
  }

  window.filter = function(filters) {
    filters.forEach(function(d, i) { charts[i].filter(d); });
    renderAll();
  };

  window.reset = function(i) {
    charts[i].filter(null);
    renderAll();
  };
});
