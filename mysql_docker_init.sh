docker run --name aiwantu-mysql -e MYSQL_ROOT_PASSWORD=my-secret-pw -e MYSQL_USER=aiwantu -e MYSQL_PASSWORD=password -p 3306:3306 -d mysql:8.0


docker exec -it root mysql -u root -p #my-secret-pw
GRANT ALL PRIVILEGES ON mydb.* TO 'aiwantu'@'%';
FLUSH PRIVILEGES;
exit;
mysql -u aiwantu -p #password
CREATE DATABASE mydb;