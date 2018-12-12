
function readCFDData(data){
  var datas = data.trim().split(/[\s,="']+/);

  var colum_val =[];
  var zone = {};
  var trace = {};
  var r = 0;
  var plotType = '2D';

  if (!datas[0].toLowerCase().match(/^variables/)) {
    
  } else { // plot3D type
    for(var i = 0; i < datas.length; i++) {
      if (datas[i].toLowerCase().match(/^variables/)) {
        var j = 0;
        while(!datas[i+1].toLowerCase().match(/^zone/)){
          i = i + 1;
          //console.log(datas[i])
          var replaced = datas[i].replace(/\W*/g,'').toLowerCase();
          //console.log(replaced)
          if ( replaced ) {
            colum_val[j++] = replaced;
          }
        }
      } else if (datas[i].toLowerCase().match('zone')){
        i=i+1;
        var j = 0;
        var key = "";
        var value = "";
        var i_flag = false, j_flag = false;

        //console.log(datas[i]);
        while ( datas[i].replace(/\W+/g,'').match(/^[a-zA-Z]/) ) {
          var key = datas[i].replace(/\W+/g,'').toLowerCase();
          var value = "";
          while ( ! value ) {
            value = datas[++i].replace(/\W+/g,'').toLowerCase();
          }
          if( key.match(/[i]/)){
            zone[key] = parseInt(value);
            i_flag = true;
          } else if( key.match(/[j]/)){
            zone[key] = parseInt(value);
            j_flag = true;

          } else if ( key.match(/[tf]/)) {
            zone[key] = value;
          }

          i++;
        }
        i--;

        if (i_flag && j_flag ) {
          plotType = '3D';
        } else {
          plotType = '2D';


          for (var p = 0; p < colum_val.length; p++) {
            trace[colum_val[p]] = new Array();
          }
        }
      } else {     //read data
        if (plotType == '2D'){
          for (var p = 0; p < colum_val.length; p++) {
            trace[colum_val[p]][r] = parseFloat(datas[i++]);
          }
          i--;
          r++;
        } else if (plotType == '3D') {
          var rr=0;

          for (var k = 0; k < zone.j; k++) {
            //console.log(k);
            for (var q = 0; q < zone.i; q++) {
              for (var p = 0; p < colum_val.length; p++) {
                if ((k==0) && (q==0) ){            // 객체 원소 생성
                  trace[colum_val[p]] = new Array();
                }
                trace[colum_val[p]][rr] = parseFloat(datas[i++]);
              }
              rr++;
            }
          }
          trace.x_langth = zone.i;
          trace.y_langth = zone.j;

        } else {
          return -1;
        }
      }
    }
    trace.zone = zone;
    trace.varlist = colum_val;
    trace.plotType = plotType;


    var absMaxX = Math.max.apply(null, trace[colum_val[0]].map(Math.abs));
    var absMaxY = Math.max.apply(null, trace[colum_val[1]].map(Math.abs));
    trace.maxSize = Math.max(absMaxX, absMaxY);

//        console.log(trace);

    if (trace.plotType.match('2D')) {

      return trace;

    } else if (trace.plotType.match('3D')) {

      return trace;
    } else {
      return -1;
    }
  }
}

function transpose(array) {
  return array.reduce((prev, next) => next.map((item, i) =>
    (prev[i] || []).concat(next[i])), []);
}

function readMeshData(data) {
  var datas = data.trim().split(/[\s,="']+/);
//  var rank = [];
  var lowDatas = data.split('rank')[0];
  var lowBlockComm = 'block' + data.split('block')[1];
  //  console.log(lowBlockComm);

  for (var i = 0; i < datas.length; i++) {
    if (i == 0) {
      var nGrid = parseInt(datas[i++]);
      var mesh = [];
      var rank = [];
      for (var j = 0; j < nGrid; j++) {
        mesh[j] = {};
        mesh[j].xNum = parseInt(datas[i++]);
        mesh[j].yNum = parseInt(datas[i++]);
        mesh[j].zNum = parseInt(datas[i++]);
      }
      var edgeX = [];
      var edgeY = [];
      var minX = [],
        minY = [],
        maxX = [],
        maxY = [];

      for (var j = 0; j < nGrid; j++) {
        mesh[j].x = [];
        mesh[j].y = [];
        for (var k = 0; k < mesh[j].yNum; k++) {
          mesh[j].x[k] = [];
          for (var q = 0; q < mesh[j].xNum; q++) {
            if (k == 0 || k == mesh[j].yNum - 1 || q == 0 || q == mesh[j].xNum - 1) {
              edgeX.push(parseFloat(datas[i]));
            }
            mesh[j].x[k][q] = parseFloat(datas[i++]);
          }
        }
        for (var k = 0; k < mesh[j].yNum; k++) {
          mesh[j].y[k] = [];
          for (var q = 0; q < mesh[j].xNum; q++) {
            if (k == 0 || k == mesh[j].yNum - 1 || q == 0 || q == mesh[j].xNum - 1) {
              edgeY.push(parseFloat(datas[i]));
            }
            mesh[j].y[k][q] = parseFloat(datas[i++]);
          }
        }
        //skip z-data
        for (var k = 0; k < mesh[j].yNum; k++) {
          for (var q = 0; q < mesh[j].xNum; q++) {
            i++;
          }
        }

        var absMaxX = Math.max.apply(null, edgeX.map(Math.abs));
        var absMaxY = Math.max.apply(null, edgeY.map(Math.abs));

        mesh[j].iLine = [];
        for (var k = 0; k < mesh[j].yNum; k++) {
          //  console.log(mesh[j].x[k]);
          mesh[j].iLine[k] = mesh[j].x[k].map(function(d, jj) {
            return {
              x: d,
              y: mesh[j].y[k][jj]
            };
          });
        }

        mesh[j].jLine = [];

        tranX = transpose(mesh[j].x);
        tranY = transpose(mesh[j].y);

        for (var k = 0; k < mesh[j].xNum; k++) {
          //  console.log(mesh[j].x[k]);
          mesh[j].jLine[k] = tranY[k].map(function(d, jj) {
            return {
              x: tranX[k][jj],
              y: d
            };
          });
        }

        mesh[j].edgeLine = [];
        mesh[j].edgeLine = mesh[j].edgeLine.concat(mesh[j].iLine[0]);
        mesh[j].edgeLine = mesh[j].edgeLine
          .concat(mesh[j].jLine[mesh[j].xNum - 1]);
        mesh[j].edgeLine = mesh[j].edgeLine.concat(mesh[j].iLine[mesh[j].yNum - 1]
          .reverse());
        mesh[j].edgeLine = mesh[j].edgeLine.concat(mesh[j].jLine[0]
          .reverse());

        //        console.log(mesh[j].edgeLine);

        mesh[j].bounds = [];
        mesh[j].bounds[0] = [];
        mesh[j].bounds[1] = [];
        mesh[j].bounds[0][0] = Math.min.apply(Math, mesh[j].edgeLine.map(function(o) {
          return o.x;
        }));
        mesh[j].bounds[1][0] = Math.max.apply(Math, mesh[j].edgeLine.map(function(o) {
          return o.x;
        }));
        mesh[j].bounds[0][1] = Math.min.apply(Math, mesh[j].edgeLine.map(function(o) {
          return o.y;
        }));
        mesh[j].bounds[1][1] = Math.max.apply(Math, mesh[j].edgeLine.map(function(o) {
          return o.y;
        }));

      }
    }
    if (datas[i].toLowerCase().match('rank')) {
      i = i + 1;
      var rank_num = parseInt(datas[i++]);
      //      console.log(rank_num);
      rank[rank_num] = [];
      for (var j = 0; j < 4; j++) {
        var line_num = parseInt(datas[i++]);
        rank[rank_num][j] = [];
        for (var k = 0; k < line_num; k++) {
          rank[rank_num][j][k] = {};

          rank[rank_num][j][k].beginIndex = datas[i++];
          rank[rank_num][j][k].endIndex = datas[i++];
          rank[rank_num][j][k].BCIndex = datas[i++];


          if (rank[rank_num][j][k].BCIndex == '2' || rank[rank_num][j][k].BCIndex == '33' || rank[rank_num][j][k].BCIndex == '34' || rank[rank_num][j][k].BCIndex == '35') {
            rank[rank_num][j][k].additionalValue = [];
            if ((j == 3) && (k == line_num - 1)) {
              rank[rank_num][j][k].additionalValue[0] = datas[i];
            } else {
              rank[rank_num][j][k].additionalValue[0] = datas[i++];
            }
          } else if (rank[rank_num][j][k].BCIndex == '31' || rank[rank_num][j][k].BCIndex == '32' || rank[rank_num][j][k].BCIndex == '36') {
            rank[rank_num][j][k].additionalValue = [];
            if ((j == 3) && (k == line_num - 1)) {
              rank[rank_num][j][k].additionalValue[0] = datas[i++];
              rank[rank_num][j][k].additionalValue[1] = datas[i];
            } else {
              rank[rank_num][j][k].additionalValue[0] = datas[i++];
              rank[rank_num][j][k].additionalValue[0] = datas[i++];
            }
          } else if (rank[rank_num][j][k].BCIndex == "24") {
            rank[rank_num][j][k].additionalValue = [];
            if ((j == 3) && (k == line_num - 1)) {
              rank[rank_num][j][k].additionalValue[0] = datas[i++];
              rank[rank_num][j][k].additionalValue[1] = datas[i++];
              rank[rank_num][j][k].additionalValue[2] = datas[i];
            } else {
              rank[rank_num][j][k].additionalValue[0] = datas[i++];
              rank[rank_num][j][k].additionalValue[1] = datas[i++];
              rank[rank_num][j][k].additionalValue[2] = datas[i++];
            }
          } else {
            if ((j == 3) && (k == line_num - 1)) {
              //  rank[rank_num][j][k].additionalValue[0] = null;
            } else {
              //  rank[rank_num][j][k].additionalValue[0] = null;
              i = i + 1;
            }
          }
        }
      }
    }
  }

  var meshData = {};

  meshData.maxSize = Math.max(absMaxX, absMaxY);

  meshData.nGrid = nGrid;
  meshData.mesh = mesh;
  meshData.rank = rank;

  meshData.lowDatas = lowDatas;
  meshData.lowBlockComm = lowBlockComm;

  return meshData;

}
