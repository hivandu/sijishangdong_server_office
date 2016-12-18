var express = require('express'),
    app = express(),
    MongoClient = require('mongodb');
var server = require("http").Server(app);
var socket = require("socket.io").listen(server);

server.listen(188, '120.26.48.94');
console.log('Server running at 120.26.48.94:188');

//  connect to mongo
MongoClient.connect('mongodb://localhost:27017/sijishangdong_office', function (err, db) {
    if (err) throw err;
	console.log('connected to mongo');

    var ticketIdList = null;

    db.collection('idlist').find({'idlist': {$exists: 1}}).toArray(function (err, docs) {
        ticketIdList = docs[0]['idlist'];
    });

    /** socket on */
        // Run the server
    init();

    // Initialization
    function init() {
        setEventHandlers();
    }

    // Event handlers
    function setEventHandlers() {
        // Socket.IO
        socket.on("connection", onSocketConnection);
    }


    // New socket connection
    function onSocketConnection(socket) {
        console.log('Someone comes here!!!!');

        socket.on('choujiang', onChoujiangHandler);
        socket.on('userinfo', onGetUserInfoHandler);

        function onChoujiangHandler (socket) {
            var that = this;
            var result = '';

            console.log('someone join to this game');

            db.collection('visitedNumber').update({"visitedNumber": {$exists: 1}}, {$inc: {"visitedNumber": 1}});

            var visitedNumber = null;

            db.collection("visitedNumber").find({"visitedNumber": {$exists: 1}}).toArray(function (err, docs) {
				if (err) throw err;
                visitedNumber = docs[0]['visitedNumber'];

                if (visitedNumber > 2400) {
                    //  return false
                    console.log(visitedNumber  + ':' + 10086);
                    result = 10086;
                } else {
                    var isGetGift = false;

                    for (var i = 0; i < ticketIdList.length; i++) {
                        //console.log(visitedNumber, ":::::" , ticketIdList[i]);
                        if (visitedNumber == ticketIdList[i]) {
                            isGetGift = true;
                            break;
                        }
                    }

                    if (isGetGift) {
                        console.log(visitedNumber  + ':' + 200);
                        result = 200;
                    } else {
                        console.log(visitedNumber  + ':' + 10010);
                        result = 10010;
                    }
                }

                //  return result
                that.emit('gameresult', {"result": result});
            });
        }

        function onGetUserInfoHandler (data) {
            console.log("Some one post they info...:", data);
            var userInfo = data;

            //  check is two parameters empty
            if (!userInfo.username || !userInfo.phone) {
                console.log('err');
            } else {
                console.log(userInfo.username, userInfo.phone);
                //  insert data to database
                db.collection('userInfo').insert(userInfo, function (err, data) {

                });
            }

            this.emit('storeduser', {"result": true});
        }
    }
});

