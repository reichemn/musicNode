/**
 * Created by Anwender on 12.04.2017.
 */
'use strict';

angular.module('myApp.addSong', ['ngRoute', 'ngNotify'])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/addSong', {
            templateUrl: 'addSong/addSong.html',
            controller: 'addSongCtrl'
        });
    }])

    .controller('addSongCtrl', ['$scope', '$http', 'ngNotify', function (scope, http, ngNotify) {

        var selectedSong = null;
        scope.songValid = false;
        scope.setSong = function (element) {
            selectedSong = element.files[0];
            console.log(selectedSong);
            if (selectedSong != null) {
                scope.$apply(function () {
                    scope.songValid = true;
                })

            }else{
                scope.$apply(function () {
                    scope.songValid = false;
                })
            }
        };


        scope.startUpload = function () {
            if (selectedSong != null) {
                scope.uploadFile(selectedSong);
            }
        };

        scope.songUpload = {
            "result": null,
            "progress" : -1
        }

        scope.setProgress = function (value) {
            scope.songUpload.progress = value;
        };

        var client = null;

        scope.uploadFile = function uploadFile(file) {
            //Wieder unser File Objekt
            // var file = document.getElementById("fileA").files[0];
            //FormData Objekt erzeugen
            var formData = new FormData();
            //XMLHttpRequest Objekt erzeugen
            client = new XMLHttpRequest();

            //var prog = document.getElementById("progress");

            if (!file)
                return;

            // prog.value = 0;
            // prog.max = 100;

            //Fügt dem formData Objekt unser File Objekt hinzu
            formData.append("song", file);

            client.onerror = function (e) {
                ngNotify.set('Upload fehlgeschlagen.', {
                    type: 'error',
                    duration: 3000
                });
            };

            client.onload = function (e) {
                //document.getElementById("prozent").innerHTML = "100%";
                //prog.value = prog.max;
                console.log(this.responseText);
                ngNotify.set('Upload abgeschlossen.', {
                    type: 'success',
                    duration: 3000
                });
            };

            client.upload.onprogress = function (e) {
                var p = Math.round(100 / e.total * e.loaded);
                //document.getElementById("progress").value = p;
                //document.getElementById("prozent").innerHTML = p + "%";
                scope.setProgress(p);
            };

            client.onabort = function (e) {
                ngNotify.set('Upload abgebrochen.', {
                    type: 'warn',
                    duration: 3000
                });
            };

            client.open("POST", "songUpload");
            client.send(formData);
        };

    }]);