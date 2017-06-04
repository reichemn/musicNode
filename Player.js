'use strict';
/**
 * Created by Anwender on 07.04.2017.
 */

//var audioPlayer = require("play-sound")({"player": "./mpg123/mpg123.exe"});
if (process.platform === 'win32') {
    var audioPlayer = require("play-sound")({"player": "./mplayer/mplayer.exe"});
} else {
    var audioPlayer = require("play-sound")({"player": "mplayer"});
}

var songQueue = [];
var playing = false;
var player = null;
var paused = false;
// queueID ist forlaufende Nummer um Songs innerhalb der Queue eindeutig zu identifizieren
var queueID = 1;
var currentSongTimeout;
var killFlag = false;
var nextSongCallback = function (song) {
};
var queueChangeCallback = function (queue) {

};


var getQueue = function () {
    // Aktuell spielender Song wird an erster Stelle des zurueckgebenen Arrays angefuegt
    return songQueue;
};

var removeSongFromQueue = function (id) {
    if (songQueue.length > 0 && songQueue[0].queueID == id) {
        stop();
        return true;
    }
    var idx = getIndexFromQueueID(id);
    if (idx >= 0) {
        songQueue.splice(idx, 1);
        queueChangeCallback(getQueue());
        return true;
    }


    return false;
};

var changeQueuePosition = function (oldQueueID, newQueueID) {
    var idxOld = getIndexFromQueueID(oldQueueID);
    console.log("idxOld: " + idxOld);
    var songToMove;
    if ((getIndexFromQueueID(newQueueID) === -1 && newQueueID !== 0) || idxOld === -1) {
        //ziel oder quelle exisitiert nicht
        return false;
    } else if ((oldQueueID === newQueueID) || (idxOld === 0 && newQueueID === 0)) {
        // old und new sind gleiche Position in queue
        return true;
    }
    // zuverschiebender Song war in songQueue
    songToMove = songQueue[idxOld];
    songQueue.splice(idxOld, 1);
    if (newQueueID === 0) {
        // song als nowPlaying einfuegen
        songQueue.splice(1, 0, songToMove,songQueue[0]);
    } else {
        //Song in die queue einfuegen
        var idxNew = getIndexFromQueueID(newQueueID);
        console.log("idxNew: " + idxNew);
        songQueue.splice(idxNew + 1, 0, songToMove);
    }
    if (getIndexFromQueueID(oldQueueID) === 0 || newQueueID === 0) {
        //durch stop wird queueChange callback aufgerufen
        stop();
    } else {
        // sonst selbst callback aufrufen
        queueChangeCallback(getQueue());
    }
    return true;

};
var getIndexFromQueueID = function (qID) {
    for (var i = 0; i < songQueue.length; i++) {
        if (songQueue[i].queueID === qID) {
            return i;
        }
    }
    return -1;
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
    return songQueue[0];
};

/**
 * Prueft ob ob aktuell ein Song laeuft und ob startet ggf. den naechsten Song
 */
var tick = function () {
    if (player == null && !paused) {
        //var naechsterSong = songQueue.shift();
        if (songQueue.length > 0) {
            // songQueue.splice(0,0,naechsterSong);
            play(songQueue[0]);
        }
        queueChangeCallback(getQueue());
        nextSongCallback(songQueue[0]);
    } else if (player == null) {
        //currentSong = null;
    }
};


var play = function (song) {
    if (player != null) {
        stop();
    }
    // Hier Moeglichkeiten fuer andere datenquellen
    if (song.source.type === "local") {
        console.log('Play Song ' + song.id + ': ' + song.title);
        player = audioPlayer.play(song.source.path, {"./mplayer/mplayer.exe": ['-really-quiet']}, function (err) {
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
                console.log("kill " + songQueue[0].title);
                player.kill();
                player = null;

            }
            //currentSong = null;
            songQueue.shift();

            tick();

        });
    }
    //currentSong = song;
    songQueue[0].endTime = new Date().getTime() + (song.duration ) * 1000;
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
};

/**
 * Stopt die aktuelle Wiedergabe
 */
var stop = function () {
    if (player != null) {
        console.log("kill " + songQueue[0].title);
        player.kill();
        player = null;

    }
    //currentSong = null;
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
    "setQueueChangeCallback": setQueueChangeCallback,
    "changeQueuePosition": changeQueuePosition
};