
const filearray2 = [ "./result3/sur003.dat"];

const filearray = [ "./result1/result_000.rlt", 
                    "./result1/result_001.rlt", 
                    "./result1/result_002.rlt"];

const filearray3 = [ "./result2/result_000.rlt", 
                    "./result2/result_001.rlt", 
                    "./result2/result_002.rlt", 
                    "./result2/result_003.rlt", 
                    "./result2/result_004.rlt"];

var fileContents = filearray.map( filepath => d3.text(filepath).then( text => text ) );
var chart;
var zoomData;



Promise.all( fileContents ).then( values => {
  var rltDatas = values.map( data => new CFDData(data) );
  chart = new Chart ("#canvas", rltDatas);
  console.log(chart);
  chart.createSelectOption();

});


d3.select(window).on('resize', windowResize);


d3.select("#resetButton")
    .on("click", () => {chart.initView();});

d3.select("#zoom_in").on("click", function() {
  const svg = d3.select("#mainCanvas");
  chart.zoom.scaleBy(svg.transition().duration(500), 2);
});
d3.select("#zoom_out").on("click", function() {
  const svg = d3.select("#mainCanvas");
  chart.zoom.scaleBy(svg.transition().duration(500), 0.5);
});

function onchange(){
  var selectValue = d3.select('#contourSelect').property('value');
  chart.redraw(selectValue);
//  console.log(d3.event.transform);
/*
  var x = chart.x;
  var y = chart.y;
  var xAxis = chart.xAxis;
  var yAxis = chart.yAxis;

  var contourAll = d3.selectAll(".contour"); 

  contourAll.attr("transform", zoomData);
  chart.gX.call(xAxis.scale(zoomData.rescaleX(x)));
  chart.gY.call(yAxis.scale(zoomData.rescaleY(y)));
  */
}

function windowResize() {
  
  var rewinWidth = parseInt(d3.select('.wb-appFrame-ViewerColumn').style('width'));
  var rewinHeight = parseInt(d3.select('.wb-appFrame-ViewerColumn').style('height'));
  const width = chart.width,
        height = chart.height;

  const margin = chart.margin,
        canvasSize = chart.canvasSize, ratioWH = chart.ratioWH;

  var zoom = chart.zoom;
  const svg = d3.select("#mainCanvas"); 

  var rewidth = rewinWidth - margin.left - margin.right,
      reheight = rewinHeight - margin.top - margin.bottom;

  var diffWidth = (rewidth - width) / width;
  var diffHeight = (reheight - height) / height;

  var xCanvasSize = canvasSize * ratioWH + 2*canvasSize * ratioWH *  diffWidth;
  var yCanvasSize = canvasSize + 2*canvasSize*diffHeight;

  chart.x.domain([-canvasSize * ratioWH, xCanvasSize])
    .range([0, rewidth]);
  chart.y.domain([-yCanvasSize, canvasSize])
    .range([reheight, 0]);

  svg.attr("width", rewinWidth);
  svg.attr("height", rewinHeight);

  chart.plot.attr("width", rewidth)
            .attr("height", reheight);

  chart.plot.select("rect")
    .attr("width", rewidth)
    .attr("height", reheight);

  chart.xAxis.ticks(rewidth / reheight * 4) //
    .tickSize(reheight)
    .tickPadding(8 - reheight);

  chart.yAxis.tickSize(rewidth)
    .tickPadding(8 - rewidth);

  svg.transition();
  zoom.translateExtent([
    [-100, -100],
    [rewidth + 100, reheight + 100]
  ]);

  zoom.scaleBy(svg.transition(), 1);

  //currentWidth = rewidth;
  //currentHeight = reheight;
}

