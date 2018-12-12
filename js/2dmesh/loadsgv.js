
var selectedBC = 0;

makeSVG = function(meshData) {
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
//    .call(responsivefy);

  var menu = d3.select("#menu");
  var rank = d3.select("#rank");

  var g = svg.append("g")
    .attr("class", "chart")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  g.append("defs")
    .append("clipPath")
    .attr("id", "clip")
    .append("rect")
    .attr("width", width)
    .attr("height", height);

  var canvasSize = meshData.maxSize * 4;
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


  var gX = g.append("g")
    .attr("class", "axis")
    .call(xAxis);
  var gY = g.append("g")
    .attr("class", "axis")
    .call(yAxis);

  var line = d3.line()
    .x(function(d) {
      return x(d.x);
    })
    .y(function(d) {
      return y(d.y);
    })


  var gLine = [];
  var gEdgh = [];
  var gText = [];
  var gBC = [];

  var rankCount = 0;

  var bcDatasAll = [];

  function compareLine(array){
    var compareSet = {};
    for (var i = 0; i < array.length; i++) {
      var originLength = array[i].length;
      for (var j = 0; j < i; j++) {
        if (array[j].length == originLength) {
          var checkCount = Math.floor(originLength/10);
          var count = 0;
          for (var k = 0; k < checkCount; k++) {
            var randomVal = Math.floor(Math.random() * array[i].length);
            if( Math.abs(array[j][randomVal].x - array[i][randomVal].x) < 1e-10 ) {
              if( Math.abs(array[j][randomVal].y - array[i][randomVal].y) < 1e-10 ) {
                count = count +1;
              }
            }
          }
          if (count == checkCount) {
            compareSet[i] = j;  compareSet[j] = i;
          }
        }
      }
    }
//    console.log(compareSet);
    return compareSet;
  }


  for (var j = 0; j < meshData.mesh.length; j++) {
    menu.append("div").attr("id", 'Grid' + j.toString());
    menu.select("#Grid" + j.toString())
      .append("h4").text('Grid' + j.toString());



    gLine[j] = g.append("g")
      .attr("id", "mesh" + j.toString())
      .attr("clip-path", "url(#clip)");

    for (var i = 0; i < meshData.mesh[j].iLine.length; i++) {
      gLine[j].append("path")
        .datum(meshData.mesh[j].iLine[i])
        .attr("class", "line " + "line" + j.toString())
        .attr("d", line);
    };
    for (var i = 0; i < meshData.mesh[j].jLine.length; i++) {
      gLine[j].append("path")
        .datum(meshData.mesh[j].jLine[i])
        .attr("class", "line " + "line" + j.toString())
        .attr("d", line);
    };


    gBC[j] = g.append("g")
      .attr("id", "bc" + j.toString())
      .attr("class", "bcGroup")
      .attr("clip-path", "url(#clip)");


    for (var k = 0; k < meshData.rank[j].length; k++) {
      for (var q = 0; q < meshData.rank[j][k].length; q++) {
        var rankTemp = meshData.rank[j][k][q],
          begin = parseInt(rankTemp.beginIndex),
          end = parseInt(rankTemp.endIndex),
          bcIndex = parseInt(rankTemp.BCIndex),
          bcDatas = [];
        if (k == 0) {
          bcDatas = meshData.mesh[j].jLine[0].slice(begin - 1, end + 1);
        } else if (k == 1) {
          bcDatas = meshData.mesh[j].jLine[meshData.mesh[j].jLine.length - 1].slice(begin - 1, end + 1);
        } else if (k == 2) {
          bcDatas = meshData.mesh[j].iLine[0].slice(begin - 1, end + 1);
        } else if (k == 3) {
          bcDatas = meshData.mesh[j].iLine[meshData.mesh[j].iLine.length - 1].slice(begin - 1, end + 1);
        }
        if (bcDatas[0].x > bcDatas[bcDatas.length - 1].x) {
          bcDatas = bcDatas.reverse();
        } else if (bcDatas[0].x == bcDatas[bcDatas.length - 1].x) {
          if (bcDatas[0].y < bcDatas[bcDatas.length - 1].y) {
            bcDatas = bcDatas.reverse();
          }
        }
        BCArrayList[rankCount] = rankTemp;
        BCArrayList[rankCount].gridIndex = j;
        BCArrayList[rankCount].lineIndex = k;
        BCArrayList[rankCount].bcNum = q;
        bcDatasAll[rankCount] = bcDatas;

        gBC[j].append("defs").append("path")
          .datum(bcDatas)
          .attr("id", "textPath" + rankCount.toString())
          .attr("class", "bc")
          .attr("d", line);

        gBC[j].append("path")
          .datum(bcDatas)
          .attr("class", "bc bcline " + "bcGrid" + j.toString() + " bc" + rankTemp.BCIndex + " bcNum" + rankCount.toString())
          .attr("d", line);

        gBC[j].append("text")
          .attr("dy", -5).append("textPath")
          .attr("xlink:href", "#textPath" + rankCount.toString())
          .attr("id", "bcText" + rankCount.toString())
          .style("text-anchor", "middle")
          .attr("startOffset", "50%")
          .attr("class", "bcText bcText" + j.toString() + " displayOff ")
          .text(BCdict[bcIndex]);

        gBC[j].append("path")
          .datum(bcDatas)
          .attr("class", "bc bcTransParent " + "bcTransParent" + j.toString() + " bcTPNum" + rankCount.toString())
          .attr("d", line);

        rankCount++;
      };
    };

    gLine[j].append("path")
      .datum(meshData.mesh[j].edgeLine)
      .attr("class", "edgh " + "edgh" + j.toString())
      .attr("id", "edgh" + j.toString())
      .attr("d", line);

  }
  var compareLineList = compareLine(bcDatasAll);

  d3.select("#editBCPanelDelete").on("click", function() {
    d3.select('#editBCPanel').classed("displayOff", true);
  });

  svg.selectAll(".edgh")
    .on("mouseover", function(d, i) {
      d3.selectAll(".line" + i.toString()).style("stroke", "red");
    })
    .on("click", function(d, i) {
      clicked(d, i);
    })
    .on("mouseout", function(d, i) {
      d3.selectAll(".line" + i.toString()).style("stroke", "black");
    });

  if ( !(document.getElementById('lineTooltip')) ) {
    var tooltipDiv = d3.select("body").append("div")
        .attr("id", "lineTooltip")
        .attr("class", "lineTooltip")
        .style("display", "none");
  } else {
    var tooltipDiv = d3.select("#lineTooltip");
  }


  function tooltipMouseover() {
    tooltipDiv.style("display", "inline");
  }

  function tooltipMousemove(d, i) {
    tooltipDiv.text(BCdict[BCArrayList[i].BCIndex])
        .style("left", (d3.event.pageX ) + "px")
        .style("top", (d3.event.pageY ) + "px");
  }

  function tooltipMouseout() {
    tooltipDiv.style("display", "none");
  }


  svg.selectAll(".bcTransParent")
    .on("mouseover", function(d, i) {
      d3.select(".bcNum" + i.toString())
        .classed("bcTransParentSelect", true);
      d3.select("#bcText" + i.toString()).classed("displayOff", false);
      tooltipMouseover()
    })
    .on("click", function(d,i) {
      changeBCsettingPanel(d, i);
      tooltipMouseout();
    })
    .on("mousemove", function(d,i){
      tooltipMousemove(d, i);
    })
    .on("mouseout", function(d, i) {
      d3.select(".bcNum" + i.toString())
        .classed('bcTransParentSelect', false);
      if (!(viewClassCheck("#bcTitleButton"))) {
        d3.select("#bcText" + i.toString())
          .classed("displayOff", true);
      }
      tooltipMouseout()
    });

  var linesAll = svg.selectAll(".line");
  var bcAll = svg.selectAll(".bc");
  var bcTextAll = svg.selectAll(".bcText");
  var edghAll = svg.selectAll(".edgh");



  d3.select("#resetButton")
    .on("click", resetted);

  d3.select("#bcButton")
    .on("click", bcView);
  d3.select("#bcTitleButton")
    .on("click", bcTitleView);
  d3.select("#meshButton")
    .on("click", meshView);
  d3.select("#zoom_in").on("click", function() {
    zoom.scaleBy(svg.transition().duration(500), 2);
  });
  d3.select("#zoom_out").on("click", function() {
    zoom.scaleBy(svg.transition().duration(500), 0.5);
  });


  d3.select("#exportButton").on("click", function() {
    var rank = meshData.rank;
    var lowRank = '';
    //    console.log(rank[0]);
    for (var i = 0; i < rank.length; i++) {
      lowRank = lowRank.concat('rank ' + i.toString(), '\n');
      for (var j = 0; j < rank[i].length; j++) {
        lowRank = lowRank.concat(rank[i][j].length, '\n');

        for (var k = 0; k < rank[i][j].length; k++) {
          var bcline = rank[i][j][k];
          lowRank = lowRank.concat(bcline.beginIndex, " ", bcline.endIndex, " ", bcline.BCIndex, " ");
          if (typeof bcline.additionalValue !== 'undefined') {
            for (var q = 0; q < bcline.additionalValue.length; q++) {
              lowRank = lowRank.concat(bcline.additionalValue[q], " ");
            }
            lowRank = lowRank.concat("\n");
          } else {
            lowRank = lowRank.concat("0.0 \n");
          }
        }
      }
    }
    lowRank = meshData.lowDatas.concat(lowRank, meshData.lowBlockComm);

    download('test.msh', lowRank);

  });

  function download(filename, text) {
    var pom = document.getElementById('exportButton');
    pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    pom.setAttribute('download', filename);
  }

  var textFile = null;
  makeTextFile = function(text) {
    var data = new Blob([text], {
      type: 'text/plain'
    });
    // If we are replacing a previously generated file we need to
    // manually revoke the object URL to avoid memory leaks.
    if (textFile !== null) {
      window.URL.revokeObjectURL(textFile);
    }
    textFile = window.URL.createObjectURL(data);
    return textFile;
  };

  function viewClassCheck(className, state){
    if (className == "#bcButton") {
      if (typeof state !== 'undefined') {
        d3.select(className).classed("is-primary", state);
        bcAll.classed("displayOff", !state);
      }
      return d3.select(className).classed("is-primary") ? true : false ;
    } else if (className == "#bcTitleButton") {
      if (typeof state !== 'undefined') {
        if (!(viewClassCheck("#bcButton"))) {
          viewClassCheck("#bcButton", true);
        }
        d3.select(className).classed("is-primary", state);
        bcTextAll.classed("displayOff", !state);
      }
      return d3.select(className).classed("is-primary") ? true : false ;
    } else if (className == "#meshButton") {
      if (typeof state !== 'undefined') {
        d3.select(className).classed("is-link", state);
        linesAll.classed("displayOff", !state);
      }
      return d3.select(className).classed("is-link") ? true : false ;
    }
  };

  function bcView() {
    if (viewClassCheck("#bcButton")) {
      if (viewClassCheck("#bcTitleButton")) {
//        viewClassCheck("#bcTitleButton", false);
        bcTitleView();
      }
      viewClassCheck("#bcButton", false);
      if (!viewClassCheck("#meshButton")) {
        meshView();
      }
    } else {
      viewClassCheck("#bcButton", true);
    }
  }

  function bcTitleView() {
    if (viewClassCheck("#bcTitleButton")) {
      viewClassCheck("#bcTitleButton", false);
    } else {
      viewClassCheck("#bcTitleButton", true);
    }
  }

  function meshView() {
    if (viewClassCheck("#meshButton")) {
      viewClassCheck("#meshButton", false);
      if (!viewClassCheck("#bcButton")) {
        bcView();
      }
    } else {
      viewClassCheck("#meshButton", true);
    }
  }
  //chart

  var zoom = d3.zoom()
    .scaleExtent([1, 1000])
    .translateExtent([
      [-100, -100],
      [width + 100, height + 100]
    ])
    .on("zoom", zoomed);

  svg.call(zoom);

  d3.select('#BCsettingSelect').on("change", function() {
    const selValue = d3.select('#BCsettingSelect').property('value');
    if (typeof BCAddValue[selValue.toString()] === 'undefined') {
      for (var i = 1; i < 4; i++) {
        d3.select('#additionalValueView' + i.toString()).classed("displayOff", true);
      }
    } else {
      const lengthAddValue = BCAddValue[selValue.toString()].length;
      for (var i = 1; i < 4; i++) {
        if (i > lengthAddValue) {
          d3.select('#additionalValueView' + i.toString()).classed("displayOff", true);
        } else {
          d3.select('#additionalValueView' + i.toString()).classed("displayOff", false);
          document.getElementById("additionalValueTitle" + i.toString()).innerHTML = BCAddValue[selValue.toString()][i - 1];
          document.getElementById("additionalValueInput" + i.toString()).value = 0;
        }
      }
    }
  });

  d3.select("#saveBC").on("click", function() {
    var sel = document.getElementById('BCsettingSelect');
    var selValue = sel.options[sel.selectedIndex].value;

    if (selValue != BCArrayList[selectedBC].BCIndex) {
//      console.log(".bcNum" + selectedBC.toString());
      d3.select(".bcNum" + selectedBC.toString())
        .classed("bc" + BCArrayList[selectedBC].BCIndex, false);
      d3.select(".bcNum" + selectedBC.toString())
        .classed("bc" + selValue, true);

      d3.select("#bcText" + selectedBC.toString())
        .text(BCdict[Number(selValue)]);

      // BCIndex index change
      BCArrayList[selectedBC].BCIndex = selValue.toString();

      if (typeof BCAddValue[selValue.toString()] !== 'undefined') {
        if (typeof BCArrayList[selectedBC].additionalValue !== 'undefined') {
          //delete array and add new data
          delete BCArrayList[selectedBC].additionalValue;
        }
        if (BCAddValue[selValue.toString()].length == 1) {
          BCArrayList[selectedBC].additionalValue = [];
          BCArrayList[selectedBC].additionalValue[0] = document.getElementById("additionalValueInput1").value;
          // additionalValue.length == 2
        } else if (BCAddValue[selValue.toString()].length == 2) {
          BCArrayList[selectedBC].additionalValue = [];
          BCArrayList[selectedBC].additionalValue[0] = document.getElementById("additionalValueInput1").value;
          BCArrayList[selectedBC].additionalValue[1] = document.getElementById("additionalValueInput2").value;

          // additionalValue.length == 3
        } else if (BCAddValue[selValue.toString()].length == 3) {
          BCArrayList[selectedBC].additionalValue = [];
          BCArrayList[selectedBC].additionalValue[0] = document.getElementById("additionalValueInput1").value;
          BCArrayList[selectedBC].additionalValue[1] = document.getElementById("additionalValueInput2").value;
          BCArrayList[selectedBC].additionalValue[2] = document.getElementById("additionalValueInput3").value;
        }
      } else {
        delete BCArrayList[selectedBC].additionalValue;
      }
      //BC num 은 동일하고 안에 additionalValue 값이 변경되는 경우
    } else {
      if (typeof BCAddValue[selValue.toString()] !== 'undefined') {
        for (var i = 0; i < BCArrayList[selectedBC].additionalValue.length; i++) {
          ii = i + 1;
          BCArrayList[selectedBC].additionalValue[i] = document.getElementById("additionalValueInput" + ii.toString()).value;
        }
      }
    }

    if (typeof compareLineList[selectedBC] !== 'undefined') {

      d3.select(".bcNum" + compareLineList[selectedBC].toString())
        .classed("bc" + BCArrayList[compareLineList[selectedBC]].BCIndex, false);

      BCArrayList[compareLineList[selectedBC]].BCIndex = BCArrayList[selectedBC].BCIndex;
      delete BCArrayList[compareLineList[selectedBC]].additionalValue;
      if (typeof BCArrayList[selectedBC].additionalValue !== 'undefined') {
          BCArrayList[compareLineList[selectedBC]].additionalValue = BCArrayList[selectedBC].additionalValue;
      }

      d3.select(".bcNum" + compareLineList[selectedBC].toString())
        .classed("bc" + BCArrayList[compareLineList[selectedBC]].BCIndex, true);
    }
    d3.select('#editBCPanel').classed('displayOff', true);


    d3.select("#mesh_save").attr("disabled",null);
  });

  function changeBCsettingPanel(d, i) {
    const ijIndex = ['iMin', 'iMax', 'jMin', 'jMax'];
    const bcArray = BCArrayList[i];

    selectedBC =i;

    var title = 'Grid';

    title = title.concat(bcArray.gridIndex.toString(), ' > ', ijIndex[bcArray.lineIndex], ' > ', bcArray.bcNum.toString(), ' orders');

    if (typeof compareLineList[i] === 'undefined') {
      d3.select('#BCsettingTilteSub').classed("displayOff", true);
    } else {
      const bcArraySub = BCArrayList[compareLineList[i]];
      var titleSub = 'Grid';

      d3.select('#BCsettingTilteSub').classed("displayOff", false);
//      console.log(compareLineList[i]);
      titleSub = titleSub.concat(bcArraySub.gridIndex.toString(), ' > ', ijIndex[bcArraySub.lineIndex], ' > ', bcArraySub.bcNum.toString(), ' orders');
      document.getElementById("BCsettingTilteSub").innerHTML = titleSub;

    }


    var listNum = parseInt(bcArray.BCIndex);
    document.getElementById("BCsettingTilte").innerHTML = title;
    document.getElementById("BCsettingSelect").value = listNum;

    d3.select('#editBCPanel').classed("displayOff", false);

    if (typeof bcArray.additionalValue === 'undefined') {
      for (var j = 0; j < 3; j++) {
        jj = j + 1;
        d3.select("#additionalValueView" + jj.toString()).classed("displayOff", true);
      }
    } else {
      for (var j = 0; j < bcArray.additionalValue.length; j++) {
        jj = j + 1;
        d3.select("#additionalValueView" + jj.toString()).classed("displayOff", false);
        document.getElementById("additionalValueTitle" + jj.toString()).innerHTML = BCAddValue[bcArray.BCIndex][j];
        document.getElementById("additionalValueInput" + jj.toString()).value = bcArray.additionalValue[j];
      }
      for (var j = bcArray.additionalValue.length; j < 3; j++) {
        jj = j + 1;
        d3.select("#additionalValueView" + jj.toString()).classed("displayOff", true);
      }
    }
  } // function end


  function startView() {

    if (active.node() === this) return reset();
    active.classed("active", false);

    var iMax = [],
      iMin = [],
      jMax = [],
      jMin = [];

    for (var i = 0; i < meshData.mesh.length; i++) {
      iMax.push(meshData.mesh[i].bounds[1][0]);
      iMin.push(meshData.mesh[i].bounds[0][0]);
      jMax.push(meshData.mesh[i].bounds[1][1]);
      jMin.push(meshData.mesh[i].bounds[0][1]);
    }
    var bounds = [];
    bounds[0] = [];
    bounds[1] = [];
    bounds[1][0] = Math.max.apply(null, iMax);
    bounds[0][0] = Math.min.apply(null, iMin);
    bounds[1][1] = Math.max.apply(null, jMax);
    bounds[0][1] = Math.min.apply(null, jMin);
    //      console.log(bounds);

    const dx = bounds[1][0] - bounds[0][0],
      dy = bounds[1][1] - bounds[0][1],
      xx = (bounds[0][0] + bounds[1][0]) / 2,
      yy = (bounds[0][1] + bounds[1][1]) / 2,
      scale = Math.min(0.9 * 2 * canvasSize / dx, 0.9 * 2 * canvasSize / dy),
      translate = [width / 2 - scale * x(xx), height / 2 - scale * y(yy)];

    svg.transition()
  //    .duration(750)
      .call(zoom.transform, d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale));
  }

  function clicked(d, i) {
    if (active.node() === this) return reset();
    active.classed("active", false);
    active = d3.select("#edgh" + i.toString())
      .classed("active", true);
    const bounds = meshData.mesh[i].bounds,
      dx = bounds[1][0] - bounds[0][0],
      dy = bounds[1][1] - bounds[0][1],
      xx = (bounds[0][0] + bounds[1][0]) / 2,
      yy = (bounds[0][1] + bounds[1][1]) / 2,
      scale = Math.min(0.9 * 2 * canvasSize / dx, 0.9 * 2 * canvasSize / dy),
      translate = [currentWidth / 2 - scale * x(xx), currentHeight / 2 - scale * y(yy)];

    svg.transition()
      .duration(750)
      .call(zoom.transform, d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale));
  }

  function zoomed() {
    linesAll.attr("transform", d3.event.transform);
    bcAll.attr("transform", d3.event.transform);
    edghAll.attr("transform", d3.event.transform);
    bcTextAll.attr("transform", d3.event.transform);
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

  d3.select(window).on('resize', function() {
    var rewinWidth = parseInt(d3.select('.wb-appFrame-ViewerColumn').style('width'));
    var rewinHeight = parseInt(d3.select('.wb-appFrame-ViewerColumn').style('height'));

    var rewidth = rewinWidth - margin.left - margin.right,
    reheight = rewinHeight - margin.top - margin.bottom;

    var diffWidth = (rewidth - width) / width;
    var diffHeight = (reheight - height) / height;

    var xCanvasSize = canvasSize * ratioWH + 2*canvasSize * ratioWH *  diffWidth;
    var yCanvasSize = canvasSize + 2*canvasSize*diffHeight;

    x.domain([-canvasSize * ratioWH, xCanvasSize])
      .range([0, rewidth]);
    y.domain([-yCanvasSize, canvasSize])
      .range([reheight, 0]);

    svg.attr("width", rewinWidth);
    svg.attr("height", rewinHeight);

    g.attr("width", rewidth)
      .attr("height", reheight);

    g.select("rect").attr("width", rewidth)
      .attr("height", reheight);

    xAxis.ticks(rewidth / reheight * 4) //
      .tickSize(reheight)
      .tickPadding(8 - reheight);

    yAxis.tickSize(rewidth)
      .tickPadding(8 - rewidth);

    svg.transition();
    zoom.translateExtent([
      [-100, -100],
      [rewidth + 100, reheight + 100]
    ]);

    zoom.scaleBy(svg.transition(), 1);

    currentWidth = rewidth;
    currentHeight = reheight;

  });


  startView();
};
