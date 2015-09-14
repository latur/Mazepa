#!/bin/bash

if [[ "$1" != "" ]]; then UNAME="$1"; else UNAME="developer"; fi;
if [[ "$2" != "" ]]; then SITENAME="$2"; else SITENAME="sitename.com"; fi;

# ---------------------------------------------------------------------------- #

echo -e "\e[32mУстановка jpegoptim exiftool imagemagick php5-gd curl\e[39m"
apt-get install git jpegoptim exiftool imagemagick php5-gd curl

# ---------------------------------------------------------------------------- #

echo -e "\e[32mСоздание пользователя и таблицы в базе данных:\e[39m"

echo -e "\e[31mВведите имя базы данных (по умолчанию mazepadb):\e[39m"
read STR
if [[ $STR != "" ]]; then DBNAME="$STR"; else DBNAME="mazepadb"; fi;

echo -e "\e[31mВведите имя пользователя (по умолчанию umazepa):\e[39m"
read STR
if [[ $STR != "" ]]; then USR="$STR"; else USR="umazepa"; fi;

echo -e "\e[31mВведите пароль пользователя (по умолчанию umazepa):\e[39m"
read STR
if [[ $STR != "" ]]; then UPWD="$STR"; else UPWD="umazepa"; fi;

echo -e "DB-name: $DBNAME\nDB-user: $USR\nDB-password: $UPWD";

dbaccess="denied"
until [[ $dbaccess = "success" ]]; do
  mysql --user="root" --password="${RPWD}" -e exit 2>/dev/null
  dbstatus=`echo $?`
  if [ $dbstatus -ne 0 ]; then
    echo -e "\e[31mТребуется пароль пользователя root (mysql):\e[39m"
    read STR
    if [[ $STR != "" ]]; then RPWD="$STR"; else RPWD=""; fi;
  else
    dbaccess="success"
    echo "Ок"
  fi
done

echo "CREATE DATABASE \`$DBNAME\` DEFAULT CHARACTER SET \`utf8\`;" > /tmp/insert.sql
echo "CREATE USER '$USR'@'localhost' IDENTIFIED BY '$UPWD';" >> /tmp/insert.sql
echo "GRANT ALL PRIVILEGES ON \`$DBNAME\` . * TO '$USR'@'localhost';" >> /tmp/insert.sql

mysql --user="root" --password="${RPWD}" < /tmp/insert.sql

# ---------------------------------------------------------------------------- #

echo -e "\e[32mСоздание нового пользователя $UNAME\e[39m"
useradd $UNAME -m -G www-data

echo -e "\e[32mКопирование файлов\e[39m"
rm -rf /home/$UNAME/www
mkdir /home/$UNAME /home/$UNAME/www /home/$UNAME/logs
git clone https://github.com/latur/Mazepa.git /home/$UNAME/www

cat /home/$UNAME/www/install.php \
  | sed "s/name=\"dbname\" value=\"\"/name=\"dbname\" value=\"$DBNAME\"/g" -r \
  | sed "s/name=\"dbuname\" value=\"\"/name=\"dbuname\" value=\"$USR\"/g" -r \
  | sed "s/name=\"dbpass\" value=\"\"/name=\"dbpass\" value=\"$UPWD\"/g" -r \
    > /tmp/install.php

cp /tmp/install.php /home/$UNAME/www/install.php

echo -e "\e[32mПрава доступа\e[39m"
find /home/$UNAME/www/ -type d -exec chmod 770 {} +
find /home/$UNAME/www/ -type f -exec chmod 660 {} +
chown -R $UNAME:www-data /home/$UNAME/www/

# ---------------------------------------------------------------------------- #

echo -e "\e[32mНастройка nginx, php5-fpm\e[39m"

echo -e "> /etc/nginx/sites-enabled/default.conf"
curl -s https://gist.githubusercontent.com/latur/446c68616d480a56bb25/raw/30c8822120f44347915714bbbc4df863a885c783/sitename.conf \
  | sed "s/UNAME/$UNAME/g" -r \
  | sed "s/SITENAME/$SITENAME/g" -r \
    > /etc/nginx/sites-enabled/default.conf

echo -e "> /etc/nginx/nginx.conf"
curl -s https://gist.githubusercontent.com/latur/8e56eb5cced3bf61bd8e/raw/ce0cde4dc392509d360291eb370af738fe973b8f/nginx.conf \
 > /etc/nginx/nginx.conf

echo -e "> /etc/php5/fpm/php.ini"
curl -s https://gist.githubusercontent.com/latur/c876031bc80b4219444b/raw/9cf242b98f4cfe51d86c1c4aa9db4a714e91d25f/php.ini \
 > /etc/php5/fpm/php.ini

echo -e "\e[32mЗапуск Nginx\e[39m"
apachectl stop
service nginx restart
service php5-fpm restart

sensible-browser "http://localhost/install.php"
