/**
 * Created by Anwender on 12.04.2017.
 */
'use strict';

angular.module('myApp.addSong', ['ngRoute','ngNotify','ngFileUpload'])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/addSong', {
            templateUrl: 'addSong/addSong.html',
            controller: 'addSongCtrl'
        });
    }])

    .controller('addSongCtrl', ['$scope', '$http','ngNotify','Upload', function ($scope, http,ngNotify,Upload) {

        $scope.uploadPic = function (file) {
            $scope.formUpload = true;
            if (file != null) {
                $scope.upload(file);
            }
        };

        $scope.upload = function (file, resumable) {
            $scope.errorMsg = null;

            //    uploadUsing$http(file);
            $scope.uploadFile(file);

        };

        $scope.setProgress = function (value) {
            $scope.picFile.progress = value;
        };

        var client = null;

        $scope.uploadFile = function uploadFile(file)
        {
            //Wieder unser File Objekt
           // var file = document.getElementById("fileA").files[0];
            //FormData Objekt erzeugen
            var formData = new FormData();
            //XMLHttpRequest Objekt erzeugen
            client = new XMLHttpRequest();

            //var prog = document.getElementById("progress");

            if(!file)
                return;

           // prog.value = 0;
           // prog.max = 100;

            //Fügt dem formData Objekt unser File Objekt hinzu
            formData.append("song", file);

            client.onerror = function(e) {
                alert("onError");
            };

            client.onload = function(e) {
                //document.getElementById("prozent").innerHTML = "100%";
                //prog.value = prog.max;
                ngNotify.set('Upload abgeschlossen.', {
                    type: 'success',
                    duration: 3000
                });
            };

            client.upload.onprogress = function(e) {
                var p = Math.round(100 / e.total * e.loaded);
                //document.getElementById("progress").value = p;
                //document.getElementById("prozent").innerHTML = p + "%";
                $scope.setProgress(p);
            };

            client.onabort = function(e) {
                alert("Upload abgebrochen");
            };

            client.open("POST", "songUpload");
            client.send(formData);
        };

    }]);