console.log("Loading dynamodb");

var cjs = require("./crypto.js");

const AWS = require("aws-sdk");
const dynamodb = new AWS.DynamoDB.DocumentClient();

module.exports = {
    /// Data received from a IOT unit with climatedata in JSON format
    PutData: function(body, callback) {
        var bodyjson = JSON.parse(body);
        const { unitid, datestamp, climatedata } = bodyjson;
        const { temperature, humidity, heatindex } = climatedata;
    
        var params = {
            TableName : "climatedata",
            Item: {
                "unitid": unitid,
                "datestamp": datestamp,
                "climatedata": {
                    "temperature": temperature,
                    "humidity": humidity,
                    "heatindex": heatindex
                }
            }
        };
        
        dynamodb.put(params, function(err, data) {
        if (err) { console.log("Error", err); } 
        else { callback(null, "Data received"); }
        });
    },
    
    /// Userlogin request without apikey, if user exist it will respone with the users api key in JSON format
    Userlogin: function(body, callback) {
        console.log(body);
        var bodyjson = JSON.parse(body);
        const { usermailid, userpassword } = bodyjson;
        
        console.log(cjs.crypt(userpassword));
        
        var params = {
            ExpressionAttributeValues: {
                ":usermailid": usermailid.toLowerCase(),
                ":userpassword" : cjs.crypt(userpassword)
            },
            KeyConditionExpression: "usermailid = :usermailid",
            ProjectionExpression: "userapi",
            FilterExpression: "userpassword = :userpassword",
            TableName: "climateuser"
        };
    
        dynamodb.query(params, function(err, data) {
            if (err) { console.log("Error", err); } 
            else { callback(null, (data.Items)); }
        });
    },
    
    /// Change user password, if it succeeds it will respone with "Password changed""
    ChangeUserPassword: function(body, callback) {
        var bodyjson = JSON.parse(body);
        const { usermailid, userpassword, newpassword } = bodyjson;
        
         var params = {
            ExpressionAttributeValues: {
                ":usermailid": usermailid.toLowerCase(),
                ":userpassword" : cjs.crypt(userpassword)
            },
            KeyConditionExpression: "usermailid = :usermailid",
            ProjectionExpression: "userpassword",
            FilterExpression: "userpassword = :userpassword",
            TableName: "climateuser"
        };
    
        dynamodb.query(params, function(err, data) {
            if (err) { console.log("Error", err); } 
            else {  
                var dbuserpassword;
                data.Items.forEach(function(item) { dbuserpassword = item.userpassword; });
                if (cjs.crypt(userpassword) == dbuserpassword) {
                     var params = {
                    Key: {
                        "usermailid": usermailid.toLowerCase()
                    },
                    UpdateExpression: "set userpassword = :newpassword",
                    ExpressionAttributeValues: {
                        ":newpassword" : cjs.crypt(newpassword),
                    },
                    TableName: "climateuser"
                    };
                    
                    dynamodb.update(params, function(err, data) {
                    if (err) { console.log("Error", err); } 
                    else { callback(null, "Password changed"); }
                    });
                }
                else { callback(null, "no access"); }
            }
        });
    },
    
    /// Change / update unit information, if it succeeds it will respone with "Units updated"
    UpdateUnitNames: function(body, callback) {
        var bodyjson = JSON.parse(body);
        const { usermailid, units } = bodyjson;
        
        var params = {
            Key: {
                "usermailid": usermailid.toLowerCase()
            },
            UpdateExpression: "set units = :units",
            ExpressionAttributeValues: {
                ":units" : units
            },
            TableName: "climateuser"
        };
        
        dynamodb.update(params, function(err, data) {
        if (err) { console.log("Error", err); } 
        else { callback(null, "Units updated"); }
        });
    },
    
     /// Get all users privat unitID and names on units and respone in JSON format
    UserUnits: function(body, callback) {
        var bodyjson = JSON.parse(body);
        const { usermailid, userpassword } = bodyjson;
    
        var params = {
            ExpressionAttributeValues: {
                ":usermailid": usermailid.toLowerCase(),
                ":userpassword" : cjs.crypt(userpassword)
            },
            KeyConditionExpression: "usermailid = :usermailid",
            ProjectionExpression: "units",
            FilterExpression: "userpassword = :userpassword",
            TableName: "climateuser"
        };
    
        dynamodb.query(params, function(err, data) {
            if (err) { console.log("Error", err); } 
            else { callback(null, (data.Items)); }
        });
    },
    
    /// Gat dataset from certain time and respone in JSON format
    UnitData: function (queryStringParameters, callback) {
        const { usermailid, unitid, date } = queryStringParameters;
        
        var unitsarray;
        var unitfound = false;
        
        
        var Userunitsparams = {
            ExpressionAttributeValues: {
                ":usermailid": usermailid.toLowerCase()
            },
            KeyConditionExpression: "usermailid = :usermailid",
            ProjectionExpression: "units",
            TableName: "climateuser"
        };
        dynamodb.query(Userunitsparams, function(err, data) {
            if (err) { console.log("Error", err); } 
            else { 
                data.Items.forEach(function(item) { unitsarray = item.units; });
                
                unitsarray.forEach(function(item) { 
                    var split = item.split(",");
                    if (split[0] == unitid) { unitfound = true; }
                });
            }
            
            if (unitfound) {
                var unix = new Date(date).getTime() / 1000;
                
                var climatedataparams = {
                    ExpressionAttributeValues: { 
                        ":unitid": unitid, 
                        ":datestampfrom": unix,
                        ":datestampto": unix + 86399
                    },
                    KeyConditionExpression: "unitid = :unitid AND datestamp BETWEEN :datestampfrom AND :datestampto",
                    ProjectionExpression: "datestamp, climatedata",
                    TableName: "climatedata"
                };
                
                dynamodb.query(climatedataparams, function(err, data)
                {
                    if(err) { console.log("Error", err); }
                    else {
                        console.log(`=== Data count from DB: ${data.Count} ===`);
                        callback(null, data);
                    }
                });
                
            }
        });
    }
};