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