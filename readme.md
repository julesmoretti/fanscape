##GIT WORKFLOW

#INITIAL SET UP
#add remote to original git repo
  git remote add upstream https://github.com/PickleApp/pickle-frontend.git

  <!-- git remote add upstream https://github.com/hackreactor/alumni-app.git -->

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


 added API keys into
 source ~/.zshrc;

