console.log('Loading index');

var ddb = require("./handlers/dynamodb.js");
var JSONdata = require("./handlers/JSONdata.js");

exports.handler = (event, context, callback) => {
    console.log('Received event:', JSON.stringify(event, null, 2));
    
    const done = (err, res) => callback(null, {
        statusCode: err ? '400' : '200',
        body: err ? err.message : JSON.stringify(res),
        headers: { 'Content-Type': 'application/json', },
    });
    
    const { httpMethod, queryStringParameters, body, path} = event;
    const { httpFunction, dataCompression } = queryStringParameters;
    
    ///
    /// Index.js is the main thread for all incoming webapi requests
    /// The request is going through all switch and if the request is matching it will start a DB request.
    /// All request and respones is in JSON format
    ///
    
    switch (httpMethod) {
        //case 'DELETE':
        //    dynamo.deleteItem(JSON.parse(event.body), done);
        //break;
        case 'GET':
            if (path == "/climateapi") {
                switch (httpFunction)
                {
                    case 'climatedata':
                        ddb.UnitData(queryStringParameters, function(err, data){
                            if(err) { console.log("Error", err); }
                            else {
                                switch (dataCompression)
                                {
                                    case '1': JSONdata.compression(data, 1, done); break;
                                    case '2': JSONdata.compression(data, 2, done); break;
                                    case '3': JSONdata.compression(data, 4, done); break;
                                    case '4': JSONdata.compression(data, 6, done); break;
                                    default: done(new Error(`Unsupported dataCompression "${dataCompression}"`));
                                }  
                            }
                        });
                    break;
                    default: done(new Error(`Unsupported httpFunction "${httpFunction}"`));
                }
            }
        break;
        case 'POST':
            if (path == "/climateapi") {
                switch (httpFunction)
                {
                    case 'climatedata': ddb.PutData(body, done); break;
                    case 'userunits': ddb.UserUnits(body, done); break;
                    default: done(new Error(`Unsupported httpFunction "${httpFunction}"`));
                }
            }
            else if (path == "/climatelogin") {
                switch (httpFunction)
                {
                    case 'userlogin': ddb.Userlogin(body, done); break;
                    default: done(new Error(`Unsupported httpFunction "${httpFunction}"`));
                }
            }
        break;
        case 'PUT':
             if (path == "/climateapi") {
                switch (httpFunction)
                {
                    case 'units': ddb.UpdateUnitNames(body, done); break;
                    case 'changepassword': ddb.ChangeUserPassword(body, done); break;
                    default: done(new Error(`Unsupported httpFunction "${httpFunction}"`));
                }
            }
        break;
        default: done(new Error(`Unsupported httpMethod "${httpMethod}"`));
    }
};