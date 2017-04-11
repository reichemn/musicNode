'use strict';

angular.module('myApp.view1', ['ngMaterial','ngRoute'])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/view1', {
            templateUrl: 'view1/view1.html',
            controller: 'View1Ctrl'
        });
    }])

    .controller('View1Ctrl', ['$scope', '$http', '$filter', '$interval', function (scope, http, filter, interval) {
        /*
         var song1 = new Song(0,"test title","test interpret","test album",new SongImage(0,"http://kingofwallpapers.com/song/song-010.jpg","https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcR8x47T7Nr_A7F_tos3oKOB3K4DwzFD7ZcKizWmLMPIikNB56in4g"),null);
         var song2 = new Song(1,"Song 2","zweiter interpret","zweites album",new SongImage(1,null,null),null);
         var song3 = new Song(2,"Song 3","zweiter interpret","zweites album",new SongImage(2,"http://kingofwallpapers.com/song/song-001.jpg","https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcT8_SonIBak5_M_5V-IN6MSA2YRJR78X7pvw4hyVYioVwRKtaU-ew"),null);
         scope.allSongs = [song1,song2,song3];
         */
        // Songlist vom Server holen
        http.get('songlist.json').success(function (data) {
            scope.allSongs = data;
            scope.changeFilter();
            // scope.$apply();
        });
        scope.addSongToQueue = function (id) {
            socket.emit("command:addToQueue", id);
        };
        //Socket io
        var socket = io();
        http.get("api/v01/getCurrentSong").success(function (data) {
            scope.changeCurrentSong(data);
        });
        scope.timeLeft = {
            "min": "",
            "sec": ""
        };
        var countdownCtrl;
        scope.changeCurrentSong = function (data) {
            if (data && data != null) {
                scope.playingSong = data;
                if(data.endTime) {
                    countdownCtrl = interval(function () {
                        var distance = scope.playingSong.endTime - new Date().getTime();
                        if (distance < -1) {
                            scope.timeLeft = {
                                "percent": 0,
                                "min": "",
                                "sec": ""
                            };
                            scope.changeCurrentSong(null);
                            interval.cancel(countdownCtrl);
                           // scope.playingSong = {"title": "none"};
                            return;
                        }
                        var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                        var seconds = Math.floor((distance % (1000 * 60)) / 1000);
                        minutes = ("00" + minutes).substr(-2, 2);
                        seconds = ("00" + seconds).substr(-2, 2);
                        scope.timeLeft = {
                            "percent": ((1-((distance/1000)/scope.playingSong.duration))*100),
                            "min": minutes,
                            "sec": seconds
                        };
                        // console.log("min "+minutes+" sec "+seconds);
                    }, 1000);
                }

            } else {
                scope.playingSong = {"title": "none"};
                interval.cancel(countdownCtrl);
                scope.timeLeft = {
                    "min": "",
                    "sec": ""
                };
                if(!scope.$$phase) {
                    scope.$apply();
                }
            }
           // scope.changeFilter();

        };

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
                        return song.title.indexOf(scope.queryInput || '') !== -1 || song.artist.indexOf(scope.queryInput || '') !== -1 || song.album.indexOf(scope.queryInput || '') !== -1;
                        break;
                    case "title":
                        return song.title.indexOf(scope.queryInput || '') !== -1;
                        break;
                    case "album":
                        return song.album.indexOf(scope.queryInput || '') !== -1;
                        break;
                    case "artist":
                        return song.artist.indexOf(scope.queryInput || '') !== -1;
                        break;
                }
            };

            scope.filteredSongs = filter('filter')(scope.allSongs, songFilterFunction, scope.queryInput);
        }
    }]);