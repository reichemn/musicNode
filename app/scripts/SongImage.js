/**
 * Created by Anwender on 03.04.2017.
 */

/**
 * SongImage Klasse enthaelt den pfad zum Bild und zum Vorschaubild
 * @param id
 * @param fullImagePath
 * @param thumbnailPath
 * @constructor
 */
function SongImage(id, fullImagePath, thumbnailPath) {
    this.id = id;
    this.fullImagePath = fullImagePath;
    this.thumbnailPath = thumbnailPath;
}