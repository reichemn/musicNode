'use strict';

angular.module('myApp.view1', ['ngMaterial', 'ngRoute', 'ngNotify'])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/view1', {
            templateUrl: 'view1/view1.html',
            controller: 'View1Ctrl'
        });
    }])

    .controller('View1Ctrl', ['$scope', '$http', '$filter', '$interval', 'ngNotify', 'socketio', function (scope, http, filter, interval, ngNotify, socket) {
        /*
         var song1 = new Song(0,"test title","test interpret","test album",new SongImage(0,"http://kingofwallpapers.com/song/song-010.jpg","https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcR8x47T7Nr_A7F_tos3oKOB3K4DwzFD7ZcKizWmLMPIikNB56in4g"),null);
         var song2 = new Song(1,"Song 2","zweiter interpret","zweites album",new SongImage(1,null,null),null);
         var song3 = new Song(2,"Song 3","zweiter interpret","zweites album",new SongImage(2,"http://kingofwallpapers.com/song/song-001.jpg","https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcT8_SonIBak5_M_5V-IN6MSA2YRJR78X7pvw4hyVYioVwRKtaU-ew"),null);
         scope.allSongs = [song1,song2,song3];
         */
        // Songlist vom Server holen
        http.get('songlist.json').then(function (response) {
            scope.allSongs = response.data;
            scope.changeFilter();
            // scope.$apply();
        }, function (e) {
            console.log("Error: Songlist holen")
        });
        /*
         http.get('songlist.json').success(function (data) {
         scope.allSongs = data;
         scope.changeFilter();
         // scope.$apply();
         });
         */
        scope.addSongToQueue = function (id) {
            socket.emit("command:addToQueue", id);
            //Todo: Pruefung ob der Song wirklich der Queue hinzugefuegt wurde.
            ngNotify.set('Song added to queue!', {
                type: 'success',
                duration: 3000
            });
        };

        http.get('api/v01/getCurrentSong').then(function (response) {
            scope.changeCurrentSong(response.data);
        }, function (e) {
            console.log("Error: Current Song holen")
        });

        //Socket io
        //var socket = io();
        /*    http.get("api/v01/getCurrentSong").success(function (data) {
         scope.changeCurrentSong(data);
         });

         */
        scope.timeLeft = {
            "min": "",
            "sec": ""
        };
        var countdownCtrl;
        scope.changeCurrentSong = function (data) {
            if (data && data != null) {
                scope.playingSong = data;
                if (data.endTime) {
                    countdownCtrl = interval(function () {
                        var distance = scope.playingSong.endTime - new Date().getTime();
                        if (distance < -1) {
                            scope.timeLeft = {
                                "percent": 100,
                                "min": "",
                                "sec": "",
                                "h": ""
                            };
                            scope.changeCurrentSong(null);
                            interval.cancel(countdownCtrl);
                            // scope.playingSong = {"title": "none"};
                            return;
                        }
                        var houre = Math.floor((distance % (1000 * 60 * 60 * 60)) / (1000 * 60 * 60));
                        var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                        var seconds = Math.floor((distance % (1000 * 60)) / 1000);
                        minutes = ("00" + minutes).substr(-2, 2);
                        seconds = ("00" + seconds).substr(-2, 2);

                        scope.timeLeft = {
                            "percent": ((1 - ((distance / 1000) / scope.playingSong.duration)) * 100),
                            "min": minutes,
                            "sec": seconds,
                            "h":houre
                        };
                        // console.log("min "+minutes+" sec "+seconds);
                    }, 100);
                }

            } else {
                scope.playingSong = {"title": "none"};
                interval.cancel(countdownCtrl);
                scope.timeLeft = {
                    "min": "",
                    "sec": ""
                };
                if (!scope.$$phase) {
                    scope.$apply();
                }
            }
            // scope.changeFilter();

        };
        scope.queryInput = "";
        socket.on('nowPlaying', function (data) {
            console.log("data " + data);
            scope.changeCurrentSong(data);
        });
        // Filter fuer die Songsuche
        scope.filteredSongs = filter('filter')(scope.allSongs, scope.queryInput);
        scope.selectedFilter = "all";
        scope.changeFilter = function () {

            var songFilterFunction = function (song) {

                switch (scope.selectedFilter) {
                    case "all":
                        var hasTitle = false;
                        if (song.title) {
                            hasTitle = song.title.toLowerCase().indexOf(scope.queryInput.toLocaleLowerCase() || '') !== -1;
                        }
                        var hasArtist = false;
                        if (song.artist) {
                            hasArtist = song.artist.toLowerCase().indexOf(scope.queryInput.toLowerCase() || '') !== -1;
                        }
                        var hasAlbum = false;
                        if (song.album) {
                            hasAlbum = song.album.toLowerCase().indexOf(scope.queryInput.toLowerCase() || '') !== -1;
                        }
                        return hasTitle || hasArtist || hasAlbum;
                        break;
                    case "title":
                        var hasTitle = false;
                        if (song.title) {
                            hasTitle = song.title.toLowerCase().indexOf(scope.queryInput.toLowerCase() || '') !== -1;
                        }
                        return hasTitle;
                        break;
                    case "album":
                        var hasAlbum = false;
                        if (song.album) {
                            hasAlbum = song.album.toLowerCase().indexOf(scope.queryInput.toLowerCase() || '') !== -1;
                        }
                        return hasAlbum;
                        break;
                    case "artist":
                        var hasArtist = false;
                        if (song.artist) {
                            hasArtist = song.artist.toLowerCase().indexOf(scope.queryInput.toLowerCase() || '') !== -1;
                        }
                        return hasArtist;
                        break;
                }
            };

            scope.filteredSongs = filter('filter')(scope.allSongs, songFilterFunction, scope.queryInput);
        }
    }]);