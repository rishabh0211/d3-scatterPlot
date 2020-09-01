import './style.css';
import data from "./data.js";

window.onload = () => {
	var margin = {
		left: 80,
		top: 20,
		right: 50,
		bottom: 100
	};
	var width = 800 - margin.left - margin.right;
	var height = 500 - margin.top - margin.bottom;

	var g = d3.select('#chart-area')
		.append('svg')
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.append("g")
		.attr("transform", "translate(" + margin.left + ", " + margin.top + ")");

	var time = 0;
	var interval;
	var formattedData;
	// Tooltip
	var tip = d3.tip().attr('class', 'd3-tip')
		.html(d => {
			return `<strong>Country:</strong> <span style="color:red">${d.country}</span><br>
			<strong>Continent:</strong> <span style="color:red">${d.continent}</span><br>
			<strong>Life Expectancy:</strong> <span style="color:red">${d3.format(".2f")(d.life_exp)}</span><br>
			<strong>GDP per capita:</strong> <span style="color:red">${d3.format("$,.0f")(d.income)}</span><br>
			<strong>Population:</strong> <span style="color:red">${d3.format(",.0f")(d.population)}</span><br>`;
		});
	g.call(tip);

	// LABELS
	var xAxisLabel = g.append("text")
		.attr("x", width / 2)
		.attr("y", height + 80)
		.attr("font-size", "20px")
		.attr("text-anchor", "middle")
		.text("GDP Per Capita($)");
	var yAxisLabel = g.append("text")
		.attr("x", -(height / 2))
		.attr("y", -60)
		.attr("font-size", "20px")
		.attr("text-anchor", "middle")
		.attr("transform", "rotate(-90)")
		.text("Life expectancy(years)");
	var timeLabel = g.append("text")
		.attr("y", height - 10)
		.attr("x", width - 40)
		.attr("font-size", "40px")
		.attr("opacity", "0.4")
		.attr("text-anchor", "middle")
		.text("1800");

	// SCALES
	var x = d3.scaleLog()
		.base(10)
		.domain([142, 150000])
		.range([0, width]);
	var y = d3.scaleLinear()
		.domain([0, 90])
		.range([height, 0]);
	var area = d3.scaleLinear()
		.domain([2000, 1400000000])
		.range([25 * Math.PI, 1500 * Math.PI]);
	var continentColor = d3.scaleOrdinal(d3.schemePastel1);

	// X Axis
	var xAxisCall = d3.axisBottom(x)
		.tickValues([400, 4000, 40000])
		.tickFormat(d3.format("$"));
	g.append("g")
		.attr("class", "x-axis")
		.attr("transform", "translate(0, " + height + ")")
		.call(xAxisCall);
	// Y Axis
	var yAxisCall = d3.axisLeft(y)
		.tickFormat(d => +d);
	g.append("g")
		.attr("class", "y-axis")
		.call(yAxisCall);

	var continents = ["europe", "asia", "americas", "africa"];
	var legend = g.append("g")
		.attr("transform", `translate(${width-10}, ${height-125})`);

	continents.forEach((continent, i) => {
		var legendRow = legend.append("g")
			.attr("transform", `translate(0, ${i*20})`);
		legendRow.append("rect")
			.attr("height", 10)
			.attr("width", 10)
			.attr("fill", continentColor(continent));

		legendRow.append("text")
			.attr("x", -10)
			.attr("y", 10)
			.attr("text-anchor", "end")
			.style("text-transform", "capitalize")
			.text(continent);
	});

	// Clean data
	formattedData = data.map((year) => {
		return year["countries"].filter(country => country.life_exp && country.income)
	}).map(country => {
		country.income = +country.income;
		country.life_exp = +country.life_exp;
		return country;
	});
	update(formattedData[0]);

	$("#play-button")
		.on("click", function () {
			var button = $(this);
			if (button.text() === "Play") {
				button.text("Pause");
				interval = setInterval(step, 100);
			} else {
				button.text("Play");
				clearInterval(interval);
			}
		});

	$("#reset-button")
		.on("click", function () {
			time = 0;
			update(formattedData[0]);
		});

	$("#continent-select")
		.on("change", () => {
			update(formattedData[time]);
		});

	$("#date-slider").slider({
		max: 2014,
		min: 1800,
		step: 1,
		slide: function (event, ui) {
			time = ui.value - 1800;
			update(formattedData[time]);
		}
	});

	function step() {
		time = (time < 214) ? time + 1 : 0;
		update(formattedData[time]);
	}


	function update(data) {
		// Standard transition time for the visualization
		var t = d3.transition().duration(100);

		var continent = $("#continent-select").val();
		data = data.filter((d) => {
			if (continent === "all") {
				return true;
			} else {
				return d.continent === continent;
			}
		});

		// JOIN new data with old elements.
		var circles = g.selectAll('circle')
			.data(data, (d) => d.country);
		// EXIT old elements not present in new data.
		circles.exit()
			.attr("class", "exit")
			.remove();

		circles.enter()
			.append('circle')
			.attr("class", "enter")
			.attr("fill", (d) => continentColor(d.continent))
			.on("mouseover", tip.show)
			.on("mouseout", tip.hide)
			.merge(circles)
			.transition(t)
			.attr("cx", (d, i) => x(d.income))
			.attr("cy", (d, i) => y(d.life_exp))
			.attr("r", (d) => Math.sqrt(area(d.population) / Math.PI));

		// Update the time label
		timeLabel.text(+(time + 1800));
		$("#year")[0].innerHTML = +(time + 1800);
		$("#date-slider").slider("value", +(time + 1800));
	}
};