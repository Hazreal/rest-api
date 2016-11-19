var mclient = require('mongodb').MongoClient;
var express = require ('express');
var bodyParser = require('body-parser');
var app = express();
app.use(bodyParser.json());


mclient.connect('mongodb://localhost:27017/SocialNetwork', function(err, dbconn){
  if(!err) { //sucessful mongo connect
    console.log('Connected to Mongo');
    
    //process express api request
    //look up collection
    app.get('/api/:collection', function(request, response) {
      var col = request.params.collection;
      var collect = dbconn.collection(col);
      response.writeHead(200, {"Content-type": "application/json"});
      
      //look up
      collect.find().toArray(function(err, results) {
        if(!err){
          response.write(JSON.stringify({Results: results}));
          response.end();
        } else {
          response.write("Error Finding Users");
          response.end();
        }
      });
    }); //end collection find
    
    //get specific username
    app.get('/api/:collection/:username', function(request, response) {
      var col = request.params.collection;
      var uName = request.params.username;
      var collect = dbconn.collection(col);
      response.writeHead(200, {"Content-type": "application/json"});
      
      //look up
      //check for post collection
      if (col == "post"){
        collect.find({"by.username": uName}).toArray(function(err, results) {
          if(!err){
            response.write(JSON.stringify({Results: results}));
            response.end();
          } else {
            response.write("Error Finding User");
            response.end();
          }
        });
        
      } else {
        //everything else
        collect.find({username: uName}).toArray(function(err, results) {
          if(!err){
            response.write(JSON.stringify({Results: results}));
            response.end();
          } else {
            response.write("Error Finding User");
            response.end();
          }
        });
        }
    }); //end user find
    
    //post to collection
    app.post('/api/:collection', function(request, response){
      var col = request.params.collection;
      var collect = dbconn.collection(col);
      var insertData = request.body;
      
      response.writeHead(200, {"Content-type": "application/json"});
      
      //do Post
      collect.insert(insertData, function(err, results){
        if(!err){
        response.write(JSON.stringify({Results: insertData}));
        response.end();
        } else {
          response.write("Error inserting Data");
          response.end();
        }
      });
    }); // end post req handler
   

    //update collection
    app.put('/api/:collection/:username/', function(request, response){
      var col = request.params.collection;
      var uName = request.params.username;
      var collect = dbconn.collection(col);
      var updateData = request.body;
     
      response.writeHead(200, {"Content-type": "application/json"});
      
      //do update
      //check for post collection
      if (col == "post"){
        collect.update({"by.username": uName}, updateData, {},  function(err, results){
          if(!err){
            collect.find({"by.username": uName}).toArray(function(err, results) {
              if(!err){
                response.write(JSON.stringify({Results: results}));
                response.end();
              }else{
                response.write("User not found after Update");
                response.end();
              }
            });
          }else{
            response.write("Update Failed");
            response.end();
          }
        });
      }else{
        collect.update({username: uName}, updateData, {},  function(err, results){
          if(!err){
            collect.find({username: uName}).toArray(function(err, results) {
              if(!err){
                response.write(JSON.stringify({Results: results}));
                response.end();
              }else{
                response.write("User not found after Update");
                response.end();
              }
            });
          }else{
            response.write("Update Failed");
            response.end();
          }
        });
      }
    }); // end update of user
    
    //update all
    app.put('/api/:collection/', function(request, response){
      var col = request.params.collection;
      var collect = dbconn.collection(col);
      var updateData = request.body;

      response.writeHead(200, {"Content-type": "application/json"});
      
      //do update
      collect.update({}, updateData, {multi:true},  function(err, results){
        if(!err){
          collect.find({}).toArray(function(err, results) {
            if(!err){
              response.write(JSON.stringify({Results: results}));
              response.end();
            }else{
              response.write("Users Were not found after insert");
              response.end();
            }
          });
        }else{
          response.write("Error Updating Users");
          response.end();
        }
      });
    }); //end update of all collections 
    
    app.delete('/api/:collection/:username', function(request, response){
      var col = request.params.collection;
      var uName = request.params.username;
      var collect = dbconn.collection(col);
      response.writeHead(200, {"Content-type": "application/json"});
      
      //do delete
      //check for post collection
      if(col == "post"){
        collect.remove({"by.username": uName}, function (err, results){
          if(!err){
            response.write(JSON.stringify("User Deleted"));
            response.end();
          }else{
            response.write("Could not delete User");
            response.end();
          }
        });
      } else {
        collect.remove({username: uName}, function (err, results){
          if(!err){
            response.write(JSON.stringify("User Deleted"));
            response.end();
          }else{
            response.write("Could not delete User");
            response.end();
          }
        });
      }
    }); // end delete
    
    app.listen(process.env.PORT);
   
  } else { //mongo connect error
    console.log(err);
  }
});
