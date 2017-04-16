/**
 * Created by Anwender on 15.04.2017.
 */
'use strict';

angular.module('myApp.editSong', ['ngRoute', 'ngNotify', 'ngMaterial'])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/editSong/:songID', {
            templateUrl: 'editSong/editSong.html',
            controller: 'editSongCtrl'
        });
    }])

    .controller('editSongCtrl', ['$scope', '$http', 'ngNotify', 'socketio', '$routeParams', function (scope, http, ngNotify, socket, routeParams) {
        var id = routeParams.songID;
        console.log(id);

        http.get('/api/v01/getSongById', {
            params: {'id': id}
        }).then(function (response) {
            scope.song = response.data;
            // console.log(response.data);
            // scope.$apply();
        }, function (e) {
            console.log("Error: Song by ID holen")
        });
        scope.saveSong = function () {
            // http.post('/api/v01/saveEditedSong', {
            http({
                url: '/api/v01/saveEditedSong',
                method: 'GET',
                params: {
                    id: id,
                    title: scope.song.title,
                    artist: scope.song.artist,
                    album: scope.song.album
                }

            }).then(function (response) {
                console.log(response.data);
                ngNotify.set('Saved changes!', {
                    type: 'success',
                    duration: 3000
                });
                // console.log(response.data);
                // scope.$apply();
            }, function (e) {
                console.log("Error: Song an Server senden")
                ngNotify.set('Something went wrong :(', {
                    type: 'error',
                    duration: 3000
                });
            });
        }

    }]);