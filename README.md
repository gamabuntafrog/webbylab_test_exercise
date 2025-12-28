# Movies

## 🚀 Запуск програми та збірка Docker образу

### Вимоги

- **Node.js 22.x** або вище
- **npm 10.x** або вище
- **Docker** (для збірки Docker образу)

### Конфігурація через змінні оточення

Вся конфігурація програми відбувається через змінні оточення. Створіть файл `.env` в корені проєкту з наступними змінними:

```bash
# Server Configuration
APP_PORT=3000
NODE_ENV=development

# Database Configuration
DATABASE_PATH=./database.sqlite

# JWT Configuration
JWT_SECRET=your-secret-key-change-in-production
ACCESS_TOKEN_EXPIRES_IN=1h
REFRESH_TOKEN_EXPIRES_IN=7d
REFRESH_TOKEN_SECRET=your-secret-refresh-key-change-in-production

# Logger Configuration
LOG_LEVEL=debug

# CORS Configuration
FRONTEND_ORIGIN=http://localhost:3001
```

#### Опис змінних оточення

- **APP_PORT** - Порт, на якому буде запущений сервер (за замовчуванням: `3000`)
- **NODE_ENV** - Оточення виконання: `development` або `production` (за замовчуванням: `development`)
- **DATABASE_PATH** - Шлях до файлу бази даних SQLite (за замовчуванням: `./database.sqlite`)
- **JWT_SECRET** - Секретний ключ для підпису JWT токенів (обов'язково змініть у продакшені!)
- **ACCESS_TOKEN_EXPIRES_IN** - Час життя access токену (за замовчуванням: `1h`)
- **REFRESH_TOKEN_EXPIRES_IN** - Час життя refresh токену (за замовчуванням: `7d`)
- **REFRESH_TOKEN_SECRET** - Секретний ключ для refresh токенів (обов'язково змініть у продакшені!)
- **LOG_LEVEL** - Рівень логування: `debug`, `info`, `warn`, `error` (за замовчуванням: `debug` для development, `info` для production)
- **FRONTEND_ORIGIN** - Дозволені CORS origins (можна вказати кілька через кому, за замовчуванням: `http://localhost:3001`)

### Запуск програми

#### 1. Встановлення залежностей

```bash
npm install
```

#### 2. Налаштування змінних оточення

Створіть файл `.env` в корені проєкту та заповніть його змінними оточення (див. вище).

#### 3. Запуск міграцій бази даних

```bash
npm run migrate
```

#### 4. Запуск у режимі розробки

```bash
npm run dev
```

Сервер буде доступний за адресою `http://localhost:3000` (або інший порт, якщо вказано в `APP_PORT`).

#### 5. Запуск у продакшен режимі

```bash
# Збірка проєкту
npm run build

# Запуск сервера
npm start
```

### Збірка Docker образу

#### 1. Збірка образу

```bash
docker build -t movies:latest .
```

#### 2. Запуск міграцій бази даних

Перед запуском контейнера варто виконати міграції:


```bash
docker run --rm \
  --env-file .env \
  -v $(pwd)/database.sqlite:/app/database.sqlite \
  movies:latest \
  npm run migrate
```

#### 3. Запуск контейнера з використанням змінних оточення

```bash
docker run -d \
  --name backend-app \
  -p 3000:3000 \
  -e APP_PORT=3000 \
  -e NODE_ENV=production \
  -e DATABASE_PATH=/app/database.sqlite \
  -e JWT_SECRET=your-production-secret-key \
  -e REFRESH_TOKEN_SECRET=your-production-refresh-secret \
  -e FRONTEND_ORIGIN=https://your-frontend-domain.com \
  -v $(pwd)/database.sqlite:/app/database.sqlite \
  movies:latest
```

Або використовуйте файл `.env`:

```bash
docker run -d \
  --name backend-app \
  -p 3000:3000 \
  --env-file .env \
  -v $(pwd)/database.sqlite:/app/database.sqlite \
  movies:latest
```

#### 4. Перевірка роботи контейнера

```bash
# Перевірка статусу
docker ps

# Перегляд логів
docker logs backend-app

# Перевірка health check
curl http://localhost:3000/health
```

#### 5. Зупинка контейнера

```bash
docker stop backend-app
docker rm backend-app
```

### Робота з міграціями в Docker

#### Запуск міграцій в запущеному контейнері

Якщо контейнер вже запущений, можна виконати міграції всередині нього:

```bash
# Запуск всіх невиконаних міграцій
docker exec backend-app npm run migrate
```

#### Перевірка статусу міграцій

Щоб перевірити, які міграції вже виконані:

```bash
# Перевірка статусу міграцій
docker exec backend-app npm run migrate:status
```

#### Відкат міграцій

Для відкату останньої міграції:

```bash
# Відкат останньої міграції
docker exec backend-app npm run migrate:rollback
```

#### Важливі примітки

**Безпека**: У продакшені краще виконувати міграції окремо перед запуском контейнера або через окремий init-контейнер.

## 📋 What's Included

- ✅ Express.js with TypeScript
- ✅ SQLite with Sequelize ORM
- ✅ JWT-based authentication (access + refresh tokens)
- ✅ Password hashing with bcryptjs
- ✅ Request validation with Zod
- ✅ Structured logging with Pino
- ✅ CORS configuration
- ✅ Error handling middleware
- ✅ Request logging middleware
- ✅ Conventional commits with commitlint
- ✅ Git hooks with Husky
- ✅ ESLint + Prettier for code quality

## 🚀 Quick Start

### Prerequisites

- **Node.js 22.x** or higher
- **npm 10.x** or higher

You can use [nvm](https://github.com/nvm-sh/nvm) to manage Node.js versions:

```bash
nvm install 22
nvm use 22
```

Or if you have `.nvmrc` file, simply run:

```bash
nvm use
```

### Installation Steps

1. **Create a new repository** from this template by clicking "Use this template" on GitHub
2. **Clone your new repository**:
   ```bash
   git clone <your-repo-url>
   cd <your-repo-name>
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Set up environment variables** - створіть файл `.env` з необхідними змінними (див. розділ "Конфігурація через змінні оточення" вище)
5. **Run database migrations**:
   ```bash
   npm run migrate
   ```
6. **Start developing**:
   ```bash
   npm run dev
   ```

Для детальної інформації про запуск та збірку Docker образу див. розділ "🚀 Запуск програми та збірка Docker образу" вище.

For more detailed information, see [TEMPLATE.md](./TEMPLATE.md).

## Installation

### Requirements

- **Node.js 22.x** or higher
- **npm 10.x** or higher

### Install Dependencies

```bash
npm install
```

> **Note:** If you're using [nvm](https://github.com/nvm-sh/nvm), you can run `nvm use` to automatically switch to the correct Node.js version (specified in `.nvmrc`).

```


## Commit Convention

This project uses [Conventional Commits](https://www.conventionalcommits.org/) to ensure consistent commit messages. Commit messages are automatically validated using commitlint and husky.

### Commit Message Format

```

<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that do not affect the meaning of the code (formatting, missing semi-colons, etc.)
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `perf`: A code change that improves performance
- `test`: Adding missing tests or correcting existing tests
- `build`: Changes that affect the build system or external dependencies
- `ci`: Changes to CI configuration files and scripts
- `chore`: Other changes that don't modify src or test files
- `revert`: Reverts a previous commit

### Examples

```bash
feat(auth): add password reset functionality
fix(validator): remove password min length from login schema
docs(readme): update API endpoint documentation
style(errorHandler): switch to single quotes
refactor(mapper): replace any types with proper TypeScript types
```

### Validation

Commit messages are automatically validated when you commit. If your commit message doesn't follow the conventional commit format, the commit will be rejected with an error message explaining what needs to be fixed.

## 📚 Technologies

- **Express.js** - Web framework
- **TypeScript** - Type-safe JavaScript
- **SQLite + Sequelize** - Relational database + ORM
- **Zod** - Schema validation
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **Pino** - Structured logging
- **Commitlint** - Commit message validation
- **Husky** - Git hooks

## 📖 Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md) - Детальний опис архітектури програми
