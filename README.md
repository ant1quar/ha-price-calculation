# HA Calc (HACS)

Калькулятор для **Home Assistant Core**: четыре операции (сложить / вычесть / умножить / разделить), поля `a`, `b`, результат или сообщение об ошибке. Логика совпадает с прежним Nest add-on: деление на ноль, проверка операции и чисел (без NaN/Inf).

Поставка: **HACS** (`custom_components/ha_calc` + собранная Lovelace-карточка). **Без** Docker, Node на хосте HA, Supervisor add-on и REST-бэкенда.

## Требования

- Home Assistant **2024.2+** (сервисы с `supports_response` / `return_response` в UI).
- Для HACS удобнее вынести эту папку в **отдельный репозиторий** с корнем здесь (в монорепо HACS ожидает `custom_components` в корне клонируемого репо).

## Установка

1. **HACS** → **Интеграции** → **⋮** → **Пользовательские репозитории** → URL репозитория → категория **Интеграция**.
2. Откройте карточку **HA Calc** → **Скачать**.
3. **Настройки** → **Система** → **Перезагрузка** → **Перезагрузить конфигурацию** (или перезапуск HA).
4. В `configuration.yaml` добавьте домен (интеграция без config flow):

   ```yaml
   ha_calc:
   ```

5. **Настройки** → **Панели управления** → **⋮** → **Ресурсы** → **Добавить ресурс**:
   - **URL:** `/ha_calc_static/ha-calc-card.js`
   - **Тип ресурса:** JavaScript-модуль

6. На дашборде добавьте карточку вручную (YAML):

   ```yaml
   type: custom:ha-calc-card
   ```

Интеграция регистрирует статику `www/` по префиксу `/ha_calc_static/` (same-origin, тема через `--primary-color`, `--ha-card-*` и т.д.).

### «Custom element doesn't exist: ha-calc-card»

1. Ресурс должен быть **JavaScript-модуль**, не обычный JS.
2. В браузере открой `https://<твой-ha>/ha_calc_static/ha-calc-card.js` — должен отдаваться **200** и текст скрипта (не HTML логина). Если **404** — интеграция не поднялась: проверь `ha_calc:` в YAML, перезагрузи конфиг, смотри логи HA на ошибки при старте.
3. После обновления файла сделай **жёсткое обновление** дашборда (кэш) или смени версию в URL ресурса: `/ha_calc_static/ha-calc-card.js?v=2`.
4. Карточка вызывает сервисы через **WebSocket** (`call_service` + `return_response`), а не через подменяемый `hass.callService` (иначе расширения вроде Popup View могли бы слать `return_response` внутрь `target` и ломать вызов).

## Сервисы

| Сервис | Назначение |
|--------|------------|
| `ha_calc.get_operations` | Список операций: ответ `{"operations": [{"id", "label"}, ...]}`. |
| `ha_calc.calculate` | Поля: `a`, `b` (числа), `operation` — `add` \| `subtract` \| `multiply` \| `divide`. Успех: `{"result": number}`. Ошибки: `ServiceValidationError` / `HomeAssistantError` с текстами вроде «Деление на ноль», «Неизвестная операция», «Некорректное число». |

В **автоматизациях** и **Сценариях** включайте **Ответ** / `return_response`, если нужен результат в переменной.

Пример вызова из автоматизации (смысл; точный YAML зависит от редактора):

- Действие: `ha_calc.calculate`
- Данные: `a: 10`, `b: 2`, `operation: divide`
- Ожидаемый ответ: `result: 5`

## Старые версии HA

Если нет поддержки ответа сервиса в вызове из карточки, обновите HA или вызывайте сервисы из автоматизаций с `response_variable`; карточка рассчитана на `return_response: true`.

## Разработка

**Python (логика):**

```bash
pip install pytest
pytest tests/
```

**Карточка (Lit + Vite):**

```bash
cd frontend_card && npm install && npm run build
```

Сборка пишет `custom_components/ha_calc/www/ha-calc-card.js`. Перед релизом поднимите `version` в `custom_components/ha_calc/manifest.json` и совпадающий git-тег для HACS.

## Структура

| Путь | Назначение |
|------|------------|
| `custom_components/ha_calc/` | Интеграция: сервисы, `calculator.py`, `www/ha-calc-card.js` |
| `frontend_card/` | Исходники карточки (dev) |
| `tests/` | pytest без рантайма HA |
| `hacs.json` | Метаданные HACS |
