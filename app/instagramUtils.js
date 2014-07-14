// app/instagramUtils.js
var Firebase        = require('firebase'),
    fb              = new Firebase('https://fanscape.firebaseio.com/'),  // connects to Firebase.
    ig              = require('instagram-node').instagram(),
    _               = require('underscore'),
    redirect_uri    = process.env.INSURIREDIRECT ;

ig.use({
  client_id: process.env.FANSCAPECLIENTID,
  client_secret: process.env.FANSCAPECLIENTSECRET
  });

// FIRST thing loaded '/'
exports.loadPage = function(req, res) {
  res.render('../views/partials/login.ejs');
  };

// SECOND href to Instagram api for access token
exports.authorize_user = function(req, res) {
  res.redirect(ig.get_authorization_url(redirect_uri, { scope: ['likes+comments+relationships'], state: 'a state' }));
  };

// THIRD handle the response from Instagram and store
exports.handleauth = function(req, res) {

  // queryCode           = req.query.code;

  ig.authorize_user(req.query.code, redirect_uri, function(err, result) {

    // profile_picture     = result.user.profile_picture;
    // token               = result.access_token;
    // full_name           = result.user.full_name;
    // userName            = result.user.username;
    // id                  = result.user.id;

    if (err) {
      console.log(err.body);
      res.send("Didn't work:" + err.body);
    } else {
      // console.log("Did work");
      // saves users full name in /username/userData/ directory
      fb.child(result.user.username).child('userData').update({'name': result.user.full_name}, function(){
        // saves ID in /username/userData/ directory
        fb.child(result.user.username).child('userData').update({'id': result.user.id}, function(){
          // saves token in /username/userData/ directory
          fb.child(result.user.username).child('userData').update({'token': result.access_token}, function(){
            // saves queryCode in /username/userData/ directory
            fb.child(result.user.username).child('userData').update({'queryCode': req.query.code}, function(){
              // saves profile picture in /username/userData/ directory
              fb.child(result.user.username).child('userData').update({'profile_picture': result.user.profile_picture}, function(){
                res.redirect('/globe?user='+result.user.username+'&id='+result.user.id);
              });
            });
          });
        });
      });
    }
  });
  };


// FOURTH redirected from handleauth with userName clipped to it.
exports.fetchAllMedia = function(req, res) {
  res.render('../views/partials/globe.ejs');  // rendering ejs to html

  // user variables
  var followers = [],  //stores users followers ID list in array.
      coordinates = [],  // stores results of image long, lat, mag
      fullData = [],
      fullDataMerge = false,
      followerFeeds = [],
      followersCount = 0,
      followersMaxCount,
      userSnapshot,
      theUrl = req.url,
      tempTupple = theUrl.split("&"),
      tempUser = tempTupple[0].split("="),
      tempId = tempTupple[1].split("="),
      userName = tempUser[1],
      id = tempId[1];

  // takes a snapshot of the user name data
  fb.child(userName).once('value', function(snapshot) {
  userSnapshot = snapshot.val();

  // STEP 2 //
  // creates array with a list of followers ID called "followers" & a "followersCount" STEP 3
  var paginationFollowers = function (err, users, pagination, limit) {
    // console.log("STEP 2 - in the paginationFollowers");
    if(err){
      console.log(err);
    } else {
      followers = followers.concat(_.pluck(users, 'id')); // keeps adding to followers variable list of followers ID
      // goes through each pagination to add to the followers list.
      if (pagination && pagination.next) {
        pagination.next(paginationFollowers);
      } else {
        // converts the stringed followers to numbers
        var digitizedFollowers = [];
        for(var i = 0; i < followers.length; i++){
          digitizedFollowers.push(JSON.parse(followers[i]));
        }
        // done with all pagination
        followers = digitizedFollowers;

        fb.child(userName).child('geoData').child('followers').update({'totalFollowers': followers.length}, function(){
          // adds the total number of followers fetched inside a pureData folder
          fb.child(userName).child('pureData').child('followers').update({'totalFollowers': followers.length}, function(){
            // since no initial user found just creates all the data
            goThroughFollowers();
            // checkIntegrity(); // checks integrity of database for existing data
          });
        });
        // checkIntegrity(); // checks integrity of database for existing data
      }
    }
    };

  // STEP 3 //
  // runs checkIfFollowerExist on every acquired followers
  var goThroughFollowers = function (){
    // console.log("STEP 4 - in the goThroughFollowers");

    for (var i = 0; i < followers.length; i++){
      checkIfFollowerExist(followers[i]);
    }

    };

  // STEP 4 //
  // if no followers director then go fetch it using getFollowerMedia
  var checkIfFollowerExist = function (follower){
    // console.log("STEP 5 - in the checkIfFollowerExist");

    // check if locations exists
    if (!userSnapshot){
      // console.log("since nothing existed creates media");
      getFollowerMedia(follower);
    } else if (!userSnapshot.geoData) {
      // console.log("since no geoData folder exist creates media");
      getFollowerMedia(follower);
    } else if (!userSnapshot.geoData[follower]){
      // console.log("since no follower specific folder exist creates media");
      getFollowerMedia(follower);
    } else if (!userSnapshot.geoData[follower].status){
      // console.log("since no follower status complete exist delete and then creates fresh media");
      fb.child(userName).child('geoData').child(follower).remove();
      getFollowerMedia(follower);
    } else {
      // console.log(follower+" already exist");
      followersCount++;
      fb.child(userName).child('pureData').child('followers').update({'followersDone': (followersCount)});
      fb.child(userName).child('geoData').child('followers').update({'followersDone': (followersCount)});
    }
    };

  // STEP 5 //
  // ....
  var getFollowerMedia = function (follower) {
    // console.log("STEP 6 - in the getFollowerMedia");
    var followersData = [];

    var extractCoordinates = function (err, medias, pagination, limit) {
      // console.log("STEP 6b - in the extractCoordinates");

      if(medias){
        var pureMedia = filterMedia(medias); // filters from the media just the media with Geo Locations.

        if(pureMedia.length > 1){
          // create a follower with geo location data for that follower
          fb.child(userName).child('geoData').child(follower).child('data').push(pureMedia, function(){});

          followersData = followersData.concat(pureMedia);
        }
        // check's for pagination and repeats the process.
        if (pagination && pagination.next) {
          pagination.next(extractCoordinates);
        } else {
          // console.log("done with pagination of extractCoordinates for - "+ follower);
          followersCount++;

          //add followers data [lat, long, timestamp] to fullData [lat, long, mag] if followersData has stuff in it
          if(followersData.length > 1){
            var a = crossRef(followersData, 0.005);
            fullData = fullData.concat(a);

            // overwrite data in Firebase
            if(fullData){
              fb.child(userName).child('pureData').update({'data': fullData});
            }
          }


          fb.child(userName).child('pureData').child('followers').update({'followersDone': (followersCount)});

          fb.child(userName).child('geoData').child(follower).update({'status': 'complete'});
          fb.child(userName).child('geoData').child('followers').update({'followersDone': (followersCount)});
        }
      } else {
        followersCount++;
        fb.child(userName).child('pureData').child('followers').update({'followersDone': (followersCount)});

        fb.child(userName).child('geoData').child(follower).update({'status': 'complete'});
        fb.child(userName).child('geoData').child('followers').update({'followersDone': (followersCount)});
        // console.log("extractCoordinates had no media to extract for - "+ follower);
      }
    };
    // gets media information for specific follower
    ig.user_media_recent(follower.toString(), extractCoordinates);

    };

  // STEP 6 //
  // takes the media object that has pictures with geolocation data and returns an array of [lat, long, timestamp]
  var filterMedia = function (feed) {
    // console.log("STEP 7 - in the filterMedia");

    var geoDataObj = _.pluck(feed, "location");  // creates an array of obj with only the location properties from feed
    var timeStamp = _.pluck(feed, "created_time");  // creates an array of time stamps

    var geoLocations = [];
    for(var i = 0; i < timeStamp.length; i++ ){
      if(geoDataObj[i] && geoDataObj[i].latitude){
        geoLocations.push(Math.round(geoDataObj[i].latitude*10)/10);  // latitude data rounded up to 1 decimal
        geoLocations.push(Math.round(geoDataObj[i].longitude*10)/10);  // longitude data rounded up to 1 decimal
        geoLocations.push(JSON.parse(timeStamp[i])); // timeStamp data
      }
    }

    return geoLocations;
    };

  // STEP 7 //
  // takes array data [lat, long, timestamp or magnityre] and filters it down to an array that has an averaged out magnitude average [lat, long, mag]
  var crossRef = function(data, magnitude){
    var result = [],
        obj    = {};

    if(data && data.length > 1){
      // creates an object with mean number of repetitions
      for (var i = 0; i < data.length; i++) {
        var pair = JSON.stringify([(data[i]),(data[i+1])]);

        // if the pair exists
        if (obj[pair]){

          // if the pair value is less then 1.5 magnitude
          if(obj[pair] < 1.5 ){

            // if there is a timestamp add one more magnitude
            if(data[i+2] > 1000){
              obj[pair] += magnitude;

            // if there is another magnitude.
            } else {
              obj[pair] += (data[i+2]);
            }
          }
        } else {
          obj[pair] = magnitude;
        }
        i++;
        i++;
      };

      // converts object back to array
      for(var i in obj){
        var a = JSON.parse(i);
        a.push(obj[i]);
        result = result.concat(a);
      };

    }

    return result;

  }

  // STEP 1 //
  // extract followers list using paginationFollowers
  console.log("STEP 1 - get followers list");
  ig.user_followers(id, paginationFollowers);

  });

  };
