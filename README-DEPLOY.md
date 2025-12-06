# Currency Converter - Инструкция по развертыванию

## 📋 Содержание
- [Локальное развертывание с Docker](#локальное-развертывание-с-docker)
- [Развертывание на VPS](#развертывание-на-vps)
- [Развертывание на облачных платформах](#развертывание-на-облачных-платформах)

---

## 🐳 Локальное развертывание с Docker

### Предварительные требования
- Docker установлен ([Скачать Docker](https://www.docker.com/get-started))
- Docker Compose установлен (обычно идет с Docker Desktop)

### Быстрый старт

1. **Клонируйте репозиторий или создайте папку с файлами**
```bash
mkdir currency-converter
cd currency-converter
```

2. **Убедитесь, что у вас есть все файлы:**
- `index.html`
- `style.css`
- `script.js`
- `cclogo.webp`
- `Dockerfile`
- `docker-compose.yml`
- `nginx.conf`
- `.dockerignore`

3. **Запустите приложение**
```bash
docker-compose up -d
```

4. **Откройте в браузере**
```
http://localhost:8080
```

### Полезные команды
```bash
# Посмотреть логи
docker-compose logs -f

# Остановить приложение
docker-compose down

# Перезапустить после изменений
docker-compose down
docker-compose up -d --build

# Посмотреть запущенные контейнеры
docker ps

# Зайти внутрь контейнера
docker exec -it currency-converter-app sh
```

---

## 🖥️ Развертывание на VPS (Ubuntu/Debian)

### Шаг 1: Подготовка сервера
```bash
# Обновить систему
sudo apt update && sudo apt upgrade -y

# Установить Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Установить Docker Compose
sudo apt install docker-compose -y

# Добавить пользователя в группу docker
sudo usermod -aG docker $USER
```

### Шаг 2: Загрузка файлов на сервер
```bash
# Через Git
git clone <your-repo-url>
cd currency-converter

# Или через SCP
scp -r ./* user@your-server-ip:/home/user/currency-converter/
```

### Шаг 3: Запуск приложения
```bash
cd currency-converter
docker-compose up -d
```

### Шаг 4: Настройка Nginx как reverse proxy (опционально)
```bash
# Установить Nginx
sudo apt install nginx -y

# Создать конфигурацию
sudo nano /etc/nginx/sites-available/currency-converter
```

Добавьте следующую конфигурацию:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```
```bash
# Активировать конфигурацию
sudo ln -s /etc/nginx/sites-available/currency-converter /etc/nginx/sites-enabled/

# Проверить конфигурацию
sudo nginx -t

# Перезапустить Nginx
sudo systemctl restart nginx
```

### Шаг 5: Настройка SSL с Let's Encrypt
```bash
# Установить Certbot
sudo apt install certbot python3-certbot-nginx -y

# Получить SSL сертификат
sudo certbot --nginx -d your-domain.com

# Автообновление будет настроено автоматически
```

---

## ☁️ Развертывание на облачных платформах

### Vercel (самый простой способ)

1. Создайте файл `vercel.json`:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "index.html",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/$1"
    }
  ]
}
```

2. Установите Vercel CLI:
```bash
npm i -g vercel
```

3. Разверните:
```bash
vercel
```

### Netlify

1. Создайте файл `netlify.toml`:
```toml
[build]
  publish = "."

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

2. Перетащите папку на [Netlify Drop](https://app.netlify.com/drop) или используйте CLI:
```bash
npm install -g netlify-cli
netlify deploy --prod
```

### GitHub Pages

1. Создайте репозиторий на GitHub
2. Загрузите все файлы
3. Перейдите в Settings → Pages
4. Выберите ветку `main` и папку `root`
5. Сохраните

Сайт будет доступен по адресу: `https://username.github.io/repository-name`

### Railway.app

1. Зарегистрируйтесь на [Railway.app](https://railway.app)
2. Создайте новый проект
3. Выберите "Deploy from GitHub repo"
4. Railway автоматически обнаружит Dockerfile
5. Нажмите Deploy

### Render.com

1. Зарегистрируйтесь на [Render.com](https://render.com)
2. Создайте новый "Static Site"
3. Подключите репозиторий
4. Настройки:
   - Build Command: (оставьте пустым)
   - Publish Directory: `.`
5. Нажмите "Create Static Site"

### DigitalOcean App Platform

1. Создайте файл `.do/app.yaml`:
```yaml
name: currency-converter
static_sites:
- name: web
  github:
    repo: username/repository
    branch: main
  routes:
  - path: /
```

2. Подключите репозиторий через DigitalOcean App Platform

---

## 🔧 Дополнительные настройки

### Изменение порта

В `docker-compose.yml` измените:
```yaml
ports:
  - "3000:80"  # localhost:3000
```

### Автоматический перезапуск

Docker Compose уже настроен с `restart: unless-stopped`, что означает автоматический перезапуск при сбое или перезагрузке сервера.

### Мониторинг
```bash
# Использование ресурсов
docker stats currency-converter-app

# Проверка здоровья
docker ps -a
```

### Бэкап
```bash
# Создать образ
docker commit currency-converter-app currency-converter-backup

# Экспортировать образ
docker save currency-converter-backup > currency-converter-backup.tar

# Импортировать образ
docker load < currency-converter-backup.tar
```

---

## 🆘 Решение проблем

### Порт уже занят
```bash
# Узнать, что использует порт 8080
sudo lsof -i :8080

# Или изменить порт в docker-compose.yml
```

### Приложение не запускается
```bash
# Проверить логи
docker-compose logs

# Пересобрать образ
docker-compose up --build
```

### Проблемы с CORS
API exchangerate-api.com не требует дополнительных настроек CORS для браузерных запросов.

---

## 📞 Поддержка

Если возникли проблемы:
1. Проверьте логи: `docker-compose logs`
2. Убедитесь, что порт 8080 свободен
3. Проверьте файрволл на сервере

---

## 🚀 Production Checklist

- [ ] SSL сертификат установлен
- [ ] Домен настроен
- [ ] Gzip сжатие включено (уже в nginx.conf)
- [ ] Кеширование настроено (уже в nginx.conf)
- [ ] Firewall настроен
- [ ] Автоматические обновления настроены
- [ ] Мониторинг настроен
- [ ] Бэкапы настроены

Готово! 🎉