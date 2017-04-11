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
var HashMap = require('hashmap');
var SongClass = require("./app/scripts/Song.js");

//var songList = [];
var playlistList = [];
var songMap = new HashMap();
var load = function () {
    // Todo: ./songbase und ./songbase/import ./songbase/songs erstellen falls nicht vorhanden
    try {
        var obj = jsonfile.readFileSync(file);
        console.dir(obj);
        songMap = new HashMap();
        songMap.copy(obj.songMap);
        playlistList = obj.playlistList;
    }catch(err){
        // neue datei erstellen falls noch keine existiert
        save();
    }

    console.log("Songbase loaded.");
};

var save = function () {
    var obj = {"songMap": songMap, "playlistList": playlistList};
    jsonfile.writeFileSync(file, obj);
    console.log("Songbase saved.");
};

var getSongList = function () {
    return songMap.values();
};

var getPlaylistList = function () {
    return playlistList;
};

var checkNewSongs = function () {
    //Suche nach Audiodateien im import ordner
    walk(importFolder, function (err, results) {
        if (err) throw err;
        console.log(results);
        console.log("Anzahl: "+results.length);
        for (var i = 0; i < (results.length); i++) {
            console.log(i + " import: " + results[i]);
            importSong(results[i]);
            console.log("imported "+i);
        }
    });

};

var importSong;
importSong = function (songPath) {
    if (!isAudiofile(songPath)) {
        return;
    }
    var song = {
        "id": null,
        "title": null,
        "artist": null,
        "duration": null,
        "album": null,
        "image": null,
        "source": null
    };

    song.id = md5File.sync(songPath);

    //Pfad realtive zu ./ setzen
    songPath = path.relative('./', songPath);

    console.log("new Song Path: " + songPath);

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


    if (pathEqual) {
        for (var i = splitedImportPath.length; i < splitedSongPath.length; i++) {
            newSongPath = path.join(newSongPath, splitedSongPath[i]);
            // Ordner erstellen wenn ernicht existiert
            if (((i + 1) < splitedSongPath.length) && !(fs.existsSync(newSongPath))) {
                fs.mkdirSync(newSongPath);
            }
        }
    } else {
        newSongPath = path.join(newSongPath, path.basename(songPath));
    }
    console.log(newSongPath);

    song.source = {
        "type": "local",
        "path": newSongPath
    };


   // var tags = nodeID3.read(songPath);


    var mm = require('musicmetadata');

// create a new parser from a node ReadStream
    var fileStream = fs.createReadStream(songPath);
    var parser = mm(fileStream,{ duration: true }, function (err, tags) {
        if (err) throw err;
        if(tags.picture){
        //Todo: Bilder extrahieren
        //Todo: Thumbnail erzeugung
            /*
            if(tags.picture[0].format === "jpg"||tags.picture[0].format === "jpeg"){

            }else if(tags.picture[0].format === "png"){

            }
            */
        }
        fileStream.close();
        console.log(tags);
        song.title = tags.title || splitedSongPath[splitedSongPath.length-1];
        song.artist = tags.artist.join(', ') || "";
        song.album = tags.album || "";
        song.duration = tags.duration || null;
        console.log("id: " + song.id + ", Title: " + song.title + ", Album: " + song.album + ", Artist: " + song.artist + ", Lange: "+song.duration);

        fs.renameSync(songPath, newSongPath);

        addSong(song);
    });
/*
    console.log(tags);
    song.title = tags.title || splitedSongPath[splitedSongPath.length-1];
    song.artist = tags.artist || "";
    song.album = tags.album || "";
    song.length = tags.length || null;

    console.log("id: " + song.id + ", Title: " + song.title + ", Album: " + song.album + ", Artist: " + song.artist);
*/

    /*
    if(tags.image){
        var imagePath = newSongPath+"."+tags.image.mime;
        fs.writeFile(imagePath, tags.image.imageBuffer, 'binary', function(err) {
            if(err) throw err;
        });

        song.image = {
            "id" : null,
            "fullImagePath" : imagePath,
            "thumbnailPath": imagePath
        };
    }
*/
    /*
    //Song verschieben
    fs.renameSync(songPath, newSongPath);
    addSong(song);
    */
};

var addSong = function (song) {
    // songList.push(song);
    console.log("add song: " + song.title);
    songMap.set(song.id, song);
    save();

};

var getSongByID = function (songID) {
    return songMap.get(songID);
};

var replaceSong = function (song) {
    songMap.set(song.id, song);
};

var isAudiofile = function (filePath) {
    var extension = path.extname(filePath);
    for (var i = 0; i < audioFileExtensions.length; i++) {
        if (audioFileExtensions[i] === extension) {
            console.log(filePath + " is audio file");
            return true;
        }
    }
    console.log(filePath + " is NO audio file");
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
    "replaceSong": replaceSong

};