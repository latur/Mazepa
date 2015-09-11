#!/bin/bash

if [[ "$1" != "" ]]; then
    UNAME="$1"
else
    UNAME="developer"
fi

if [[ "$2" != "" ]]; then
    SITENAME="$1"
else
    SITENAME="developer"
fi

echo "Создание нового пользователя $UNAME"
useradd $UNAME -m -G www-data

echo "Копирование файлов"
cd /home/$UNAME/ && mkdir logs www
git clone https://github.com/latur/Mazepa.git www

echo "Настройка Nginx"

echo "> /etc/nginx/nginx.conf"
curl -s https://gist.githubusercontent.com/latur/8e56eb5cced3bf61bd8e/raw/ce0cde4dc392509d360291eb370af738fe973b8f/nginx.conf > /etc/nginx/nginx.conf 

echo "> /etc/nginx/sites-enabled/default.conf"
curl -s https://gist.githubusercontent.com/latur/446c68616d480a56bb25/raw/30c8822120f44347915714bbbc4df863a885c783/sitename.conf \
  | sed "s/UNAME/$UNAME/g" -r \
  | sed "s/SITENAME/$SITENAME/g" -r \
    > /etc/nginx/sites-enabled/default.conf

echo "Запуск Nginx"
/etc/init.d/nginx restart
