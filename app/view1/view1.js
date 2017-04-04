'use strict';

angular.module('myApp.view1', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/view1', {
    templateUrl: 'view1/view1.html',
    controller: 'View1Ctrl'
  });
}])

.controller('View1Ctrl', ['$scope','$http', function(scope, http) {
    var song1 = new Song(0,"test title","test interpret","test album",new SongImage(0,"http://kingofwallpapers.com/song/song-010.jpg","https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcR8x47T7Nr_A7F_tos3oKOB3K4DwzFD7ZcKizWmLMPIikNB56in4g"),null);
    var song2 = new Song(1,"Song 2","zweiter interpret","zweites album",new SongImage(1,null,null),null);
    var song3 = new Song(2,"Song 3","zweiter interpret","zweites album",new SongImage(2,"http://kingofwallpapers.com/song/song-001.jpg","https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcT8_SonIBak5_M_5V-IN6MSA2YRJR78X7pvw4hyVYioVwRKtaU-ew"),null);
  scope.allSongs = [song1,song2,song3];
  scope.playSong = function (id) {
    alert("Funktion nicht implementiert!");
      // Todo: Server kommunikation
  }

  scope.selectedFilter="all";
  scope.changeFilter = function () {
    //Todo: Suche sucht aktuell auch in der Url zum Bild, das sollte behoben werden.
    scope.query = {
      "title" : "",
      "artist" : "",
      "album" : ""
    };
      switch(scope.selectedFilter){
          case "all":
              scope.query= scope.queryInput;
            break;
          case "title":
            scope.query.title = scope.queryInput;
            break;
          case "album":
              scope.query.album = scope.queryInput;
            break;
          case "artist":
              scope.query.artist = scope.queryInput;
            break;
      }
  }
}]);