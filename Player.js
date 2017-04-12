/**
 * Created by Anwender on 07.04.2017.
 */

//var audioPlayer = require("play-sound")({"player": "./mpg123/mpg123.exe"});
var audioPlayer = require("play-sound")({"player": "./mplayer/mplayer.exe"});

var songQueue = [];
var playing = false;
var player = null;
var paused = false;
var currentSong = null;
// queueID ist forlaufende Nummer um Songs innerhalb der Queue eindeutig zu identifizieren
var queueID = 0;
var currentSongTimeout;
var killFlag = false;
var nextSongCallback = function (song) {
};
var queueChangeCallback = function (queue) {

};


var getQueue = function () {
    // Aktuell spielender Song wird an erster Stelle des zurueckgebenen Arrays angefuegt
    var currentSongArray = [];
    if (currentSong != null) {
        currentSongArray.push(currentSong);
    }
    return currentSongArray.concat(songQueue);
};

var removeSongFromQueue = function (id) {
    if (currentSong != null && currentSong.queueID == id) {
        stop();
        return true;
    }
    for (var i = 0; i < songQueue.length; i++) {
        if (songQueue[i].queueID === id) {
            songQueue.splice(i, 1);
            queueChangeCallback(getQueue());
            return true;
        }
    }
    return false;
};

var addSong = function (song) {
    song.queueID = queueID;
    queueID++;
    songQueue.push(song);
    queueChangeCallback(getQueue());
    //   paused = false;
    tick();
};

/**
 *
 * @param callback  Funktion wird aufgerufen wenn die Wiedergabe startet
 */
var setNextSongCallback = function (callback) {
    nextSongCallback = callback;
};

var pause = function () {
    if (player != null) {
        stop();
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

/**
 * Prueft ob ob aktuell ein Song laeuft und ob startet ggf. den naechsten Song
 */
var tick = function () {
    if (player == null && !paused) {
        var naechsterSong = songQueue.shift();
        if (naechsterSong!=null) {
            play(naechsterSong);
        }
        queueChangeCallback(getQueue());
        nextSongCallback(naechsterSong);
    } else if (player == null) {
        currentSong = null;
    }
};


var play = function (song) {
    if (player != null) {
        stop();
    }
    // Hier Moeglichkeiten fuer andere datenquellen
    if (song.source.type === "local") {
        console.log('Play Song ' + song.id + ': ' + song.title);
        player = audioPlayer.play(song.source.path,{"./mplayer/mplayer.exe":['-really-quiet']}, function (err) {
            if (err) {
                console.log("Player Error: " + err);
                //player.kill();
                //player = null;
                //tick();
            } else {
                console.log("song fertig");
            }

            if (currentSongTimeout != null) {
                clearTimeout(currentSongTimeout);
            }
            if (player != null) {
                console.log("kill " + currentSong.title);
                player.kill();
                player = null;

            }
            currentSong = null

            tick();

        });
    }
    currentSong = song;
    currentSong.endTime = new Date().getTime() + (song.duration ) * 1000;
    // currentSongTimeout = setTimeout(function () {
    //     if (currentSongTimeout != null) {
    //         clearTimeout(currentSongTimeout);
    //     }
    //     if (player != null) {
    //         console.log("kill " + currentSong.title);
    //         player.kill();
    //         player = null;
    //
    //     }
    //     currentSong = null;
    //     tick();
    // }, (song.duration + 1) * 1000);
};

/**
 *
 * @param callback wird aufgerufen wenn sich die songQueue veraendert
 */
var setQueueChangeCallback = function (callback) {
    queueChangeCallback = callback;
}

/**
 * Stopt die aktuelle Wiedergabe
 */
var stop = function () {
    if (player != null) {
        console.log("kill " + currentSong.title);
        player.kill();
        player = null;

    }
    currentSong = null;
    //tick();
};

module.exports = {
    "addSong": addSong,
    "setNextSongCallback": setNextSongCallback,
    "pause": pause,
    "resume": resume,
    "getCurrentSong": getCurrentSong,
    "getQueue": getQueue,
    "removeSongFromQueue": removeSongFromQueue,
    "setQueueChangeCallback":setQueueChangeCallback
};