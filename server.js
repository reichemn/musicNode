/**
 * Created by Anwender on 05.04.2017.
 */

//Todo: Song hochladen koennen
//Todo: Songinfos editieren koennen
//Todo: Now Playing sollte im Menue angezeigt werden, nicht in der aktuellen view
//Todo: Playlists


var player = require("./Player.js");
console.log("Player Imported");

var songbase = require("./Songbase.js");
songbase.load();
songbase.checkNewSongs();
//songbase.save();
console.log(songbase.getSongList());

var express = require('express');
var http = require('http').Server(app);

var app = express();

multiparty = require('connect-multiparty');
var multipartyMiddleware = multiparty();





// For debug
var morgan = require('morgan');
app.use(morgan('dev'));

var logger =require('morgan-body');

var bodyParser =require('body-parser');
app.use(bodyParser.json());

// hook logger to express app
logger(app);
// End debug


/*
 app.get('/api/play/:id',function (req, res) {
 player.play('./app/TheComplex.mp3', function(err){
 if (err){
 console.log("Error");
 throw err
 }

 });
 res.send("Ok");
 });
 */
app.post('/songUpload', multipartyMiddleware, function(req, res) {
    // We are able to access req.files.file thanks to
    // the multiparty middleware
    var file = req.files.file;
    console.log(file.name);
    console.log(file.type);
});

app.get('/songlist.json', function (req, res) {
    res.send(songbase.getSongList());
});


app.get('/api/v01/getSongQueue', function (req, res) {
    console.log(player.getQueue());
    res.send(player.getQueue());
});

app.get('/api/v01/getCurrentSong', function (req, res) {
    res.send(player.getCurrentSong());
});


app.use('/', express.static('app'));

var playSong = function (song) {
    console.log("Add Song to now playing: " + song.title);
    player.addSong(song);
};

var server = app.listen(8000, function () {
    console.log("Express server listening on port %d ", server.address().port);
});

var io = require('socket.io')(server);

player.setNextSongCallback(function (song) {
    song = song || null;
    console.log("event: " + song);
    io.emit('nowPlaying', song);
});

player.setQueueChangeCallback(function (queue) {
    //  console.log(queue);
    io.emit('event:songQueueChanged', queue);
});

io.on('connection', function (socket) {
    socket.on('command:addToQueue', function (songID) {
        var song = songbase.getSongByID(songID);
        // console.log('Play Song ' + songID+ ': '+song.title);
        playSong(song);
    });
    socket.on('command:removeFromQueue', function (queueID) {
        console.log("remove from queue: " + queueID);
        player.removeSongFromQueue(queueID);
    });
    socket.on('disconnect', function () {
        console.log('user disconnected!');
    });
    console.log('a user connected');
});




