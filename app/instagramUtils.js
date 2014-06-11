// app/instagramUtils.js
var ig              = require('instagram-node').instagram();
var _               = require('underscore');
var Firebase        = require('firebase');

var queryCode;
var token;
var full_name;
var userName;
var id;
var profile_picture;

ig.use({
  client_id: process.env.FANSCAPECLIENTID,
  client_secret: process.env.FANSCAPECLIENTSECRET
});

var redirect_uri = 'http://fanscape.azurewebsites.net/auth/instagram/callback';

var fb = new Firebase('https://fanscape.firebaseio.com/');  // connects to Firebase.


// FIRST thing loaded '/'
exports.loadPage = function(req, res) {
  res.render('../views/partials/globe.ejs');
  };

// SECOND href to Instagram api for access token
exports.authorize_user = function(req, res) {
  res.redirect(ig.get_authorization_url(redirect_uri, { scope: ['likes+comments'], state: 'a state' }));
};

// THIRD handle the response from Instagram
exports.handleauth = function(req, res) {
  ig.authorize_user(req.query.code, redirect_uri, function(err, result) {
    if (err) {
      console.log(err.body);
      res.send("Didn't work");
    } else {

      // extract data to be saved later to Firebase
      queryCode           = req.query.code;
      profile_picture     = result.user.profile_picture;
      token               = result.access_token;
      full_name           = result.user.full_name;
      userName            = result.user.username;
      id                  = result.user.id;

      // console.log(token, "this should be the token");
      // console.log(full_name, "this should be the full name");
      // console.log(userName, "this should be the user Name");
      // console.log(id, "this should be the ID");
      res.redirect('/globe?user='+userName);
    }
  });
};

// FOURTH redirected from handleauth with userName clipped to it.
exports.fetchAllMedia = function(req, res) {
  // app.post
  res.render('../views/partials/globeb.ejs');
  var followers = [];  //stores users followers ID list in array.
  var coordinates = [];  // stores results of image long, lat, mag
  var followerFeeds = [];
  var followersMaxCount;
  var followersCount = 0;
  var dataChild;
  var userSnapshot;

  var date = function(){
    var d = new Date();
    return d.getUTCFullYear()+"-"+d.getUTCMonth()+"-"+d.getUTCDate();
    }();

  var theUrl = req.url;
  var tempArray = theUrl.split("=");
  userName = tempArray[1];
  // console.log(userName, "User Name from request //////////");
  // console.log(id, "id found locally");

  // takes a snapshot of the user name data
  fb.child(userName).once('value', function(snapshot) {
  userSnapshot = snapshot.val();


  if(userSnapshot){
    id = userSnapshot.id;
  }

    // STEP 2 //
    // creates array with a list of followers ID called "followers" & a "followersCount" > STEP 3
    var paginationFollowers = function (err, users, pagination, limit) {
      console.log("STEP 2 - in the paginationFollowers");

      followers = followers.concat(_.pluck(users, 'id')); // keeps adding to followers variable list of followers ID
      // goes through each pagination to add to the followers list.
      if (pagination && pagination.next) {
        pagination.next(paginationFollowers);
      } else {
        // converts the stringed followers to numbers
        var temp = [];
        for(var i = 0; i < followers.length; i++){
          temp.push(JSON.parse(followers[i]));
        }
        // done with all pagination
        follwers = temp;
        checkIntegrity(); // checks integrity of database for existing data
      }
      };

    // STEP 3 //
    var checkIntegrity = function (err, medias, pagination, limit) {
      console.log("STEP 3 - in the checkIntegrity");

        // if nothing existing for current user then create information for user
        if (!userSnapshot){
        // create a directory with user name and adds the full name to it
        fb.child(userName).update({'name': full_name}, function(){
            // adds to the user name the ID
            fb.child(userName).update({'id': id.toString()}, function(){
              // adds the token to the library
              fb.child(userName).update({'token': token.toString()}, function(){
                // adds the query code to the database
                fb.child(userName).update({'queryCode': queryCode.toString()}, function(){
                  // adds the profile photo to the database.
                  fb.child(userName).update({'profile_picture': profile_picture.toString()}, function(){
                    // adds the total number of followers fetched
                    fb.child(userName).child('geoData').child('followers').update({'totalFollowers': followers.length}, function(){
                      // since no initial user found just creates all the data
                      goThroughFollowers();
                    });
                  });
                });
              });
            });
          });

        // user was found so check consistency of data by comparing to followers list
        } else {
          //TODO check for difference between previous total count...
          // Do something else
          fb.child(userName).child('geoData').child('followers').update({'totalFollowers': (followers.length)}, function(){
            // since no initial user found just creates all the data
            goThroughFollowers();
          });
        }
      };

    // STEP 4 //
    var goThroughFollowers = function (){
      console.log("STEP 4 - in the goThroughFollowers");

      for (var i = 0; i < followers.length; i++){
        checkIfFollowerExist(followers[i]);
      }

      };


    // STEP 5 //
    var checkIfFollowerExist = function (follower){
      console.log("STEP 5 - in the checkIfFollowerExist");

      // check if locations exists
      if (!userSnapshot){
        console.log("since nothing existed creates media");
        getFollowerMedia(follower);
      } else if (!userSnapshot.geoData) {
        console.log("since no geoData folder exist creates media");
        getFollowerMedia(follower);
      } else if (!userSnapshot.geoData[follower]){
        console.log("since no follower specific folder exist creates media");
        getFollowerMedia(follower);
      } else if (!userSnapshot.geoData[follower].status){
        console.log("since no follower status complete exist delete and then creates fresh media");
        fb.child(userName).child('geoData').child(follower).remove();
        getFollowerMedia(follower);
      } else {
        console.log(follower+" already exist");
      }
      };

    // STEP 6 //
    var getFollowerMedia = function (follower) {
      console.log("STEP 6 - in the getFollowerMedia");

      var extractCoordinates = function (err, medias, pagination, limit) {
        // console.log("STEP 6b - in the extractCoordinates");

        if(medias){
          var pureMedia = filterMedia(medias); // filters from the media just the media with Geo Locations.
          if(pureMedia){
            // create a follower with geo location data for that follower
            fb.child(userName).child('geoData').child(follower).child('data').push(pureMedia, function(){
            // check's for pagination and repeats the process.
              if (pagination && pagination.next) {
                pagination.next(extractCoordinates);
              } else {
                console.log("done with pagination of extractCoordinates for - "+ follower);
                followersCount++;
                fb.child(userName).child('geoData').child(follower).update({'status': 'complete'});
                fb.child(userName).child('geoData').child('followers').update({'followersDone': (followersCount)});
              }
            });
          } else {
            followersCount++;
            fb.child(userName).child('geoData').child(follower).update({'status': 'complete'});
            console.log("extractCoordinates did not find any geo media for - "+ follower);
          }
        } else {
          followersCount++;
          fb.child(userName).child('geoData').child(follower).update({'status': 'complete'});
          console.log("extractCoordinates had no media to extract for - "+ follower);
        }
      };

      ig.user_media_recent(follower, extractCoordinates);

      };

    // STEP 7 //
    // takes the media object that has pictures, and geolocation and returns an array of long, lat and mag.
    var filterMedia = function (feed) {
      console.log("STEP 7 - in the filterMedia");

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

    // STEP 1 //
    // created or overwrite existing folder structure
    console.log("STEP 1 - get followers list");
    ig.user_followers(id, paginationFollowers);  // Runs followers extrapolation

  });
  };
