class CFDData {
  constructor(rawData) {
    this.readCFDData(rawData)
  }
  readCFDData(rawData) {
    const datas = rawData.trim().split(/[\s,="']+/);
    let colum_val =[];
    let zone = {};
    let r = 0;
    let plotType = '2D';

    if (!datas[0].toLowerCase().match(/^variables/)) {
      // Not plot3D type
      return -1;    
    } else { // plot3D type
      for(let i = 0; i < datas.length; i++) {
        if (datas[i].toLowerCase().match(/^variables/)) {
          let j = 0;
          while(!datas[i+1].toLowerCase().match(/^zone/)){
            i = i + 1;
            //console.log(datas[i])
            let replaced = datas[i].replace(/\W*/g,'').toLowerCase();
            //console.log(replaced)
            if ( replaced ) {
              colum_val[j++] = replaced;
            }
          }
        } else if (datas[i].toLowerCase().match('zone')){
          i=i+1;
          let i_flag = false, j_flag = false;
  
          //console.log(datas[i]);
          while ( datas[i].replace(/\W+/g,'').match(/^[a-zA-Z]/) ) {
            let key = datas[i].replace(/\W+/g,'').toLowerCase();
            let value = "";
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
            for (let p = 0; p < colum_val.length; p++) {
              this[colum_val[p]] = new Array();
            }
          }
        } else {     //read data
          if (plotType == '2D'){
            for (let p = 0; p < colum_val.length; p++) {
              this[colum_val[p]][r] = parseFloat(datas[i++]);
            }
            i--;  r++;
          } else if (plotType == '3D') {
            let rr=0;
  
            for (let k = 0; k < zone.j; k++) {
              //console.log(k);
              for (let q = 0; q < zone.i; q++) {
                for (let p = 0; p < colum_val.length; p++) {
                  if ((k==0) && (q==0) ){            // 객체 원소 생성
                    this[colum_val[p]] = new Array();
                  }
                  this[colum_val[p]][rr] = parseFloat(datas[i++]);
                }
                rr++;
              }
            }
            this.x_langth = zone.i;
            this.y_langth = zone.j;
  
          } else {
            return -1;
          }
        }
      }

      this.zone = zone;
      this.varlist = colum_val;
      this.plotType = plotType;
  
      const absMaxX = Math.max.apply(null, this[colum_val[0]].map(Math.abs));
      const absMaxY = Math.max.apply(null, this[colum_val[1]].map(Math.abs));
      this.maxSize = Math.max(absMaxX, absMaxY);
    }
  }
} //end class
