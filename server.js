/**
 * Created by Anwender on 05.04.2017.
 */


//Todo: Songverwaltung
//Todo: Now Playing sollte im Menue angezeigt werden, nicht in der aktuellen view
//Todo: Playlists


var player = require("play-sound")({"player" : "./mpg123/mpg123.exe"});
console.log("Player Imported");


var songbase = require("./Songbase.js");


var express = require('express');
var http = require('http').Server(app);

var app = express();

// For debug
var morgan = require('morgan');
app.use(morgan('dev'));
// End debug

app.get('/api/play/:id',function (req, res) {
    player.play('./app/TheComplex.mp3', function(err){
        if (err){
            console.log("Error");
            throw err
        }

    });
    res.send("Ok");
});
app.use('/', express.static('app'));



 var server = app.listen(8000, function(){
 console.log("Express server listening on port %d ", server.address().port);
 });

var io = require('socket.io')(server);

io.on('connection', function(socket){
    socket.on('command:play', function(songID){

        // Todo: funktion getSong(songID) um song zu bekommen
        var song = {"title":""};
        switch (songID){
            case 0:
             song.title = "test title";
            break;
            case 1:
             song.title = "Song 2";
             break;
            case 2:
             song.title ="Song 3";
             break;
        }
        console.log('Play Song ' + songID+ ': '+song.title);
        io.emit('nowPlaying',song.title.toString());
    });
    console.log('a user connected');
});
