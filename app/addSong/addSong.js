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

                uploadUsing$http(file);

        };

        function uploadUsing$http(file) {
            file.upload = Upload.http({
                url: '/songUpload',
                method: 'POST',
                headers: {
                    'Content-Type': file.type
                },
                data: {file: file}
            });

            file.upload.then(function (response) {
                file.result = response.data;
            }, function (response) {
                if (response.status > 0)
                    $scope.errorMsg = response.status + ': ' + response.data;
            });

            file.upload.progress(function (evt) {
                file.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
            });
        }


    }]);