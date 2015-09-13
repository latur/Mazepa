# Mazepa

Система управления веб-фотогалереями. 

![Как это выглядит](https://raw.githubusercontent.com/latur/Mazepa/master/static/img/demo.jpg)

## Установка на примере Ubuntu:

Предполагается, что у вас уже поднят сервер на Nginx, запущен MySQL и PHP5. В противном случе, подробно их установка [описана здесь](https://www.digitalocean.com/community/tutorials/how-to-install-linux-nginx-mysql-php-lemp-stack-on-ubuntu-12-04).

Для корректной работы требуются приложения `git`, `convert` для создания миниатюрок к фотографиям, `exiftool` для быстрого чтения meta информации фотографий и `jpegoptim` для оптимизации картинок и ускорения их загрузки:

```bash
sudo apt-get install git jpegoptim exiftool imagemagick
```

Создание отдельного пользователя для директории сайта и выгрузка кода:

```bash
useradd developer -m -G www-data
cd /home/developer/ 
mkdir logs www
git clone https://github.com/latur/Mazepa.git www
```
...

Разработана с использованием:

 > PhotoSwipe Default UI - 4.0.0 - 2014-12-08 <br>
   [http://photoswipe.com](http://photoswipe.com)

 > ImageMagick <br>
   [http://imagemagick.org](http://www.imagemagick.org/)

 > qr.js — QR code generator <br>
   Written by Kang Seonghoon <public+qrjs@mearie.org>

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
