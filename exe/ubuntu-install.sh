#!/bin/bash

if [[ "$1" != "" ]]; then UNAME="$1"; else UNAME="developer"; fi;
if [[ "$2" != "" ]]; then SITENAME="$2"; else SITENAME="sitename.com"; fi;

# ---------------------------------------------------------------------------- #

echo -e "\e[97mУстановка jpegoptim exiftool imagemagick"
apt-get install git jpegoptim exiftool imagemagick

echo -e "\e[97mСоздание нового пользователя $UNAME"
useradd $UNAME -m -G www-data

echo -e "\e[97mКопирование файлов"
cd /home/$UNAME/ && mkdir logs www
git clone https://github.com/latur/Mazepa.git www

echo -e "\e[97mПрава доступа"
find /home/$UNAME/www/ -type d -exec chmod 770 {} +
find /home/$UNAME/www/ -type f -exec chmod 660 {} +
chown -R $UNAME:www-data /home/$UNAME/www/

# ---------------------------------------------------------------------------- #
echo -e "\e[97mСоздание пользователя и таблицы в базе данных:"

echo -e "\e[31mВведите имя базы данных (по умолчанию mazepadb):\e[39m"
read STR
if [[ $STR != "" ]]; then DBNAME="$STR"; else DBNAME="mazepadb"; fi;

echo -e "\e[31mВведите имя пользователя (по умолчанию umazepa):\e[39m"
read STR
if [[ $STR != "" ]]; then USR="$STR"; else USR="umazepa"; fi;

echo -e "\e[31mВведите пароль пользователя (по умолчанию umazepa):\e[39m"
read STR
if [[ $STR != "" ]]; then UPWD="$STR"; else UPWD="umazepa"; fi;

# ---------------------------------------------------------------------------- #

echo -e "DB-name: $DBNAME\nDB-user: $USR\nDB-password: $UPWD";
echo "CREATE DATABASE \`$DBNAME\` DEFAULT CHARACTER SET \`utf8\`;" > /tmp/insert.sql
echo "CREATE USER '$USR'@'localhost' IDENTIFIED BY '$UPWD';" >> /tmp/insert.sql
echo "GRANT ALL PRIVILEGES ON \`$DBNAME\` . * TO '$USR'@'localhost';" >> /tmp/insert.sql

echo -e "\e[31mТребуется пароль пользователя root (mysql):\e[39m";
mysql -u root -p < /tmp/insert.sql

# ---------------------------------------------------------------------------- #

echo -e "\e[97mНастройка Nginx"

echo -e "> /etc/nginx/nginx.conf"
curl -s https://gist.githubusercontent.com/latur/8e56eb5cced3bf61bd8e/raw/ce0cde4dc392509d360291eb370af738fe973b8f/nginx.conf > /etc/nginx/nginx.conf

echo -e "> /etc/nginx/sites-enabled/default.conf"
curl -s https://gist.githubusercontent.com/latur/446c68616d480a56bb25/raw/30c8822120f44347915714bbbc4df863a885c783/sitename.conf \
  | sed "s/UNAME/$UNAME/g" -r \
  | sed "s/SITENAME/$SITENAME/g" -r \
    > /etc/nginx/sites-enabled/default.conf

echo -e "Запуск Nginx"
/etc/init.d/nginx restart

sensible-browser "http://localhost"
