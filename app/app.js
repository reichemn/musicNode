'use strict';

// Declare app level module which depends on views, and components


console.log("app.js executed");

angular.module('myApp', [
    'ngRoute',
    'myApp.view1',
    'myApp.view2',
    'myApp.addSong',
    'myApp.editSong',
    'myApp.version'
])
    .factory('socketio', function () {
        // Globales SocketIo objekt erstellen
        var socket = io();
        socket.on('connect', function(){
            var sessionid = socket.io.engine.id;
            console.log("socket io ID: "+sessionid);
            socket.clientID = sessionid;
        });
        return socket;
    })
    .config(['$locationProvider', '$routeProvider', function ($locationProvider, $routeProvider) {
        $locationProvider.hashPrefix('!');

        $routeProvider.otherwise({redirectTo: '/view1'});
    }]);

