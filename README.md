# WebsitesAvailability
Это приложение создано с целью отслеживания состояния сервисов и веб-приложений, которые были разработаны при участии отдела № 5 в компании IBS Dunice

### Возможности приложения:

* Отсылка запросов на веб-сайты / сервисы
* Система оповещения на почту для ресепиентов 
* Отправка статистики каждые `n` заходов на веб-сайт
* Постоение графиков ( отправка построенных графиков исходя из ежедневной / еженедельной / ежемесячной статистики ) [ Не реализованно ] 

## Запуск приложения:

На машине - исполнителе скрипта должен стоять node.js

Команды для инициализации проекта и запуска cron демона:

`// cloning & install deps
cd ~/Projects
git clone https://github.com/D-pavlo-v/WebsitesAvailability.git
cd WebsiteAvailability
npm i

// creating & adding cron at instance
crontab -l > website-checker
echo "$(cat cron.sh)" >> website-checker`

P.S. В дальнейшем будет возможен запуск из Docker