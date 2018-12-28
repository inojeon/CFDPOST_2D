class Chart {
  constructor(canvas, rltDatas){
    this.canvas = canvas;
    this.rltDatas = rltDatas;
    this.getThresholds();
    this.draw();
  }
  getThresholds (){
    const min = this.rltDatas.map(d => d3.min(d.p) );
    const max = this.rltDatas.map(d => d3.max(d.p) );

    this.thresholds = d3.range( d3.min(min), d3.max(max), (d3.max(max) - d3.min(min))/22) ;
  }
  draw(){
    this.winWidth = parseInt(d3.select(this.canvas).style('width'));
    this.winHeight = parseInt(d3.select(this.canvas).style('height'));

    // set the dimensions and margins of the graph
    const margin = {
      top: 0,
      right: 10,
      bottom: 10,
      left: 10
    },
    width = this.winWidth - margin.left - margin.right,
    height = this.winHeight - margin.top - margin.bottom;

    const svg = d3.select(this.canvas).append("svg")
      .attr("id", "mainCanvas")
      .attr("width", this.winWidth)
      .attr("height", this.winHeight);

    const g = svg.append("g")
      .attr("class", "chart")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    
    g.append("defs")
      .append("clipPath")
      .attr("id", "clip")
      .append("rect")
      .attr("width", width)
      .attr("height", height);
    
    this.maxSize = d3.max(this.rltDatas.map( d => d.maxSize));

    const canvasSize = this.maxSize * 4;
    const ratioWH = width / height;

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
    

    for (let rltData of this.rltDatas ) {

      var contourPath = g.append("g")
         .attr("clip-path", "url(#clip)");

      // Structured (n * m) grid of data. Point coordinates are (xgrid, ygrid) 
      var n = rltData.x_langth , m = rltData.y_langth;
      var values = (rltData.p);
      var xgrid = (rltData.x);
      var ygrid = (rltData.y);

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
     // var thresholds = [0.5605645972834632, 0.5765077054217598, 0.5924508135600565, 0.608393921698353, 0.6243370298366496, 0.6402801379749462, 0.6562232461132429, 0.6721663542515395, 0.6881094623898361, 0.7040525705281326, 0.7199956786664293, 0.7359387868047259, 0.7518818949430226, 0.7678250030813192, 0.7837681112196158, 0.7997112193579123, 0.8156543274962089, 0.8315974356345056, 0.8475405437728022, 0.8634836519110989, 0.8794267600493955, 0.895369868187692];
      var thresholds = this.thresholds;
     //     var thresholds = d3.range(d3.min(values),d3.max(values),(d3.max(values) - d3.min(values))/22);
 //       console.log(thresholds);

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

    } //for (let rltData of rltDatas ) 

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
  }
}


const filearray = [ "./result1/result_000.rlt", 
                    "./result1/result_001.rlt", 
                    "./result1/result_002.rlt"];

const filearray2 = [ "./result2/result_000.rlt", 
                    "./result2/result_001.rlt", 
                    "./result2/result_002.rlt", 
                    "./result2/result_003.rlt", 
                    "./result2/result_004.rlt"];

var fileContents = filearray.map( filepath => d3.text(filepath).then( text => text ) );

Promise.all( fileContents ).then( values => {
  var rltDatas = values.map( data => new CFDData(data) );
  var chart = new Chart ("#canvas", rltDatas);

});
