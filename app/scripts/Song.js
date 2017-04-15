/**
 * Created by Anwender on 03.04.2017.
 */

/**
 *  Song Klasse
 * @param id eindeutige ID
 * @param title Title
 * @param artist Interpret
 * @param album Album Name
 * @param image SongImage Objekt, enthaelt pfade zu bildern
 * @param source Objekt wird fuer die wiedergabe verwendet
 * @constructor
 */
function Song(id, title, artist, album, image, source) {
    this.id = id;
    this.title = title;
    this.artist = artist;
    this.album = album;
    this.image = image;
    this.source = source;
}
