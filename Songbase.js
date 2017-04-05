/**
 * Created by Anwender on 05.04.2017.
 */

const importFolder = "./songbase/import";
const audioFileExtensions = [".mp3", ".aac"];
var jsonfile = require('jsonfile');
const fs = require('fs');
var path = require('path');
var file = './songbase/database.json';
const md5File = require('md5-file');
var id3 = require('id3js');
var HashMap = require('hashmap');

//var songList = [];
var playlistList = [];
var songMap = new HashMap();
var load = function () {
    jsonfile.readFilesync(file, function (err, obj) {
        console.dir(obj);
        songMap = obj.songMap;
        playlistList = obj.playlistList;
    });
    console.log("Songbase loaded.");
};

var save = function () {
    var obj = {"songMap": songMap, "playlistList": playlistList};
    jsonfile.writeFileSync(file, obj, function (err) {
        console.error(err);
    });
    console.log("Songbase saved.");
};

var getSongList = function () {
    return songMap.values();
};

var getPlaylistList = function () {
    return playlistList;
};

var checkNewSongs = function () {
    var audioFiles;
    //Suche nach Audiodateien im import ordner
    walk(importFolder, function (err, results) {
        if (err) throw err;
        console.log(results);
        audioFiles = results;
    });
    for (var i = 0; i < audioFiles.length; i++) {
        importSong(audioFiles[i]);
    }

};

var importSong;
importSong = function (songPath) {
    if (!isAudiofile(songPath)) {
        return;
    }
    var song = Song(null, null, null, null, null, null);
    md5File(songPath, function (err, hash) {
        if (err) {
            throw err;
        }
        song.id = hash;
    });

    id3({file: songPath, type: id3.OPEN_LOCAL}, function (err, tags) {
        // tags now contains your ID3 tags
        song.title = tags.title;
        song.artis = tags.artist;
        song.album = tags.album;
    });
    var splitedImportPath = path.normalize(importFolder).split(path.sep);
    var splitedSongPath = path.normalize(songPath).split(path.sep);
    var pathEqual = true;
    for (var i = 0; i < splitedImportPath.length; i++) {
        if (splitedImportPath[i] !== splitedSongPath[i]) {
            pathEqual = false;
        }
    }
    var newSongPath = "./songbase/songs";

    console.log("Import: " + splitedImportPath);
    console.log("Song: " + splitedSongPath);
    console.log(newSongPath);

    if (pathEqual) {
        for (var i = splitedImportPath.length; i < splitedSongPath.length; i++) {
            newSongPath = path.join(newSongPath, splitedSongPath[i]);
        }
    } else {
        newSongPath = path.join(newSongPath, path.basename(songPath));
    }

    fs.rename(songPath, newSongPath, function (err) {
        if (err) throw err;

    });
    song.source = {
        "type": "local",
        "path": newSongPath
    };
    addSong(song);
};

var addSong = function (song) {
    // songList.push(song);
    songMap.set(song.id, song);

};

var getSongByID = function (songID) {
    return songMap.get(songID);
};

var replaceSong = function (song) {
    songMap.set(song.id, song);
};

var isAudiofile = function (path) {
    // Todo: teste ob dateiendung stimmt
    var extension = path.extname(path);
    for (var i = 0; i < audioFileExtensions.length; i++) {
        if (audioFileExtensions[i] == extension) {
            return true;
        }
    }
    return false;
};

var walk = function (dir, done) {
    var results = [];
    fs.readdir(dir, function (err, list) {
        if (err) return done(err);
        var i = 0;
        (function next() {
            var file = list[i++];
            if (!file) return done(null, results);
            file = path.resolve(dir, file);
            fs.stat(file, function (err, stat) {
                if (stat && stat.isDirectory()) {
                    walk(file, function (err, res) {
                        results = results.concat(res);
                        next();
                    });
                } else {
                    results.push(file);
                    next();
                }
            });
        })();
    });
};

module.exports = {
    "load": load,
    "save": save,
    "getSongList": getSongList,
    "getPlaylistList": getPlaylistList,
    "checkNewSongs": checkNewSongs,
    "getSongByID": getSongByID,
    "replaceSong" : replaceSong

};