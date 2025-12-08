# Finance AI (LLM Gateway)

FastAPI-сервис для работы с Alem LLM через OpenAI-совместимый endpoint и тестирования API ключей через Swagger UI.

## Быстрый старт

1. Создайте `.env` по примеру `env.example`:
   ```bash
   cp env.example .env
   # Заполните реальные значения в .env
   ```

2. Создайте виртуальное окружение и установите зависимости:
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # Linux/macOS
   pip install -r requirements.txt
   ```

3. Запустите сервис:
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

4. Откройте Swagger UI: http://localhost:8000/docs

## Переменные окружения

| Переменная | Описание |
|------------|----------|
| `DB_DSN` | Строка подключения к PostgreSQL |
| `PRIMARY_LLM_MODEL` | Модель по умолчанию (`alemllm`, `qwen3`) |
| `ALEM_BASE_URL` | URL Alem API (`https://llm.alem.ai/v1`) |
| `ALEM_API_KEY` | API ключ для AlemLLM |
| `QWEN3_API_KEY` | API ключ для Qwen3 |

## Эндпоинты

### Основные
- `GET /health` — проверка работоспособности
- `GET /settings/keys` — статус настроенных API ключей
- `POST /llm/chat` — отправка сообщений в чат-модель

### Тестирование API ключей
- `POST /test/alemllm` — тест AlemLLM с кастомным сообщением
- `POST /test/qwen3` — тест Qwen3 с кастомным сообщением
- `POST /test/all` — быстрый тест всех ключей

## Пример запроса `/llm/chat`

```json
{
  "messages": [
    {"role": "system", "content": "You are a helpful assistant"},
    {"role": "user", "content": "Привет!"}
  ],
  "model": "alemllm",
  "temperature": 0.7
}
```
