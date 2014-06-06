// app/instagramUtils.js
var url             = require("url");
var ig              = require('instagram-node').instagram();
var express         = require('express');
var _               = require('underscore');
var async           = require('async');
var Firebase        = require('firebase');

// Instagram specific settings.
ig.use({ access_token: '571377691.a1a66b7.e2e448e987c74fe0aff6c918d0925fb4',
            client_id: 'a1a66b75bb924ce3b35151247480cbbc',
        client_secret: '73e163c1cfa14442b9403b5f6adf9a63' });

exports.loadPage = function(req, res){
  res.render('../views/globe.ejs');
}

exports.temp = function(req, res){
  var pathname = url.parse(req.url).pathname;  // extrapolates path from submit button.
  console.log(pathname, "pathname");
  var mess = url.parse(req.url).query;  //extrapolate message from input field on submit.
  var userObj = mess.split("=");  // convert field to array [message, string]
  var userName = userObj[1];  // extrapolate username from field.
  console.log(userName, "user name");
  res.json("yolo"); // ends the ajax response from client side.
}

exports.fetchAllMedia = function(req, res) {
  var followers = [];  //stores users followers ID list in array.
  var coordinates = [];  // stores results of image long, lat, mag
  var followerFeeds = [];
  var followersCount;
  var followersMaxCount;
  var ID;
  var full_name;
  var dataChild;
  var cap = 0;
  var userSnapshot;

  var date = function(){
    var d = new Date();
    return d.getUTCFullYear()+"-"+d.getUTCMonth()+"-"+d.getUTCDate();
  }();


  // extract from input the user name.
  var pathname = url.parse(req.url).pathname;  // extrapolates path from submit button.
  var mess = url.parse(req.url).query;  //extrapolate message from input field on submit.
  var userObj = mess.split("=");  // convert field to array [message, string]
  var userName = userObj[1];  // extrapolate username from field.
  res.json(""); // ends the ajax response from client side.

  var fb = new Firebase('https://fanscape.firebaseio.com/');  // connects to Firebase.

  // STEP 2 //
  // creates an array with a list of followers ID called "followers"
  // creates a "followersCount" with an optional cap override
  // initiates the followersMedia function
  var paginationFollowers = function (err, users, pagination, limit) {
    console.log("STEP 2 - in the paginationFollowers");

    followers = followers.concat(_.pluck(users, 'id')); // keeps adding to followers variable list of followers ID
    // goes through each pagination to add to the followers list.
    if (pagination && pagination.next) {
      pagination.next(paginationFollowers);
    } else {
      // done with all pagination
      // checks for a cap value and if so sets the followsCount to it.
      if(cap !== 0 ){
        console.log("set a cap");
        followersMaxCount = cap;
        checkIntegrity(); // checks integrity of database for existing data
      } else {
        console.log("did not set a cap");
        followersMaxCount = followers.length;
        checkIntegrity(); // checks integrity of database for existing data
      }
    }
  }

  // STEP 3 //
  var checkIntegrity = function (err, medias, pagination, limit) {
    console.log("STEP 3 - in the checkIntegrity");

    // check if locations exists
    if ( !userSnapshot.locations ) {
      console.log("the locations does not exist");
      followersCount = 0;
      followersMedia();

    // check if today's date exist
    } else if (!userSnapshot.locations[date]) {
      console.log("the date does not exist");
      followersCount = 0
      followersMedia();

    // check if today's date exist and has not completed everything
    } else if (!userSnapshot.locations[date].status) {
      console.log("the date exist but did not complete everything");

      // check of last value
      for( followersCount = 0; followersCount < followersMaxCount; followersCount++ ){

        // if follower exist then check for status
        if (userSnapshot.locations[date][followers[followersCount]]){

          // check if that follower has completed everything.
          if( userSnapshot.locations[date][followers[followersCount]].status ) {
            console.log(followers[followersCount]+" has already been acquired");
          } else {
            console.log(followers[followersCount]+" has NOT been acquired");
            followersMedia();
            return;
          }

        } else {
          console.log("The follower does not exist");
          followersMedia();
          return;
        }
      }
      fb.child(userName).child('locations').child(date).update({'status': 'completed'}, function(){
        console.log("followersCount is now less then 0, so all data gathered and status set to completed");
      });

    // check if today's date exist and has completed everything
    } else {
      console.log("the date exist and completed everything, so no need to do anything");
    }
  }

  // STEP 4 //
  var followersMedia = function (err, medias, pagination, limit) {
    console.log("STEP 4 - in the followersMedia");

    fb.child(userName).child('locations').child(date).child(followers[followersCount]).remove(function(){
      ig.user_media_recent(followers[followersCount], extractCoordinates);
    });
  }

  // STEP 5 //
  // extract locations from one big feed.
  var extractCoordinates = function (err, medias, pagination, limit) {
    // console.log("STEP 5 - in the extractCoordinates");
    if(medias){
      var pureMedia = filterMedia(medias); // filters from the media just the media with Geo Locations.
      //upon geo tagged data
      if(pureMedia){
        // create a follower with geo location data for that follower
        fb.child(userName).child('locations').child(date).child(followers[followersCount]).child('data').push(pureMedia, function(){
        // check's for pagination and repeats the process.
          if (pagination && pagination.next) {
            pagination.next(extractCoordinates);
          } else {
            console.log("done with pagination of extractCoordinates for - "+ followers[followersCount]);
            startNextExtraction();
          }
        });
      } else {
        console.log("extractCoordinates did not find any geo media for - "+ followers[followersCount]);
        startNextExtraction();
      }
    } else {
      console.log("extractCoordinates had no media to extract for - "+ followers[followersCount]);
      startNextExtraction();
    }
  };

  // STEP 6 //
  var startNextExtraction = function(){
    console.log("STEP 6 - in the startNextExtraction");

    // creates a "status" : "completed" marker to record that all the data has been extrapolated fully for that follower.
    fb.child(userName).child('locations').child(date).child(followers[followersCount]).update({'status': 'completed'}, function(){
      followersCount++;
      console.log( (followersMaxCount - followersCount) +" out of "+followersMaxCount+" followers to extract");
      if(followersCount !== followersMaxCount) {
        followersMedia();
      } else {
        // creates a "status" : "completed" to show that all the data has been retrieved
        fb.child(userName).child('locations').child(date).update({'status': 'completed'}, function(){
          console.log("followersCount is now less then 0, so all data gathered and status set to completed");
        });
      }
    })
  };

  // STEP 7 //
  // takes the media object that has pictures, and geolocation and returns an array of long, lat and mag.
  var filterMedia = function (feed) {
    console.log("STEP 7 - in the filterMedia");

    var result = [];
    var latitude = [];
    var longitude = [];
    var a = _.pluck(feed, "location");
    var b = _.filter(a, function(obj){
      if(obj){
        if(obj.longitude){
          return true;
        } else {
          return false;
        }
      } else {
        return false;
      }
    });
    longitude = _.pluck(b, "longitude");
    latitude = _.pluck(b, "latitude");

    for(var j = 0; j < latitude.length; j++){
      result.push([(Math.round(latitude[j]*10)/10), (Math.round(longitude[j]*10)/10)]);
    }
    var flatResult = _.flatten(result);

    return flatResult;
  };

  // STEP 1 //
  // search inputed username or query for a property id === 571377691
  ig.user_search(userName, function(err, users, limit) {
    console.log("STEP 1 - in the ig.user_search");

    // check for existing users, if none then return.
    if(users.length === 0){
      console.log("No user Found");
      return;
    }

    // Current ID and Full Name collection
    allID = _.pluck(users, "id");  // pulls ID's from inputed query if exist
    allFullName = _.pluck(users, "full_name");  // pulls full_name from inputed query if exist
    ID = allID[0]; // selects only the first ID
    full_name = allFullName[0]; // selects only the first full name

    // create a directory with user name and adds the full name to it.
    fb.child(userName).update({'name': full_name}, function(){
      // adds to the user name the ID.
      fb.child(userName).update({'id': ID.toString()}, function(){
        // takes a snapshot of the user name data.
        fb.child(userName).once('value', function(snapshot) {
          userSnapshot = snapshot.val();

          // check if locations date exist and has completed in it if so return
          if(!userSnapshot.locations || !userSnapshot.locations[date]) {
            console.log("does not exist");

            // need to download everything for that day.
            // gather followers list
            ig.user_followers(ID, paginationFollowers);  // Runs the search.
          } else {
            // check if the data has been fully downloaded already.
            if (userSnapshot.locations[date].status){

              console.log("The data is already there and " + userSnapshot.locations[date].status);
            } else {

              // TODO
              // need to check for each followers
              // console.log("in last else");
              ig.user_followers(ID, paginationFollowers);  // Runs the search.
            }
          }
        });
      });
    });
  });
};