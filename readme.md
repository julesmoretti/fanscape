<img src="https://m1.behance.net/rendition/modules/119960595/hd/e6fffbaa77f46ab67a5ce8701a8dac29.png" width=100% alt="dust mite">
FanScape showcases one's follower collection of Geo-Tagged photos on a map by popularity.

[TOC]

#**(SERVER)** - Digital Ocean Droplet
Digital Ocean is your phisical server host, that you can set up to run simultaneously to run your express server, databases and multiple websites all in one droplet!

Sign up online through [digitalocean.com][digitalocean]

Some advantages to using Digital Ocean Server's:

- SSD drives for fast read and write
- Multiple locations around the world
- Clean UI

##Setting up server side gitHub workflow
The following steps will allow you to push your GitHub project from your local machine straight to the server.

This is a summary from: [How To Set Up Automatic Deployment with Git with a VPS][DO git deployment]

After setting up your droplet. Make sure to SSH into your droplet.

In Terminal of your local machine:
```
ssh root@123.456.789.000
```
*Make sure to have your root password handy too*

---
####Creating a repo directory on the server
Before you can use git commands on your server you will need to install git on Hiruku using:
```
apt-get update
apt-get install git
```
Once you have done so you can follow the next steps
```
cd /var
mkdir repo && cd repo
mkdir fanscape.git && cd fanscape.git
git init --bare
```

####Creating a hook to automatically deploy from server to server www directory
```
cd hooks
cat > post-receive
```
your nor editing the file **post-receive**
```
#!/bin/sh
git --work-tree=/var/www/fanscape.io --git-dir=/var/repo/fanscape.git checkout -f
```
Once you are done press **'control-d'** to save. Then the following command sets up the correct permissions.
```
chmod +x post-receive
```
---
##Local machine set up to push to the server
Still within your terminal while still ssh'ing to your server, type the following to get back to your terminal local access.

```
exit
```

If needed create a new repo by doing the following:
```
cd /my/workspace
mkdir project && cd project
git init
```

otherwise navigate to a repo you want to push to your server and add this:

```
git remote add live ssh://root@123.456.789.000/var/repo/fanscape.git
```
From now on you can simply run the following commend to depploy to your server.
```
git push live master
```
And your done it should be on your server!

---
##Server side dependency installation
Your server currently has a git repo that has pushed to your www folder the repo files over, but none of the dependencies are there.

In order to get the dependencies to be deployed you will need to install npm by running the following command:
```
apt-get install npm
apt-get install nodejs
```
Once npm has been successfully installed in **/var/www/fanscape.io** folder run the following command:
```
npm i
```

At this point all dependencie that is npm related should be installed

---
##Server side environment variables
Still on your server, type in:
```
vi /etc/environment
```
You are now editing the environment file. To edit the text press **i** key and add the relevant variables for exemple:

```
FANSCAPECLIENTID=abc123efg456hij789klm...
FANSCAPECLIENTSECRET=abc123efg456hij789klm...
INSURIREDIRECT='http://somecallback/auth/instagram/callback'
PORT=1234
```
Once you are done press **esc** key and **shift + z** twice to get back out of the file.

Once you have done so reinitiate the file by running:
```
source /etc/environment
```
You can then test to see if your environmental variable files are working by typing:
```
echo $FANSCAPECLIENTID
```
*To get: abc123efg456hij789klm...*

```
echo $FANSCAPECLIENTSECRET
```
*To get: abc123efg456hij789klm...*
```
echo $INSURIREDIRECT
```
*To get: 'http://somecallback/auth/instagram/callback'*
```
echo $PORT
```
*To get: 1234*

If you do get these results then you have successfully set up your environmental variables.

---

##HTTP server addressing

Install on the server:
```
apt-get install nginx
```
And then:
```
sudo service nginx start
```
Now if you go to the server IP address you should see an Nginx landing page. In order to point Nginx to your local server we must do the following configurations.

Set up a domain.

```
cd /etc/nginx/sites-available/
```
Then in the directory you will see using the **ls** command a default file. Copy it and rename in the same directory but as **fanscape.io** using:
```
cp -i default fanscape.io
```
Then edit the file using:
```
vi fanscape.io
```
Once in there hit the **i** key to insert text or prior to doing so you can press twice **d** key to delete row, and **u** to undo. And make sure the file looks like this:
```
# You may add here your
# server {
#       ...
# }
# statements for each of your virtual hosts to this file

##
# You should look at the following URL's in order to grasp a solid understanding
# of Nginx configuration files in order to fully unleash the power of Nginx.
# http://wiki.nginx.org/Pitfalls
# http://wiki.nginx.org/QuickStart
# http://wiki.nginx.org/Configuration
#
# Generally, you will want to move this file somewhere, and start with a clean
# file but keep this around for reference. Or just disable in sites-enabled.
#
# Please see /usr/share/doc/nginx-doc/examples/ for more detailed examples.
##

server {
        listen 80;
        server_name fanscape.io;
        access_log /var/log/nginx/fanscape.io.access.log;
        location / {
                proxy_pass http://127.0.0.1:9000;
        }
}
```
You will see that we create a log file **/var/log/nginx/fanscape.io.access.log** that keeps track of nginx interactions.

If you ever need to clear the content of this file just run:
```
> /var/log/nginx/fanscape.io.access.log
```

Now there is one last step to point to the right directory.

Navigate to:
```
cd /etc/nginx/sites-enabled/
```
The following command will create an alias over to the file you created above. Followed by removing the default alias and rebooting your server.
```
ln -s /etc/nginx/sites-available/fanscape.io /etc/nginx/sites-enabled/fanscape.io
rm default
reboot
```
You will get kicked off your server, so log back into it and navigate to **/var/www/fanscape.io/**. Once there run the following command to start your node server
```
nodejs server.js
```
You should see the server starting successfully on port whatever configured...
Then to validate, go to your IP address on a browser to see FanScape in action.

----------

##Some additional setup files...
This file is designed to autostart the nodejs server on server load, though it is not working quite yet...

In the directory **/etc/init.d/** there should be a file called **node-app**, if not then you should create one using:
```
touch node-app
```

And then edit it by using:

```
vi node-app
```
The content of the file should look like this:

```
#!/bin/sh

NODE_ENV="production"
NODE_APP='server.js'
APP_DIR='/var/www/fanscape.io';
CONFIG_DIR=$APP_DIR/config
PORT=9000
NODE_EXEC=`which node`

###############

# REDHAT chkconfig header

# chkconfig: - 58 74
# description: node-app is the script for starting a node app on boot.
### BEGIN INIT INFO
# Provides: node
# Required-Start:    $network $remote_fs $local_fs
# Required-Stop:     $network $remote_fs $local_fs
# Default-Start:     2 3 4 5
# Default-Stop:      0 1 6
# Short-Description: start and stop node
# Description: Node process for app
### END INIT INFO

start_app (){
    if [ -f $PID_FILE ]
    then
        echo "$PID_FILE exists, process is already running or crashed"
        exit 1
    else
        echo "Starting node app..."
        PORT=$PORT NODE_ENV=$NODE_ENV NODE_CONFIG_DIR=$CONFIG_DIR $NODE_EXEC $APP_DIR/$NODE_APP  1>$LOG_FILE 2>&1 &
        echo $! > $PID_FILE;
    fi
}

stop_app (){
    if [ ! -f $PID_FILE ]
    then
        echo "$PID_FILE does not exist, process is not running"
        exit 1
    else
        echo "Stopping $APP_DIR/$NODE_APP ..."
        echo "Killing `cat $PID_FILE`"
        kill `cat $PID_FILE`;
        rm -f $PID_FILE;
        echo "Node stopped"
    fi
}

case "$1" in
    start)
        start_app
    ;;

    stop)
        stop_app
    ;;

    restart)
        stop_app
        start_app
    ;;

    status)
        if [ -f $PID_FILE ]
        then
            PID=`cat $PID_FILE`
            if [ -z "`ps ef | awk '{print $1}' | grep "^$PID$"`" ]
            then
                echo "Node app stopped but pid file exists"
            else
                echo "Node app running with pid $PID"

            fi
        else
            echo "Node app stopped"
        fi
    ;;

    *)
        echo "Usage: $0 {start|stop|restart|status}"
        exit 1
    ;;
esac
```

---