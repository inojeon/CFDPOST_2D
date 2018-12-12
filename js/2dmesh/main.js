

d3.text("./result1/naca0012_3blks.msh", function (err, data) {
  if(err) throw err;
  var metadata = readMeshData(data);
  console.log(metadata);
  
});








/*
d3.text("./result1/result_002.rlt", function(error, data) {
  if (error) throw error;
  
  var result = readCFDData(data); 


  // Structured (n * m) grid of data. Point coordinates are (xgrid, ygrid) 
  var n = result.x_langth , m = result.y_langth;
  var values = (result.p);
  var xgrid = (result.x);
  var ygrid = (result.y);
  
  var svg = d3.select("svg"),
      width = +svg.attr("width"),
      height = +svg.attr("height");
    
  // set x and y scale to maintain 1:1 aspect ratio  
  var domainAspectRatio = (d3.max(ygrid)-d3.min(ygrid))/(d3.max(xgrid)-d3.min(xgrid));
  var rangeAspectRatio = height / width;


  
    
  if (rangeAspectRatio > domainAspectRatio) {
      var xscale = d3.scaleLinear()
          .domain(d3.extent(xgrid))
          .range([0,width]);
      var yscale = d3.scaleLinear()
          .domain(d3.extent(ygrid))
          .range([domainAspectRatio*width,0]);
  } else {
      var xscale = d3.scaleLinear()
          .domain(d3.extent(xgrid))
          .range([0,height/domainAspectRatio]);
      var yscale = d3.scaleLinear()
          .domain(d3.extent(ygrid))
          .range([height,0]);
  }
    
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
          this.stream.point(xscale(xnow), yscale(ynow));
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
  
  console.log(contours);
  
  // make and project the contours
  svg.selectAll("path")
      .data(contours(values))
      .enter().append("path")
          .attr("d", d3.geoPath(projection))
          .attr("fill", function(d) { return color(d.value); });
});
*/



  
