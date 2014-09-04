//  app/instagramUtils.js

//  set up ======================================================================
var Firebase                  = require('firebase'),
    crypto                    = require('crypto'),
    request                   = require('request'),
    fb                        = new Firebase('https://fanscape.firebaseio.com/'),  // connects to Firebase.
    _                         = require('underscore');

//  ZERO = Get list of followed_by user =========================================
  var GET_followed_by         = function( fanscape_instagram_id, token, pagination, result, callback ) {
    // instagram header secret system
    var hmac = crypto.createHmac('SHA256', process.env.FANSCAPECLIENTSECRET);
        hmac.setEncoding('hex');
        hmac.write(process.env.LOCALIP);
        hmac.end();
    var hash = hmac.read();

    // Set the headers
    var headers = {
        'X-Insta-Forwarded-For': process.env.LOCALIP+'|'+hash
    }

    // Configure the request
    var options = {
        uri: 'https://api.instagram.com/v1/users/'+fanscape_instagram_id+'/followed-by',
        qs: {'access_token': token },
        method: 'GET',
        headers: headers,
    }

    if ( pagination ) {
      options.qs.cursor = pagination;
    }

    if ( !result ) {
      var result = [];
    }

    request(options, function (error, response, body) {
      console.log(body);
      var pbody = JSON.parse(body);
      if ( !error && response.statusCode == 200 ) {
        if ( pbody.data && pbody.data[0] ) {
          for ( var i = 0; i < pbody.data.length; i++ ) {
            result = result.concat( pbody.data[i].id );
          }

          if (pbody.pagination && pbody.pagination.next_cursor) {
            GET_followed_by( fanscape_instagram_id, token, pbody.pagination.next_cursor, result, callback);
          } else {
            console.log("done with pagination of GET_followed_by for user: "+fanscape_instagram_id);
            if ( callback ) {
              callback( result );
            }
          }
        }
      } else if (error) {
        console.log('GET_followed_by error ('+new_instagram_following_id+'): ', error);
      }
    });
    };

//  FIRST = landing page load on '/' ============================================
  exports.loadPage  = function(req, res) {
    res.render('./partials/login.ejs');
    };

//  SECOND = link to instagram API for access token =============================
  exports.authorize_user = function(req, res) {
    console.log("authorizing");
    var url = 'https://api.instagram.com/oauth/authorize/?client_id='+process.env.FANSCAPECLIENTID+'&redirect_uri='+process.env.INSURIREDIRECT+'&response_type=code&state=a%20state&scope=likes+comments+relationships';
    res.redirect(url);
    };

//  THIRD = handle instagram response and redirect to globe =====================
  exports.handleauth = function(req, res) {
    // queryCode           = req.query.code;
    // form data
    var data = { 'client_id' : process.env.FANSCAPECLIENTID,
                 'client_secret' : process.env.FANSCAPECLIENTSECRET,
                 'grant_type' : 'authorization_code',
                 'redirect_uri' : process.env.INSURIREDIRECT,
                 'code' : req.query.code
                };

    // configure the request
    var options = {
        uri: 'https://api.instagram.com/oauth/access_token',
        method: 'POST',
        form: data
    }

    // request for the token and data back
    request(options, function (error, response, body) {
      var pbody = JSON.parse(body);
      if (error) {
        console.log("Didn't work - most likely the Instagram secret key has been changed... For developer: Try rebooting the server. " + err.body);
        res.redirect('/404/');
        return;
      } else {
        fb.child( pbody.user.username ).child('userData').update({'name': pbody.user.full_name }, function(){
          // saves ID in /username/userData/ directory
          fb.child( pbody.user.username ).child('userData').update({'id': pbody.user.id }, function(){
            // saves token in /username/userData/ directory
            fb.child( pbody.user.username ).child('userData').update({'token': pbody.access_token }, function(){
              // saves queryCode in /username/userData/ directory
              fb.child( pbody.user.username ).child('userData').update({'queryCode': req.query.code }, function(){
                // saves profile picture in /username/userData/ directory
                fb.child( pbody.user.username ).child('userData').update({'profile_picture': pbody.user.profile_picture }, function(){
                  // temporary deletes original content to get cleaner load
                  fb.child( pbody.user.username ).update({'geoData': {}, 'pureData' : {} }, function(){
                    res.redirect('/globe?user='+pbody.user.username+'&id='+pbody.user.id);
                  });
                });
              });
            });
          });
        });
      }
    });
    };

//  TODO - CHECK IF USERNAME AND ID MATCH otherwise send to 404 page.
//  FOURTH = display user data if exists otherwise fetches it live ==============
  exports.fetchAllMedia = function(req, res) {

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
        tempTupple = theUrl.split("&");

        // check for a username and id value
        if (tempTupple.length !== 2){
          console.log("userName and/or id not defined");
          res.redirect('/404/');
          return;
        }

    var tempUser = tempTupple[0].split("="),
        tempId = tempTupple[1].split("="),
        userName = tempUser[1],
        id = tempId[1];

    // takes a snapshot of the user name data from database
    fb.child(userName).once('value', function(snapshot) {
    userSnapshot = snapshot.val();

    // check to see if there is a valid userName in database
    if (userSnapshot === null) {
      console.log("userName not found in database");
      res.redirect('/404/');
      return;
    }

    // check to see if there is a valid id in database
    if (userSnapshot.userData.id !== id){
      console.log("id not found in database");
      res.redirect('/404/');
      return;
    }

      res.render('./partials/globe.ejs');  // rendering ejs to html

    // STEP 2 //
    // if no followers director then go fetch it using getFollowerMedia
    var checkIfFollowerExist = function (follower){
      // console.log("STEP 2 - in the checkIfFollowerExist");

      // check if locations exists
      if (!userSnapshot){
        // console.log("since nothing existed creates media");
        GET_media(follower, userSnapshot.userData.token );
      } else if (!userSnapshot.geoData) {
        // console.log("since no geoData folder exist creates media");
        GET_media(follower, userSnapshot.userData.token );
      } else if (!userSnapshot.geoData[follower]){
        // console.log("since no follower specific folder exist creates media");
        GET_media(follower, userSnapshot.userData.token );
      } else if (!userSnapshot.geoData[follower].status){
        // console.log("since no follower status complete exist delete and then creates fresh media");
        fb.child(userName).child('geoData').child(follower).remove();
        GET_media(follower, userSnapshot.userData.token );
      } else {
        // console.log(follower+" already exist");
        followersCount++;
        fb.child(userName).child('pureData').child('followers').update({'followersDone': (followersCount)});
        fb.child(userName).child('geoData').child('followers').update({'followersDone': (followersCount)});
      }
      };

    // STEP 3 //
    var GET_media               = function( instagram_id, token, pagination, followersData, callback ) {
      // instagram header secret system
      var hmac = crypto.createHmac('SHA256', process.env.FANSCAPECLIENTSECRET);
          hmac.setEncoding('hex');
          hmac.write(process.env.LOCALIP);
          hmac.end();
      var hash = hmac.read();

      // Set the headers
      var headers = {
          'X-Insta-Forwarded-For': process.env.LOCALIP+'|'+hash
      }

      // Configure the request
      var options = {
          uri: 'https://api.instagram.com/v1/users/'+instagram_id+'/media/recent',
          qs: {'access_token': token },
          method: 'GET',
          headers: headers,
      }

      if ( pagination ) {
        options.qs.max_id = pagination;
      }

      if ( !followersData ) {
        var followersData = [];
      }

      request(options, function (error, response, body) {
        var pbody = JSON.parse(body);

        if(pbody.data){
          var pureMedia = filterMedia(pbody.data); // filters from the media just the media with Geo Locations.

          if(pureMedia.length > 1){
            // create a follower with geo location data for that follower
            fb.child(userName).child('geoData').child(instagram_id).child('data').push(pureMedia, function(){});
            followersData = followersData.concat(pureMedia);
          }
          // check's for pagination and repeats the process.
          if ( pbody.pagination && pbody.pagination.next_max_id ) {
            GET_media( instagram_id, token, pbody.pagination.next_max_id, followersData, callback);
          } else {
            // console.log("done with pagination of extractCoordinates for - "+ follower);
            followersCount++;

            //add followers data [lat, long, timestamp] to fullData [lat, long, mag] if followersData has stuff in it
            if(followersData.length > 1){
              var a = crossRef(followersData, 0.005);
              fullData = fullData.concat(a);

              // overwrite data in Firebase
              if( fullData ){
                fb.child(userName).child('pureData').update({'data': fullData});
              }

              fb.child(userName).child('pureData').child('followers').update({'followersDone': (followersCount)});
              fb.child(userName).child('geoData').child(instagram_id).update({'status': 'complete'});
              fb.child(userName).child('geoData').child('followers').update({'followersDone': (followersCount)});

              if ( callback ) {
                callback( followersData );
              }
            }
          }
        } else {
          followersCount++;
          fb.child(userName).child('pureData').child('followers').update({'followersDone': (followersCount)});
          fb.child(userName).child('geoData').child(instagram_id).update({'status': 'complete'});
          fb.child(userName).child('geoData').child('followers').update({'followersDone': (followersCount)});
        }
      });
      };

    // STEP 4 //
    // takes the media object that has pictures with geolocation data and returns an array of [lat, long, timestamp]
    var filterMedia = function (feed) {
      // console.log("STEP 4 - in the filterMedia");

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

    // STEP 5 //
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
      GET_followed_by( id, userSnapshot.userData.token, "", [], function( result ){
          if ( result.length > 168 ) {
            var count = 168;
          } else {
            var count = result.length;
          }
        fb.child(userName).child('geoData').child('followers').update({'totalFollowers': count}, function(){
          // adds the total number of followers fetched inside a pureData folder
          fb.child(userName).child('pureData').child('followers').update({'totalFollowers': count}, function(){
            // since no initial user found just creates all the data

            // goes through followers and see if they are already on the db

            for (var i = 0; i < count; i++){
              checkIfFollowerExist( result[i] );
            }
          });
        });
      } );
    });
  };
