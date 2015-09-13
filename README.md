# Mazepa

Система управления веб-фотогалереями (Nginx, MySQL, PHP5). 

![Как это выглядит](https://raw.githubusercontent.com/latur/Mazepa/master/static/img/demo.jpg)

## Установка на примере Ubuntu

Предполагается, что у вас уже поднят сервер на Nginx, запущен MySQL и PHP5. В противном случе, есть подробно описанная их установка [здесь](https://www.digitalocean.com/community/tutorials/how-to-install-linux-nginx-mysql-php-lemp-stack-on-ubuntu-12-04).

### Автоматическая установка

**Внимание!** Не используйте этот метод, если у вас уже есть своя конфигурация сервера на Nginx.
Или сделайте резервную копию следующих файлов, ибо во время этой установки они будут перезаписаны.

```
/etc/nginx/nginx.conf
/etc/nginx/sites-enabled/default.conf
/etc/php5/fpm/php.ini
```
Команды выполняются от `sudo`. Здесь во второй строчке `batman` — имя нового пользователя, `bat-site.com` — имя сайта. Вписать свои, разумеется:

```bash
curl -s https://mazepa.us/exe/ubuntu-install.sh > install.sh && chmod +x install.sh
./install.sh batman bat-site.com
```

### Пошаговая установка

Для корректной работы требуются приложения `git`, `convert` для создания миниатюрок к фотографиям, `exiftool` для быстрого чтения meta информации фотографий и `jpegoptim` для оптимизации картинок и ускорения их загрузки:

*Команды выполняются с приставкой `sudo`*

```bash
apt-get install git jpegoptim exiftool imagemagick
```

Создание отдельного пользователя для директории сайта и выгрузка кода:

```bash
useradd developer -m -G www-data
cd /home/developer/ 
mkdir logs www
git clone https://github.com/latur/Mazepa.git www
```

Изменение прав. Пользователь, от которого работает веб-сервер (в данном случае `www-data`) должен иметь доступ к директории сайта

```bash
find /home/developer/www/ -type d -exec chmod 770 {} +
find /home/developer/www/ -type f -exec chmod 660 {} +
chown -R developer:www-data /home/developer/www/
```

Требуется создать нового пользователя и базу данных. Например, через терминал (вписать свои `DBNAME` `PWD` `USR`):

```bash
echo "CREATE DATABASE \`DBNAME\` DEFAULT CHARACTER SET \`utf8\`;" > /tmp/insert.sql
echo "CREATE USER 'USR'@'localhost' IDENTIFIED BY 'PWD';" >> /tmp/insert.sql
echo "GRANT ALL PRIVILEGES ON \`DBNAME\` . * TO 'USR'@'localhost';" >> /tmp/insert.sql
mysql -u root -p < /tmp/insert.sql
```

Если вы используете **PhpMyAdmin** или иной инструмент работы с **Mysql**, можете воспользоваться им.

Установка завершается в браузере [http://localhost/install.php](http://localhost/install.php).<br>
Потребуется ввести данные для связи с mysql и свой логин/пароль.


## Благодарности
Разработана с использованием:

 > PhotoSwipe Default UI - 4.0.0 - 2014-12-08 <br>
   [http://photoswipe.com](http://photoswipe.com)

 > ImageMagick <br>
   [http://imagemagick.org](http://www.imagemagick.org/)

 > QR code generator (by Kang Seonghoon) <br>
   [https://github.com/lifthrasiir/qr.js](https://github.com/lifthrasiir/qr.js)

 > JShrink <br>
   [https://github.com/tedious/JShrink](https://github.com/tedious/JShrink/)

 > Full Screen Vertical Scroller <br>
   [https://github.com/lukesnowden/FSVS](https://github.com/lukesnowden/FSVS)

 > jQuery File Upload Plugin 5.26 <br>
   [https://github.com/blueimp/jQuery-File-Upload](https://github.com/blueimp/jQuery-File-Upload)

 > jQuery Iframe Transport Plugin 1.6.1 <br>
   [https://github.com/blueimp/jQuery-File-Upload](https://github.com/blueimp/jQuery-File-Upload)

 > jQuery UI - v1.11.1 - 2014-08-23 <br>
   [http://jqueryui.com](http://jqueryui.com)

 > Fontello — icon fonts generator <br>
   [http://fontello.com](http://fontello.com)
