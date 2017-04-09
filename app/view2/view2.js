'use strict';

angular.module('myApp.view2', ['ngRoute'])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/view2', {
            templateUrl: 'view2/view2.html',
            controller: 'View2Ctrl'
        });
    }])

    .controller('View2Ctrl', ['$scope', '$http', function (scope, http) {
        http.get('api/v01/getSongQueue').success(function (data) {
            scope.changeQueue(data);
            //scope.$apply();
        });
        scope.changeQueue = function (queue) {
            scope.songQueue = queue;
        };
        var socket = io();
        scope.removeFromQueue = function (id) {
            socket.emit("command:removeFromQueue", id);
        };
        socket.on('event:songQueueChanged', function (data) {
            console.log("queue " + data);
            scope.changeQueue(data);
        });
    }]);