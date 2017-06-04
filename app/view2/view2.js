'use strict';

angular.module('myApp.view2', ['ngRoute'])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/view2', {
            templateUrl: 'view2/view2.html',
            controller: 'View2Ctrl'
        });
    }])

    .controller('View2Ctrl', ['$scope', '$http','ngNotify', 'socketio', function (scope, http, ngNotify,socket) {
        /*
         http.get('api/v01/getSongQueue').success(function (data) {
         scope.changeQueue(data);
         //scope.$apply();
         });
         */
        scope.reorder = false;
        scope.selectedSongQueueID = -1;

        scope.selectSong = function(id){
            scope.selectedSongQueueID = id;
            scope.reorder = true;
        };

        scope.insertSong = function(id){
            if(scope.selectedSongQueueID !== -1 && id !== -1){
                changeSongPositionInQueue(scope.selectedSongQueueID, id);
            }
            scope.reorder = false;
        };

        var changeSongPositionInQueue = function (oldQueueID, newQueueID) {
            console.log("changeSongPositionInQueue old: "+oldQueueID+"  new: "+newQueueID);
            var songPositions = {
                oldQueueID:oldQueueID,
                newQueueID:newQueueID
            };
            socket.emit('command:reorderSongInQueue', songPositions);
            //Todo: pruefung ob Song wirklich verschoben wurde
            ngNotify.set('Song moved!', {
                type: 'success',
                duration: 3000
            });
        };

        http.get('api/v01/getSongQueue').then(function (response) {
            scope.changeQueue(response.data);
        }, function (e) {
            console.log("Error: Queue holen")
        });

        scope.changeQueue = function (queue) {
            scope.songQueue = queue;
        };
        //var socket = io();
        scope.removeFromQueue = function (id) {
            socket.emit("command:removeFromQueue", id);
            //Todo: pruefung ob Song wirklich entfernt wurde
            ngNotify.set('Song removed from queue!', {
                type: 'success',
                duration: 3000
            });
        };
        socket.on('event:songQueueChanged', function (data) {
            console.log("queue " + data);
            scope.changeQueue(data);
        });
    }]);