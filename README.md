# HA 3D Print Calc (HACS)

Калькулятор **себестоимости и цен 3D-печати** для **Home Assistant**: справочники филаментов и доп. материалов, настройки (`material_factor`, `hourly_rate`), расчёт на штуку и на весь стол с маржами **60% / 75% / 80%** (формула выручки: `цена = себестоимость / (1 - m)`).

Поставка: **HACS** (`custom_components/ha_calc` + собранная Lovelace-карточка). Без Docker, Node на хосте HA и отдельного REST-бэкенда.

## Миграция с v2 (демо-калькулятор)

**Breaking change:** удалены демо-сервисы `ha_calc.get_operations` и старый `ha_calc.calculate` (операции `add` / `divide` и т.д.). Удалена карточка `custom:ha-calc-card` и ресурс `ha-calc-card.js`.

Сделайте:

1. В **Ресурсах** Lovelace удалите `/ha_calc_static/ha-calc-card.js`, добавьте модуль `/ha_calc_static/ha-3d-print-calc-card.js`.
2. В YAML дашборда замените `type: custom:ha-calc-card` на `type: custom:ha-3d-print-calc-card`.
3. Автоматизации, вызывавшие старые сервисы, перепишите под новые (см. таблицу ниже).

## Требования

- Home Assistant **2024.2+** (сервисы с `supports_response` / `return_response`).
- Для HACS удобнее вынести эту папку в **отдельный репозиторий** с корнем здесь.

## Установка

1. **HACS** → **Интеграции** → **⋮** → **Пользовательские репозитории** → URL → категория **Интеграция**.
2. Карточка **HA 3D Print Calc** → **Скачать**.
3. **Настройки** → **Система** → **Перезагрузка** → **Перезагрузить конфигурацию** (или перезапуск HA).
4. В `configuration.yaml`:

   ```yaml
   ha_calc:
   ```

5. **Панели управления** → **⋮** → **Ресурсы** → **Добавить ресурс**:
   - **URL:** `/ha_calc_static/ha-3d-print-calc-card.js`
   - **Тип:** JavaScript-модуль

6. Карточка (YAML):

   ```yaml
   type: custom:ha-3d-print-calc-card
   ```

Статика отдаётся с префикса `/ha_calc_static/` (same-origin, тема через CSS-переменные HA).

### «Custom element doesn't exist: ha-3d-print-calc-card»

1. Ресурс должен быть **JavaScript-модуль**.
2. Открой `https://<ha>/ha_calc_static/ha-3d-print-calc-card.js` — ожидается **200** и текст скрипта.
3. После обновления — жёсткое обновление дашборда или `?v=3` в URL ресурса.

### Отладка карточки

- `localStorage.setItem("ha_3d_print_calc_card_debug", "1")` и перезагрузка страницы; выкл: удалить ключ или `"0"`.
- Либо `window.__HA_3D_PRINT_CALC_CARD_DEBUG__ = true` до загрузки ресурса.

## Сервисы

| Сервис | Назначение |
|--------|------------|
| `ha_calc.get_filaments` | `{"filaments": [{ id, name, manufacturer, price }]}` |
| `ha_calc.set_filaments` | Данные: `filaments` — полный массив |
| `ha_calc.get_additionals` | `{"additionals": [{ id, name, price }]}` |
| `ha_calc.set_additionals` | Данные: `additionals` — полный массив |
| `ha_calc.get_settings` | `{"settings": { material_factor, hourly_rate }}` |
| `ha_calc.set_settings` | Частично: `material_factor`, `hourly_rate` |
| `ha_calc.calculate` | См. `services.yaml`; ответ: `per_piece`, `table_total` (landed + цены при 60/75/80%), `breakdown` |

Ввод расчёта: **`mass_g`** — масса филамента **на весь стол** (г); время печати на **весь стол** (ч); **`models_on_table`** = N ≥ 1 используется только чтобы **разделить итоговую себестоимость стола** на штуку (допы в `additional_lines` по-прежнему задаются **на одну модель**). Нужны **`filament_id`** или **`price_kg`**. Коэффициент и ставка — из настроек, если не переданы в вызове.

## Разработка

**Python:**

```bash
pip install pytest voluptuous homeassistant  # при необходимости для IDE
pytest tests/
```

**Карточка (Lit + Vite):**

```bash
cd frontend_card && npm install && npm run build
```

Сборка: `custom_components/ha_calc/www/ha-3d-print-calc-card.js`. Перед релизом поднимите `version` в `manifest.json` и тег для HACS.

## Структура

| Путь | Назначение |
|------|------------|
| `custom_components/ha_calc/` | Интеграция: `pricing.py`, `storage.py`, сервисы, `www/ha-3d-print-calc-card.js` |
| `frontend_card/` | Исходники карточки |
| `tests/` | pytest без рантайма HA |
| `hacs.json` | Метаданные HACS |
