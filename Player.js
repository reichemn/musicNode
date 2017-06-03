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
var currentSong = null;
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
    var idx = getIndexFromQueueID(id);
    if (idx === -1) {
        return false;
    }
    songQueue.splice(idx, 1);
    queueChangeCallback(getQueue());
    return true;
};

var getIndexFromQueueID = function (qID) {
    for (var i = 0; i < songQueue.length; i++) {
        if (songQueue[i].queueID === id) {
            return i;
        }
    }
    return -1;
};

/**
 * Veraendert die Position eines Songs in der Queue.
 * @param oldQueueID ID des zu verschiebenden Songs
 * @param newQueueID {> 0} unter diesen Song er eingefuegt
 * @param newQueueID {= 0} song wird direkt gespielt.
 * @returns {boolean} true wenn erfolgreich, sonst false
 */
var changeQueuePosition = function (oldQueueID, newQueueID) {
    var idxOld = getIndexFromQueueID(oldQueueID);
    var songToMove = null;
    var songIsPlaying = false;
    if(getIndexFromQueueID(newQueueID) === -1 && newQueueID !== 0){
        //ziel exisitiert nicht
        return false;
    }else if(idxOld == getIndexFromQueueID(newQueueID)){
        // old und new sind gleiche Position in queue
        return true;
    }
    if (idxOld === -1) {
        if (currentSong != null && currentSong.queueID == oldQueueID) {
            // zuverschiebender Song laeuft schon
            songIsPlaying = true;
            songToMove = currentSong;
        } else {
            // zuverschiebender Song existiert nicht
            return false;
        }
    } else {
        // zuverschiebender Song war in songQueue
        songToMove = songQueue[idxOld];
        songQueue.splice(idxOld, 1);
    }
    if (newQueueID === 0) {
        // song als nowPlaying einfuegen
        if(songToMove === currentSong){
            // old und new war gleich und laueft schon
            return true;
        }
        play(songToMove);
        songIsPlaying = false;
    } else {
        //Song in die queue einfuegen
        var idxNew = getIndexFromQueueID(newQueueID);
        songQueue.splice(idxNew, 0, songToMove);
    }
    if(songIsPlaying){
        //durch stop wird queueChange callback aufgerufen
        stop();
    }else{
        // sonst selbst callback aufrufen
        queueChangeCallback(getQueue());
    }

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

/**
 * Untested?
 */
var pause = function () {
    if (player != null) {
        stop();
        player = null;
    }
    paused = true;
};

/**
 * Untested?
 */
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
        if (naechsterSong != null) {
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
                console.log("kill " + currentSong.title);
                player.kill();
                player = null;

            }
            currentSong = null;

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
};

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
    "setQueueChangeCallback": setQueueChangeCallback,
    "changeQueuePosition" : changeQueuePosition
};