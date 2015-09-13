/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


# Dump of table mazepa_alb_gal
# ------------------------------------------------------------

DROP TABLE IF EXISTS `mazepa_alb_gal`;

CREATE TABLE `mazepa_alb_gal` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `aid` int(11) DEFAULT NULL,
  `gid` int(11) DEFAULT NULL,
  `order` int(11) DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;



# Dump of table mazepa_albums
# ------------------------------------------------------------

DROP TABLE IF EXISTS `mazepa_albums`;

CREATE TABLE `mazepa_albums` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `owner` int(11) DEFAULT NULL COMMENT 'Владелец',
  `title` text,
  `desc` text,
  `privacy` int(1) DEFAULT '2' COMMENT 'Приват / По ссылке / Публична — 0/1/2 ',
  `order` int(11) DEFAULT NULL,
  `secret` varchar(13) DEFAULT '' COMMENT 'Секретный код альбома',
  PRIMARY KEY (`id`),
  KEY `owner` (`owner`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;



# Dump of table mazepa_bookmark
# ------------------------------------------------------------

DROP TABLE IF EXISTS `mazepa_bookmark`;

CREATE TABLE `mazepa_bookmark` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `uid` int(11) DEFAULT NULL,
  `aid` int(11) DEFAULT NULL,
  `order` int(11) DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `uid` (`uid`),
  KEY `aid` (`aid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;



# Dump of table mazepa_colors
# ------------------------------------------------------------

DROP TABLE IF EXISTS `mazepa_colors`;

CREATE TABLE `mazepa_colors` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `media` int(11) DEFAULT NULL,
  `color` varchar(6) CHARACTER SET utf8 DEFAULT NULL,
  `val` int(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `media` (`media`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;



# Dump of table mazepa_comments
# ------------------------------------------------------------

DROP TABLE IF EXISTS `mazepa_comments`;

CREATE TABLE `mazepa_comments` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `media` int(11) DEFAULT NULL,
  `owner` int(11) DEFAULT NULL,
  `text` text,
  `date` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;



# Dump of table mazepa_exifo
# ------------------------------------------------------------

DROP TABLE IF EXISTS `mazepa_exifo`;

CREATE TABLE `mazepa_exifo` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `File Size` text,
  `File Access Date/Time` text,
  `File Type` text,
  `MIME Type` text,
  `Camera Model Name` text,
  `Software` text,
  `Modify Date` text,
  `Artist` text,
  `Compression` text,
  `X Resolution` text,
  `Y Resolution` text,
  `Exposure Program` text,
  `ISO` text,
  `Exposure Compensation` text,
  `Max Aperture Value` text,
  `Flash` text,
  `White Balance` text,
  `Focus Mode` text,
  `Quality` text,
  `Field Of View` text,
  `Focal Length` text,
  `Exposure Mode` text,
  `Focal Length In 35mm Format` text,
  `Date/Time Original` text,
  `Aperture` text,
  `Auto Focus` text,
  `Image Size` text,
  `Color Space` text,
  `F Number` text,
  `Daylight Savings` text,
  `Vignette Control` text,
  `Lens Type` text,
  `Lens` text,
  `GPS Latitude` text,
  `GPS Longitude` text,
  `GPS Position` text,
  `GPS Altitude` text,
  `Encoding Process` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;



# Dump of table mazepa_friends
# ------------------------------------------------------------

DROP TABLE IF EXISTS `mazepa_friends`;

CREATE TABLE `mazepa_friends` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `uid` int(11) DEFAULT NULL,
  `sid` varchar(40) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `uid` (`uid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;



# Dump of table mazepa_gallery
# ------------------------------------------------------------

DROP TABLE IF EXISTS `mazepa_gallery`;

CREATE TABLE `mazepa_gallery` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `owner` int(11) DEFAULT '0',
  `url` varchar(300) COLLATE utf8_unicode_ci DEFAULT NULL,
  `title` text COLLATE utf8_unicode_ci,
  `desc` text COLLATE utf8_unicode_ci,
  `privacy` int(1) DEFAULT '1' COMMENT 'Приват / По ссылке / Публична — 0/1/2 ',
  PRIMARY KEY (`id`),
  UNIQUE KEY `url` (`url`),
  KEY `owner` (`owner`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;



# Dump of table mazepa_invite
# ------------------------------------------------------------

DROP TABLE IF EXISTS `mazepa_invite`;

CREATE TABLE `mazepa_invite` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `user` int(11) DEFAULT NULL COMMENT 'Автор приглашения',
  `code` text COMMENT 'Хэш картинки',
  `src` text COMMENT 'Адрес картинки',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;



# Dump of table mazepa_invites
# ------------------------------------------------------------

DROP TABLE IF EXISTS `mazepa_invites`;

CREATE TABLE `mazepa_invites` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `user` int(11) DEFAULT '0' COMMENT 'Запросил приглашение',
  `inviter` int(11) DEFAULT '0' COMMENT 'Пригласил',
  `text` text COMMENT 'Комментарий запросившего',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;



# Dump of table mazepa_media
# ------------------------------------------------------------

DROP TABLE IF EXISTS `mazepa_media`;

CREATE TABLE `mazepa_media` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `owner` int(11) NOT NULL,
  `title` text COLLATE utf8_unicode_ci NOT NULL,
  `album` int(11) DEFAULT '0' COMMENT 'Id альбома {0} - импорт, {-1} - корзина',
  `date` datetime DEFAULT NULL,
  `order` int(11) DEFAULT '0',
  `color` varchar(6) COLLATE utf8_unicode_ci DEFAULT 'ffffff',
  `src_main` varchar(128) COLLATE utf8_unicode_ci DEFAULT NULL,
  `src_large` varchar(128) COLLATE utf8_unicode_ci DEFAULT NULL,
  `src_medium` varchar(128) COLLATE utf8_unicode_ci DEFAULT NULL,
  `src_small` varchar(128) COLLATE utf8_unicode_ci DEFAULT NULL,
  `src_mini` varchar(128) COLLATE utf8_unicode_ci DEFAULT NULL,
  `src_thumb` varchar(128) COLLATE utf8_unicode_ci DEFAULT NULL,
  `src_xthumb` varchar(128) COLLATE utf8_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `owner` (`owner`),
  KEY `album` (`album`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;



# Dump of table mazepa_public
# ------------------------------------------------------------

DROP TABLE IF EXISTS `mazepa_public`;

CREATE TABLE `mazepa_public` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `owner` int(11) DEFAULT NULL COMMENT 'Автор',
  `alb` int(11) DEFAULT NULL COMMENT 'Альбом',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;



# Dump of table mazepa_session
# ------------------------------------------------------------

DROP TABLE IF EXISTS `mazepa_session`;

CREATE TABLE `mazepa_session` (
  `uid` int(11) unsigned NOT NULL,
  `key` varchar(40) DEFAULT NULL,
  PRIMARY KEY (`uid`),
  KEY `uid` (`uid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;



# Dump of table mazepa_social
# ------------------------------------------------------------

DROP TABLE IF EXISTS `mazepa_social`;

CREATE TABLE `mazepa_social` (
  `sid` varchar(40) NOT NULL DEFAULT '',
  `owner` int(11) DEFAULT NULL,
  `token` varchar(255) DEFAULT NULL,
  `name` text COMMENT 'Полное имя',
  `image` text COMMENT 'Фотография',
  `picture` text COMMENT 'Миниатюрка фотографии',
  `date` datetime DEFAULT NULL COMMENT 'Время изменений',
  PRIMARY KEY (`sid`),
  KEY `sid` (`sid`),
  KEY `owner` (`owner`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;



# Dump of table mazepa_tags
# ------------------------------------------------------------

DROP TABLE IF EXISTS `mazepa_tags`;

CREATE TABLE `mazepa_tags` (
  `aid_sid` varchar(55) NOT NULL DEFAULT '',
  `sid` varchar(40) DEFAULT NULL,
  `aid` int(11) DEFAULT NULL,
  `active` int(1) DEFAULT '1',
  `ignore` int(1) DEFAULT '0' COMMENT 'Не показывать отмеченному эту метку',
  PRIMARY KEY (`aid_sid`),
  KEY `aid` (`aid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;



# Dump of table mazepa_userinfo
# ------------------------------------------------------------

DROP TABLE IF EXISTS `mazepa_userinfo`;

CREATE TABLE `mazepa_userinfo` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `level` int(1) DEFAULT '0' COMMENT 'Уровень доступа',
  `name` text COMMENT 'Полное имя',
  `text` text COMMENT 'Себяхвалилка-текст',
  `cover` text COMMENT 'Задняя суперобложка',
  `username` varchar(300) DEFAULT NULL COMMENT 'Логин',
  `ip` varchar(10) DEFAULT NULL COMMENT 'Последний IP',
  `agent` text COMMENT 'Последний UserAgent',
  `date` datetime DEFAULT NULL COMMENT 'Время изменений',
  `inviter` int(11) DEFAULT NULL COMMENT 'Пригласил на сайт',
  PRIMARY KEY (`id`),
  KEY `id` (`id`),
  KEY `username` (`username`(255))
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

LOCK TABLES `mazepa_userinfo` WRITE;
/*!40000 ALTER TABLE `mazepa_userinfo` DISABLE KEYS */;

INSERT INTO `mazepa_userinfo` (`id`, `level`, `name`, `text`, `cover`, `username`, `ip`, `agent`, `date`, `inviter`)
VALUES
	(1,2,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL);

/*!40000 ALTER TABLE `mazepa_userinfo` ENABLE KEYS */;
UNLOCK TABLES;



/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
