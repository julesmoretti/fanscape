##GIT WORKFLOW

#INITIAL SET UP
#add remote to original git repo
  git remote add upstream https://github.com/PickleApp/pickle-frontend.git

#ROUTINE FLOW
#commit your files
  git add .
  git commit

#get the latest data from Source
  git pull --rebase upstream master

#check if in rebase branch still
  # if so

#check for conflict
  git status

#find files and modify those

#if any modify those

#git add the files modified
  git add XXX/XXX/X.XX

#if you commited here you will need to roll back to your previous commit
  git reset --soft 'HEAD^'

#then finish rebase
  git rebase --continue

#create a new branch
  git checkout -b newBranchName

#to go back to other branch
  git checkout master
OR
  git checkout otherBranch

#to revert back changes made to a dingle file
  git checkout filename

# delete a file for good
  git add --all

##FRESH INSTALL
  git clone https://github.com/PickleApp/pickle-frontend.git
  sudo npm install
  bower install
  grunt --force
  grunt serve
  grunt platform:add:ios
  grunt build --force
  grunt cordova
  grunt emulate:ios


##GRUNT WORKFLOW
  grunt build --force
  grunt cordova
  grunt emulate:ios




## once set
#install npm

$ npm init
$ npm install express --save
$ npm install underscore --save
$ npm install morgan --save
$ npm install body-parser --save


## then

nodemon server.js


Express is the framework.
Ejs is the templating engine.
Mongoose is object modeling for our MongoDB database.
Passport stuff will help us authenticating with different methods.
Connect-flash allows for passing session flashdata messages.
Bcrypt-nodejs gives us the ability to hash the password. I use bcrypt-nodejs instead of bcrypt since it is easier to set up in windows.

// 476580534 = reem

// search username property id === 571377691
// ig.user_search('jonathan reem', function(err, users, limit) {
//   console.log(users);
// });

// spits out personal details
// ig.user('571377691', function(err, result, limit) {
//   console.log(result);
// });

// spits out all personal 20 feeds... id
// ig.user_self_feed([], function(err, medias, pagination, limit) {
//   console.log(medias, 'message');
//   // console.log()
// });

// ig.user_self_media_recent([200], function(err, medias, pagination, limit) {
//   console.log(medias);
// });


//spits out a list of user followers aka friends under id properties.
// ig.user_followers('571377691', function(err, users, pagination, limit) {
//   console.log(pagination);
// });

//937838680  nina leonard friend id from followers.
// ig.user_media_recent('571377691', [], function(err, medias, pagination, limit) {
//   // console.log(pagination);
// });











  // var userListAll = function (err, users, pagination, limit) {
  //   followers = followers.concat(_.pluck(users, 'id'));
  //   if (pagination && pagination.next) {
  //     pagination.next(userList);
  //   } else {
  //     console.log("userList done");
  //     if(cap !== 0 ){
  //       followersCount = cap;
  //     } else {
  //       followersCount = followers.length - 1;
  //     }
  //     if(followersCount){
  //       //check if user already extracted if so count minus one and repeat else continue
  //       fb.child(userName).on('value', function(snapshot) {
  //         console.log(followers[followersCount]);
  //         // var tempfollowerxyz = child('locations').child(date).followers[followersCount];

  //         // if(snapshot.val().locations[date].followers[followersCount]) {
  //         if(snapshot.val().locations) {
  //           // var currentStatus = JSON.stringify(snapshot.val().tempfollowerxyz);
  //           // console.log('The follower exist and its status is: ' + currentStatus);
  //           console.log('The locations exist');

  //           //check for today's date:
  //           if(snapshot.val().locations[date]){
  //             console.log("date exist");
  //             console.log(followersCount, "initial followerCount");
  //             //check if follower exist
  //             while (followersCount !== 0 ){
  //               if (!snapshot.val().locations[date][followers[followersCount]] || snapshot.val().locations[date][followers[followersCount]].status === "started"){
  //               console.log("Inside the while");
  //               console.log(followers[followersCount]);
  //               ig.user_media_recent(followers[followersCount], extractCoordinates);
  //               }
  //               followersCount--;
  //               console.log("Reducing Followers");
  //             }
  //             console.log("Out of while");
  //             // if(snapshot.val().locations[date][followers[followersCount]]) {
  //             //   console.log("follower "+followers[followersCount]+" exist");
  //             //   // ig.user_media_recent(followers[followersCount], extractCoordinates);
  //             //   // check if follower extrapolation is complete.


  //             //   // if(snapshot.val().locations[date][followers[followersCount]].status === "started") {
  //             //   //   console.log("status started");
  //             //   //   fb.child(userName).child('locations').child(date).child(followers[followersCount]).remove(function(){
  //             //   //     ig.user_media_recent(followers[followersCount], extractCoordinates);
  //             //   //   });
  //             //   // } else if (snapshot.val().locations[date][followers[followersCount]].status === "completed") {
  //             //   //   console.log("status completed");

  //             //   // }
  //             // } else {
  //             //   console.log("follower "+followers[followersCount]+" does not exist");
  //             //   ig.user_media_recent(followers[followersCount], extractCoordinates);
  //             // }

  //           } else {
  //             console.log("date does not exist");
  //             ig.user_media_recent(followers[followersCount], extractCoordinates);
  //           }
  //         } else {
  //           console.log('The locations does not exist');
  //           // console.log(followers[followersCount], " < followers count");
  //           ig.user_media_recent(followers[followersCount], extractCoordinates);
  //         }
  //         // console.log(snapshot.val().child(followers[followersCount]), "snapshot val");
  //       });
  //     } else {
  //       console.log("No followers!");
  //     }
  //   }
  // };


    // Extrapolates all users followers ID
  var userListAll = function (err, users, pagination, limit) {
    paginationFollowers(err, users, pagination, limit);
    console.log(followers);
    console.log("userListAll");
    return;
    // followers = followers.concat(_.pluck(users, 'id')); // keeps adding to followers variable list of followers ID
    // check for pagination next and keeps running
    // if (pagination && pagination.next) {
      // pagination.next(userListAll);
    // }
    // } else {
    //   console.log("userList done");
    //   if(cap !== 0 ){
    //     followersCount = cap;
    //   } else {
    //     followersCount = followers.length - 1;
    //   }
    //   if(followersCount){
    //     //check if user already extracted if so count minus one and repeat else continue
    //     fb.child(userName).on('value', function(snapshot) {
    //       console.log(followers[followersCount]);
    //       // var tempfollowerxyz = child('locations').child(date).followers[followersCount];

    //       // if(snapshot.val().locations[date].followers[followersCount]) {
    //       if(snapshot.val().locations) {
    //         // var currentStatus = JSON.stringify(snapshot.val().tempfollowerxyz);
    //         // console.log('The follower exist and its status is: ' + currentStatus);
    //         console.log('The locations exist');

    //         //check for today's date:
    //         if(snapshot.val().locations[date]){
    //           console.log("date exist");
    //           console.log(followersCount, "initial followerCount");
    //           //check if follower exist
    //           while (followersCount !== 0 ){
    //             if (!snapshot.val().locations[date][followers[followersCount]] || snapshot.val().locations[date][followers[followersCount]].status === "started"){
    //             console.log("Inside the while");
    //             console.log(followers[followersCount]);
    //             ig.user_media_recent(followers[followersCount], extractCoordinates);
    //             }
    //             followersCount--;
    //             console.log("Reducing Followers");
    //           }
    //           console.log("Out of while");
    //           // if(snapshot.val().locations[date][followers[followersCount]]) {
    //           //   console.log("follower "+followers[followersCount]+" exist");
    //           //   // ig.user_media_recent(followers[followersCount], extractCoordinates);
    //           //   // check if follower extrapolation is complete.


    //           //   // if(snapshot.val().locations[date][followers[followersCount]].status === "started") {
    //           //   //   console.log("status started");
    //           //   //   fb.child(userName).child('locations').child(date).child(followers[followersCount]).remove(function(){
    //           //   //     ig.user_media_recent(followers[followersCount], extractCoordinates);
    //           //   //   });
    //           //   // } else if (snapshot.val().locations[date][followers[followersCount]].status === "completed") {
    //           //   //   console.log("status completed");

    //           //   // }
    //           // } else {
    //           //   console.log("follower "+followers[followersCount]+" does not exist");
    //           //   ig.user_media_recent(followers[followersCount], extractCoordinates);
    //           // }

    //         } else {
    //           console.log("date does not exist");
    //           ig.user_media_recent(followers[followersCount], extractCoordinates);
    //         }
    //       } else {
    //         console.log('The locations does not exist');
    //         // console.log(followers[followersCount], " < followers count");
    //         ig.user_media_recent(followers[followersCount], extractCoordinates);
    //       }
    //       // console.log(snapshot.val().child(followers[followersCount]), "snapshot val");
    //     });
    //   } else {
    //     console.log("No followers!");
    //   }
    // }
  };