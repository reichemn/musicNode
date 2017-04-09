/**
 * Created by Anwender on 05.04.2017.
 */

//Todo: Song hochladen koennen
//Todo: Songinfos editieren koennen
//Todo: Now Playing sollte im Menue angezeigt werden, nicht in der aktuellen view
//Todo: Playlists


var player = require("./Player.js");
console.log("Player Imported");

for(i = 0; i< 3; i++){
    console.log("Z: "+i);
}

var songbase = require("./Songbase.js");
songbase.load();
songbase.checkNewSongs();
//songbase.save();
console.log(songbase.getSongList());

var express = require('express');
var http = require('http').Server(app);

var app = express();

// For debug
var morgan = require('morgan');
app.use(morgan('dev'));
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

app.get('/songlist.json',function (req, res) {
    res.send(songbase.getSongList());
});

app.get('/api/v01/getSongQueue',function (req, res) {
    console.log(player.getQueue());
    res.send(player.getQueue());
});

app.get('/api/v01/getCurrentSong',function (req, res) {
    res.send(player.getCurrentSong());
});


app.use('/', express.static('app'));

var playSong = function (song) {
    console.log("Add Song to now playing: "+song.title);
    player.addSong(song);
};

 var server = app.listen(8000, function(){
 console.log("Express server listening on port %d ", server.address().port);
 });

var io = require('socket.io')(server);

player.setNextSongCallback(function (song) {
    io.emit('nowPlaying',song);
});

player.setQueueChangeCallback(function (queue) {
  //  console.log(queue);
    io.emit('event:songQueueChanged',queue);
});

io.on('connection', function(socket){
    socket.on('command:addToQueue', function(songID){
        var song = songbase.getSongByID(songID);
       // console.log('Play Song ' + songID+ ': '+song.title);
        playSong(song);
    });
    socket.on('command:removeFromQueue', function(queueID){
        console.log("remove from queue: "+queueID);
       player.removeSongFromQueue(queueID);
    });
    socket.on('disconnect', function() {
        console.log('user disconnected!');
    });
    console.log('a user connected');
});




