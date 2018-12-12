
/*
d3.text("./result1/naca0012_3blks.msh", function (err, data) {
  if(err) throw err;
  var metadata = readMeshData(data);
  console.log(metadata);
  
});
*/


d3.text("./result1/result_002.rlt", function(error, data) {
  if (error) throw error;
  
  var rltData = readCFDData(data); 

  console.log(rltData);


  var winWidth = parseInt(d3.select('.wb-appFrame-ViewerColumn').style('width'));
  var winHeight = parseInt(d3.select('.wb-appFrame-ViewerColumn').style('height'));

  // set the dimensions and margins of the graph
  const margin = {
      top: 0,
      right: 10,
      bottom: 10,
      left: 10
    },
    width = winWidth - margin.left - margin.right,
    height = winHeight - margin.top - margin.bottom;
  var active = d3.select(null);

  var currentWidth = width;
  var currentHeight = height;

  var svg = d3.select("#canvas").append("svg")
    .attr("id", "mainCanvas")
    .attr("width", winWidth)
    .attr("height", winHeight);

    
  var g = svg.append("g")
  .attr("class", "chart")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  g.append("defs")
    .append("clipPath")
    .attr("id", "clip")
    .append("rect")
    .attr("width", width)
    .attr("height", height);

  var canvasSize = rltData.maxSize * 4;
  var ratioWH = width / height;

  var x = d3.scaleLinear()
    .domain([-canvasSize * ratioWH, canvasSize * ratioWH])
    .range([0, width]);
  var y = d3.scaleLinear()
    .domain([-canvasSize, canvasSize])
    .range([height, 0]);


  var xAxis = d3.axisBottom(x)
    .ticks(width / height * 4) //
    .tickSize(height)
    .tickPadding(8 - height);

  var yAxis = d3.axisRight(y)
    .ticks(4)
    .tickSize(width)
    .tickPadding(8 - width);


  var line = d3.line()
    .x(function(d) {
      return x(d.x);
    })
    .y(function(d) {
      return y(d.y);
    })
  
  var contourPath = g.append("g")
                      .attr("clip-path", "url(#clip)");


  // ino lineeeeeeeee

  // Structured (n * m) grid of data. Point coordinates are (xgrid, ygrid) 
  var n = rltData.x_langth , m = rltData.y_langth;
  var values = (rltData.p);
  var xgrid = (rltData.x);
  var ygrid = (rltData.y);
  
    
  // set x and y scale to maintain 1:1 aspect ratio  
  var domainAspectRatio = (d3.max(ygrid)-d3.min(ygrid))/(d3.max(xgrid)-d3.min(xgrid));
  var rangeAspectRatio = height / width;
    
  // configure a projection to map the contour coordinates returned by
  // d3.contours (px,py) to the input data (xgrid,ygrid)
  var projection = d3.geoTransform({
      point: function(px, py) {
          var xfrac, yfrac, xnow, ynow;
          var xidx, yidx, idx0, idx1, idx2, idx3;
          // remove the 0.5 offset that comes from d3-contour
          px=px-0.5;
          py=py-0.5;
          // clamp to the limits of the xgrid and ygrid arrays (removes "bevelling" from outer perimeter of contours)
          if ( px < 0) { px = 0;} // px < 0 ? px = 0 : px;
          if ( py < 0) { py = 0;} // py < 0 ? py = 0 : py;
          if ( px > (n-1) ) { px = n-1; } // px > (n-1) ? px = n-1 : px;
          if ( py > (m-1) ) { py = m-1; } // py > (m-1) ? py = m-1 : py;
          // xidx and yidx are the array indices of the "bottom left" corner
          // of the cell in which the point (px,py) resides
          xidx = Math.floor(px);
          yidx = Math.floor(py); 
          if ( xidx == (n-1) ) { xidx = n-2; } // xidx == (n-1) ? xidx = n-2 : xidx;
          if ( yidx == (m-1) ) { yidx = m-2; } // yidx == (m-1) ? yidx = m-2 : yidx;
          // xfrac and yfrac give the coordinates, between 0 and 1,
          // of the point within the cell 
          xfrac = px-xidx;
          yfrac = py-yidx;
          // indices of the 4 corners of the cell
          idx0 = xidx + yidx*n;
          idx1 = idx0 + 1;
          idx2 = idx0 + n;
          idx3 = idx2 + 1;
          // bilinear interpolation to find projected coordinates (xnow,ynow)
          // of the current contour coordinate
          xnow = (1-xfrac)*(1-yfrac)*xgrid[idx0] + xfrac*(1-yfrac)*xgrid[idx1] + yfrac*(1-xfrac)*xgrid[idx2] + xfrac*yfrac*xgrid[idx3];
          ynow = (1-xfrac)*(1-yfrac)*ygrid[idx0] + xfrac*(1-yfrac)*ygrid[idx1] + yfrac*(1-xfrac)*ygrid[idx2] + xfrac*yfrac*ygrid[idx3];
          this.stream.point(x(xnow), y(ynow));
      }
  });
    
  // array of threshold values 
  var thresholds = d3.range(d3.min(values),d3.max(values),(d3.max(values)- d3.min(values))/22);
  console.log(thresholds);
  
  // color scale  
  var color = d3.scaleLinear()
      .domain(d3.extent(thresholds))
      .interpolate(function() { return d3.interpolateRdBu; });  
    
  // initialise contours
  var contours = d3.contours()
      .size([n, m])
      .smooth(true)
      .thresholds(thresholds);
    
  // make and project the contours
  contourPath.selectAll("path")
      .data(contours(values))
      .enter().append("path")
      .attr("class", "contour")
          .attr("d", d3.geoPath(projection))
          .attr("fill", function(d) { return color(d.value); });


  var contourAll = svg.selectAll(".contour");


  var gX = g.append("g")
    .attr("class", "axis")
    .call(xAxis);
  var gY = g.append("g")
    .attr("class", "axis")
    .call(yAxis);

  var zoom = d3.zoom()
  .scaleExtent([1, 1000])
  .translateExtent([
    [-100, -100],
    [width + 100, height + 100]
  ])
  .on("zoom", zoomed);

  svg.call(zoom);


  function zoomed() {
    contourAll.attr("transform", d3.event.transform);
    gX.call(xAxis.scale(d3.event.transform.rescaleX(x)));
    gY.call(yAxis.scale(d3.event.transform.rescaleY(y)));
  }

  function resetted() {

    var iMax = [],
      iMin = [],
      jMax = [],
      jMin = [];

    for (var i = 0; i < meshData.mesh.length; i++) {
      iMax.push(meshData.mesh[i].bounds[1][0]);
      iMin.push(meshData.mesh[i].bounds[0][0]);
      jMax.push(meshData.mesh[i].bounds[1][1]);
      jMin.push(meshData.mesh[i].bounds[1][0]);
    }
    var bounds = [];
    bounds[0] = [];
    bounds[1] = [];
    bounds[1][0] = Math.max.apply(null, iMax);
    bounds[0][0] = Math.min.apply(null, iMin);
    bounds[1][1] = Math.max.apply(null, jMax);
    bounds[0][1] = Math.min.apply(null, iMin);

    var dx = bounds[1][0] - bounds[0][0],
      dy = bounds[1][1] - bounds[0][1],
      xx = (bounds[0][0] + bounds[1][0]) / 2,
      yy = (bounds[0][1] + bounds[1][1]) / 2,
      scale = Math.min(0.9 * 2 * canvasSize / dx, 0.9 * 2 * canvasSize / dy),
      translate = [currentWidth / 2 - scale * x(xx), currentHeight / 2 - scale * y(yy)];

    svg.transition()
      .duration(750)
      .call(zoom.transform, d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale));

  }

});




  
