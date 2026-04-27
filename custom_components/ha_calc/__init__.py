"""HA Calc: 3D print pricing services for Home Assistant (HACS)."""

from __future__ import annotations

import logging
import math
from pathlib import Path
from typing import Any

import voluptuous as vol
from homeassistant.components.http import StaticPathConfig
from homeassistant.core import HomeAssistant, ServiceCall, ServiceResponse, SupportsResponse
from homeassistant.exceptions import ServiceValidationError
from homeassistant.helpers import config_validation as cv
from homeassistant.helpers.typing import ConfigType

from .const import (
    DEFAULT_SETTINGS,
    DOMAIN,
    SERVICE_CALCULATE,
    SERVICE_GET_ADDITIONALS,
    SERVICE_GET_FILAMENTS,
    SERVICE_GET_SETTINGS,
    SERVICE_SET_ADDITIONALS,
    SERVICE_SET_FILAMENTS,
    SERVICE_SET_SETTINGS,
)
from .pricing import calculate_pricing
from .storage import async_load, async_save

_LOGGER = logging.getLogger(__name__)

STATIC_DIR = Path(__file__).parent / "www"
STATIC_URL_PATH = "/ha_calc_static"


def _finite_number(value: Any) -> float:
    """Coerce to float; reject NaN/Inf."""
    try:
        v = float(value)
    except (TypeError, ValueError) as err:
        raise vol.Invalid("Некорректное число") from err
    if math.isnan(v) or math.isinf(v):
        raise vol.Invalid("Некорректное число")
    return v


def _non_negative_number(value: Any) -> float:
    v = _finite_number(value)
    if v < 0:
        raise vol.Invalid("Число не может быть отрицательным")
    return v


def _positive_int(value: Any) -> int:
    try:
        n = int(value)
    except (TypeError, ValueError) as err:
        raise vol.Invalid("Ожидается целое число") from err
    if n < 1:
        raise vol.Invalid("Должно быть не меньше 1")
    return n


FILAMENT_ITEM = vol.Schema(
    {
        vol.Required("id"): cv.string,
        vol.Required("name"): cv.string,
        vol.Optional("manufacturer", default=""): cv.string,
        vol.Required("price"): _non_negative_number,
    }
)

ADDITIONAL_ITEM = vol.Schema(
    {
        vol.Required("id"): cv.string,
        vol.Required("name"): cv.string,
        vol.Required("price"): _non_negative_number,
    }
)

SET_FILAMENTS_SCHEMA = vol.Schema({vol.Required("filaments"): [FILAMENT_ITEM]})
SET_ADDITIONALS_SCHEMA = vol.Schema({vol.Required("additionals"): [ADDITIONAL_ITEM]})

SET_SETTINGS_SCHEMA = vol.Schema(
    {
        vol.Optional("material_factor"): vol.All(_finite_number, vol.Range(min=0.01, max=100)),
        vol.Optional("hourly_rate"): _non_negative_number,
    }
)

CALCULATE_ADDITIONAL_LINE = vol.Schema(
    {
        vol.Required("id"): cv.string,
        vol.Required("qty"): _non_negative_number,
    }
)

CALCULATE_SCHEMA = vol.Schema(
    {
        vol.Optional("filament_id"): cv.string,
        vol.Optional("price_kg"): _non_negative_number,
        vol.Required("mass_g"): _non_negative_number,
        vol.Required("print_hours"): _non_negative_number,
        vol.Required("models_on_table"): vol.All(vol.Coerce(int), vol.Range(min=1)),
        vol.Optional("additional_lines", default=[]): [CALCULATE_ADDITIONAL_LINE],
        vol.Optional("material_factor"): vol.All(_finite_number, vol.Range(min=0.01, max=100)),
        vol.Optional("hourly_rate"): _non_negative_number,
    }
)


async def async_setup(hass: HomeAssistant, config: ConfigType) -> bool:
    """Register ha_calc services and static path."""

    static_key = f"{DOMAIN}_http_static"
    if not hass.data.get(static_key) and STATIC_DIR.is_dir():
        local_path = str(STATIC_DIR.resolve())
        if hasattr(hass.http, "async_register_static_paths"):
            await hass.http.async_register_static_paths(
                [
                    StaticPathConfig(
                        STATIC_URL_PATH,
                        local_path,
                        True,
                    )
                ]
            )
        else:
            hass.http.register_static_path(
                STATIC_URL_PATH,
                local_path,
                cache_headers=True,
            )
        hass.data[static_key] = True

    async def handle_get_filaments(_call: ServiceCall) -> ServiceResponse:
        data = await async_load(hass)
        return {"filaments": list(data.get("filaments", []))}

    async def handle_set_filaments(call: ServiceCall) -> ServiceResponse:
        payload = SET_FILAMENTS_SCHEMA(dict(call.data))
        data = await async_load(hass)
        data["filaments"] = payload["filaments"]
        await async_save(hass, data)
        return {"filaments": list(data["filaments"])}

    async def handle_get_additionals(_call: ServiceCall) -> ServiceResponse:
        data = await async_load(hass)
        return {"additionals": list(data.get("additionals", []))}

    async def handle_set_additionals(call: ServiceCall) -> ServiceResponse:
        payload = SET_ADDITIONALS_SCHEMA(dict(call.data))
        data = await async_load(hass)
        data["additionals"] = payload["additionals"]
        await async_save(hass, data)
        return {"additionals": list(data["additionals"])}

    async def handle_get_settings(_call: ServiceCall) -> ServiceResponse:
        data = await async_load(hass)
        settings = {**DEFAULT_SETTINGS, **data.get("settings", {})}
        return {"settings": settings}

    async def handle_set_settings(call: ServiceCall) -> ServiceResponse:
        payload = SET_SETTINGS_SCHEMA(dict(call.data))
        if not payload:
            raise ServiceValidationError("Нет полей для обновления")
        data = await async_load(hass)
        cur = {**DEFAULT_SETTINGS, **data.get("settings", {})}
        cur.update({k: payload[k] for k in payload})
        data["settings"] = cur
        await async_save(hass, data)
        return {"settings": dict(cur)}

    async def handle_calculate(call: ServiceCall) -> ServiceResponse:
        payload = CALCULATE_SCHEMA(dict(call.data))
        data = await async_load(hass)
        settings = {**DEFAULT_SETTINGS, **data.get("settings", {})}

        material_factor = float(payload.get("material_factor", settings["material_factor"]))
        hourly_rate = float(payload.get("hourly_rate", settings["hourly_rate"]))

        price_kg: float | None = payload.get("price_kg")
        fid = payload.get("filament_id")
        if price_kg is None:
            if not fid:
                raise ServiceValidationError("Нужны price_kg или filament_id")
            found = next(
                (f for f in data.get("filaments", []) if isinstance(f, dict) and f.get("id") == fid),
                None,
            )
            if not found:
                raise ServiceValidationError("Филамент не найден")
            price_kg = float(found["price"])
        else:
            price_kg = float(price_kg)

        additionals_map = {
            str(a["id"]): float(a["price"])
            for a in data.get("additionals", [])
            if isinstance(a, dict) and "id" in a and "price" in a
        }
        lines: list[tuple[float, float]] = []
        for row in payload.get("additional_lines") or []:
            aid = row["id"]
            qty = float(row["qty"])
            if qty == 0:
                continue
            if aid not in additionals_map:
                raise ServiceValidationError(f"Доп. материал не найден: {aid}")
            lines.append((qty, additionals_map[aid]))

        n = int(payload["models_on_table"])
        result = calculate_pricing(
            price_kg=price_kg,
            mass_g=float(payload["mass_g"]),
            print_hours=float(payload["print_hours"]),
            models_on_table=n,
            material_factor=material_factor,
            hourly_rate=hourly_rate,
            additional_lines=lines,
        )
        return dict(result)

    hass.services.async_register(
        DOMAIN,
        SERVICE_GET_FILAMENTS,
        handle_get_filaments,
        schema=vol.Schema({}),
        supports_response=SupportsResponse.ONLY,
    )
    hass.services.async_register(
        DOMAIN,
        SERVICE_SET_FILAMENTS,
        handle_set_filaments,
        schema=SET_FILAMENTS_SCHEMA,
        supports_response=SupportsResponse.ONLY,
    )
    hass.services.async_register(
        DOMAIN,
        SERVICE_GET_ADDITIONALS,
        handle_get_additionals,
        schema=vol.Schema({}),
        supports_response=SupportsResponse.ONLY,
    )
    hass.services.async_register(
        DOMAIN,
        SERVICE_SET_ADDITIONALS,
        handle_set_additionals,
        schema=SET_ADDITIONALS_SCHEMA,
        supports_response=SupportsResponse.ONLY,
    )
    hass.services.async_register(
        DOMAIN,
        SERVICE_GET_SETTINGS,
        handle_get_settings,
        schema=vol.Schema({}),
        supports_response=SupportsResponse.ONLY,
    )
    hass.services.async_register(
        DOMAIN,
        SERVICE_SET_SETTINGS,
        handle_set_settings,
        schema=SET_SETTINGS_SCHEMA,
        supports_response=SupportsResponse.ONLY,
    )
    hass.services.async_register(
        DOMAIN,
        SERVICE_CALCULATE,
        handle_calculate,
        schema=CALCULATE_SCHEMA,
        supports_response=SupportsResponse.ONLY,
    )

    _LOGGER.debug("Registered %s services", DOMAIN)
    return True
