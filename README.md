# Mazepa

Система управления веб-фотогалереями (MySQL, PHP5). 

![Как это выглядит](https://raw.githubusercontent.com/latur/Mazepa/master/static/img/demo.jpg)



## Глоссарий

**Фотографии** — корректные файлы форматов: jpeg, png, gif, tiff, psd, bmp, nef, raw, raf, cr2, orf, dng. Фотографии загружаются через веб-интерфейс, автоматически помещаются в папку «Импорт». Создаются копии изображения: 1600px, 1200px (галерейные), 600px (мобильные), 240x240 (миниатюра), 80x80px. Из фотографии извлекаются основные преобладающие цвета (палитра), данные мета-тегов, и сохраняются в базе данных.

**Альбом** — способ организации фотографий. Всякая фотография всегда принадлежит определённому альбому. Папка «Импорт» и «Корзина» — своеобразные системные альбомы.
У каждого альбома (помимо системных) есть собственное название, описание, ссылка. 

Альбом имеет 4 варианта настроек приватности:

 1. Закрыт. Альбом и его фотографии доступны только автору альбома.
 2. По ссылке. Альбом открыт, но доступен только по прямой ссылке.
 3. Открыт. Альбом виден всем, обращение к нему возможно без специальной ссылки.
 4. Публичен. Альбом открыт, публикуется на персональной странице.

**Галерея** — способ систематизации альбомов. Альбомы группируются пользователем в галереи, каждая из которых имеет уникальную ссылку в поддомене основного сайта. Галерея имеет название, описание. Добавлять один и тот же альбом можно в несколько разных галерей. 

Настройки приватности для галереи:

 1. Закрыта. Галерея доступна только её автору.
 2. Публична. Галерея открыта и доступна всем по прямой ссылке.

Если галерея содержит приватные альбомы, они не показываются посетителям галереи. Если галерея содержит альбомы, доступные по ссылке (см.настройки приватности альбомов), они будут отображаться в галерее.

**Авторская страница** — по умолчанию главная страница сайта будет отображать все публичные альбомы автора


## Установка на примере Ubuntu

Ниже представлены два варианта установки системы на сервере Nginx, под управлением Ubuntu.
Если Nginx у вас не стоит, [здесь](https://www.digitalocean.com/community/tutorials/how-to-install-linux-nginx-mysql-php-lemp-stack-on-ubuntu-12-04) есть подробно описанная инструкция по установке.

### 1. Автоматическая установка

**Внимание!** Не используйте этот метод, если у вас уже есть своя конфигурация сервера на Nginx.
Или сделайте резервную копию следующих файлов, ибо во время этой установки они будут перезаписаны.

```
/etc/nginx/nginx.conf
/etc/nginx/sites-enabled/default.conf
/etc/php5/fpm/php.ini
```
Команды выполняются от `sudo`. Здесь во второй строчке `batman` — имя нового пользователя, `bat-site.com` — имя сайта. Вписать свои, разумеется:

```bash
curl -s https://mazepa.us/exe/linux-install.sh > go.sh && chmod +x go.sh
./go.sh batman bat-site.com
```

### 2. Пошаговая установка (вручную)

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

Конфигурация nginx  `/etc/nginx/nginx.conf`:

```
user www-data;
worker_processes 24;
worker_rlimit_nofile 200000;
pid /run/nginx.pid;

events {
  worker_connections 4000;
  use epoll;
  multi_accept on;
}

http {
  sendfile on;
  tcp_nopush on;
  tcp_nodelay on;
  keepalive_timeout 25;
  keepalive_requests 1000;
  types_hash_max_size 2048;

  log_format ingvar '$remote_addr [$time_local] "$request" $status $body_bytes_sent "$http_referer" "$http_user_agent"';

  include /etc/nginx/mime.types;
  default_type application/octet-stream;
  reset_timedout_connection on;
  client_max_body_size 80M;

  error_log /var/log/nginx/error.log error;
  access_log off;

  gzip on;
  gzip_disable    "msie6";
  gzip_min_length 1000;
  gzip_proxied    expired no-cache no-store private auth;
  gzip_types      text/plain application/xml text/css application/javascript;

  include /etc/nginx/conf.d/*.conf;
  include /etc/nginx/sites-enabled/*.conf;
}
```

Конфигурация `/etc/nginx/sites-enabled/default.conf` (SITENAME и UNAME поменять)

```
server {
  listen 80;
  listen [::]:80 default_server;
  server_name  _ SITENAME *.SITENAME;
  root         /home/UNAME/www;
  error_log    /home/UNAME/logs/sitename.log;
  index        index.php;
  charset      utf-8;

  location ~ ^/(application\/|log\/|exe\/|protectedfolder\/) {
    deny  all;
  }

  location ~ /\. {
    deny all;
    access_log off;
    log_not_found off;
  }

  location / {
    index index.php index.html index.htm;
    try_files $uri $uri/ /index.php?$args;
  }

  location ~ \.(js|css|png|jpg|gif|ico|eot|svg|ttff|woff|map|wav)$ {
    expires 1M;
    add_header Cache-Control "public";
    try_files $uri =404;
  }

  location ~ \.php$ {
    fastcgi_pass   unix:/var/run/php5-fpm.sock;
    fastcgi_index  index.php;
    fastcgi_param  SCRIPT_FILENAME  $document_root$fastcgi_script_name;
    include        fastcgi_params;
  }
}
```


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
