console.log('Loading data');

///
/// JSONdata.js is to compressed the desired dataset to a smaller dataset by making a average calculation of it
///

function compression(data, compress, callback) {
    
    if (compress == 1) {
        console.log(`=== No compression - data count: ${data.Count} ===`);
        callback(null, data.Items);
    }
    else {
        console.log(`=== Compression lvl: ${compress} ===`);
        console.log(`=== Before compression - data count: ${data.Count} ===`);
        
        var unitdata = data.Items;
        var datacount = data.Count;
        var lastdata = 0;
        var checkcount = 0;
       
        var newclimatedata = [];
        var newdate, newtemp, newhumi, newheat;
        
        var CannotBeDivided = true;
        while (CannotBeDivided)
        {
            checkcount = datacount / compress;
            if (checkcount % 1 === 0) {
                CannotBeDivided = false;
            } else {
                datacount--;
                lastdata++; 
            }
        }
        
        for (var i = 0; i < datacount; i = i + compress) {
            newdate = 0;
            newtemp = 0;
            newhumi = 0;
            newheat = 0;
            for (var t = i; t < i + compress; t++) {
                newdate = newdate + unitdata[t].datestamp;
                newtemp = newtemp + unitdata[t].climatedata.temperature;
                newhumi = newhumi + unitdata[t].climatedata.humidity;
                newheat = newheat + unitdata[t].climatedata.heatindex;
            }
            newdate = newdate / compress;
            newtemp = newtemp / compress;
            newhumi = newhumi / compress;
            newheat = newheat / compress;
            
            newclimatedata.push({
                "datestamp": newdate.toFixed(0),
                "climatedata": {
                    "temperature": newtemp.toFixed(2),
                    "humidity": newhumi.toFixed(2),
                    "heatindex": newheat.toFixed(2)
                }
            });
        }
        
        if (lastdata > 0) {
            newdate = 0;
            newtemp = 0;
            newhumi = 0;
            newheat = 0;
            for (var i = lastdata; i > data.Count; i--) {
                newdate = newdate + unitdata[i].datestamp;
                newtemp = newtemp + unitdata[i].climatedata.temperature;
                newhumi = newhumi + unitdata[i].climatedata.humidity;
                newheat = newheat + unitdata[i].climatedata.heatindex;
            }
            newdate = newdate / compress;
            newtemp = newtemp / compress;
            newhumi = newhumi / compress;
            newheat = newheat / compress;
            
            if (newdate != 0) {
                newclimatedata.push({
                    "datestamp": newdate,
                    "climatedata": {
                        "temperature": newtemp,
                        "humidity": newhumi,
                        "heatindex": newheat
                    }
                });
            }
        }

        console.log(`=== After  compression - data count: ${newclimatedata.length} ===`);
    
        callback(null, newclimatedata);
    }
}
module.exports.compression = compression;