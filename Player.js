/**
 * Created by Anwender on 07.04.2017.
 */

var audioPlayer = require("play-sound")({"player": "./mpg123/mpg123.exe"});

var songQueue = [];
var playing = false;
var player = null;
var paused = false;
var currentSong = null;
var nextSongCallback = function (song) {
};

var addSong = function (song) {
    songQueue.push(song);
    //   paused = false;
    tick();
};

var setNextSongCallback = function (callback) {
    nextSongCallback = callback;
};

var pause = function () {
    if (player != null) {
        player.kill();
        player = null;
    }
    paused = true;
};

var resume = function () {
    paused = false;
    tick();
};

var getCurrentSong = function () {
    return currentSong;
};

var tick = function () {
    if (player == null && !paused) {
        var naechsterSong = songQueue.shift();
        if (naechsterSong) {
            play(naechsterSong);
        }
        nextSongCallback(naechsterSong);
    } else if (player == null) {
        currentSong = null;
    }
};

var play = function (song) {
    if (player != null) {
        player.kill();
    }
    // Hier Moeglichkeiten fuer andere datenquellen
    if (song.source.type === "local") {
        console.log('Play Song ' + song.id + ': ' + song.title);
        player = audioPlayer.play(song.source.path, function (err) {
            if (err) {
                console.log("Error");
                player = null;
                tick();
            }

        });
    }
    currentSong = song;
    currentSong.endTime = new Date().getTime() + (song.duration + 1) * 1000;
    setTimeout(function () {
        player.kill();
        player = null;
        tick();
    }, (song.duration + 1) * 1000);
};

module.exports = {
    "addSong": addSong,
    "setNextSongCallback": setNextSongCallback,
    "pause": pause,
    "resume": resume,
    "getCurrentSong":getCurrentSong
};