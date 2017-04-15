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

var multer = require('multer')
var upload = multer({dest: 'uploads/'})


// For debug
var morgan = require('morgan');
app.use(morgan('dev'));
// End debug

app.post('/songUpload', upload.single('song'), function (req, res, next) {
    // req.file is the `avatar` file
    // req.body will hold the text fields, if there were any
    console.log("upload: " + req.file.originalname);
    var clientID = req.body.clientID;
    console.log("Client id: " + clientID);
    songbase.importUploadedSong(req.file.path, req.file.originalname, function (song) {
        io.to(clientID).emit('event:songImported', song);
    });
    res.send("ok");

});

app.get('/api/v01/saveEditedSong',function (req, res, next) {
    //console.log(req);
    var songChanges = req.query;
    if (songChanges) {
        var song = songbase.getSongByID(songChanges.id);
        if (songChanges.title != null && songChanges.title !== "") {
            song.title = songChanges.title;
        }
        if (songChanges.artist != null && songChanges.artist !== "") {
            song.artist = songChanges.artist;
        }
        if (songChanges.album != null && songChanges.album !== "") {
            song.album = songChanges.album;
        }
        songbase.overrideSong(song);


        res.send("ok");
    } else {
        res.status(400);
        res.send("error");
    }
});

app.get('/songlist.json', function (req, res) {
    res.send(songbase.getSongList());
});


app.get('/api/v01/getSongQueue', function (req, res) {
    console.log(player.getQueue());
    res.send(player.getQueue());
});

app.get('/api/v01/getSongById', function (req, res) {
    var id = req.query.id;
    if (id != null) {
        var song = songbase.getSongByID(id);
        res.send(song);
    } else {
        res.send(null);
    }
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
    io.emit('nowPlaying', player.getCurrentSong());
    console.log('a user connected');
});




