"""HA Calc: calculator services for Home Assistant (HACS)."""

from __future__ import annotations

import logging
import math
from pathlib import Path
from typing import Any

import voluptuous as vol
from homeassistant.core import HomeAssistant, ServiceCall, ServiceResponse, SupportsResponse
from homeassistant.exceptions import HomeAssistantError, ServiceValidationError
from homeassistant.helpers import config_validation as cv
from homeassistant.helpers.typing import ConfigType

from .calculator import DivisionByZeroError, apply, get_operations, is_valid_operation_id
from .const import DOMAIN, SERVICE_CALCULATE, SERVICE_GET_OPERATIONS

_LOGGER = logging.getLogger(__name__)

STATIC_DIR = Path(__file__).parent / "www"
STATIC_URL_PATH = "/ha_calc_static"


def _finite_number(value: Any) -> float:
    """Coerce to float; reject NaN/Inf (aligned with class-validator IsNumber)."""
    try:
        v = float(value)
    except (TypeError, ValueError) as err:
        raise vol.Invalid("Некорректное число") from err
    if math.isnan(v) or math.isinf(v):
        raise vol.Invalid("Некорректное число")
    return v


CALCULATE_SCHEMA = vol.Schema(
    {
        vol.Required("a"): _finite_number,
        vol.Required("b"): _finite_number,
        vol.Required("operation"): cv.string,
    }
)


async def async_setup(hass: HomeAssistant, config: ConfigType) -> bool:
    """Register ha_calc services."""

    static_key = f"{DOMAIN}_http_static"
    if not hass.data.get(static_key) and STATIC_DIR.is_dir():
        hass.http.register_static_path(
            STATIC_URL_PATH,
            str(STATIC_DIR.resolve()),
            cache_headers=True,
        )
        hass.data[static_key] = True

    async def handle_get_operations(_call: ServiceCall) -> ServiceResponse:
        ops = get_operations()
        return {"operations": [dict(o) for o in ops]}

    async def handle_calculate(call: ServiceCall) -> ServiceResponse:
        op = call.data["operation"]
        if not is_valid_operation_id(op):
            raise ServiceValidationError("Неизвестная операция")
        a = call.data["a"]
        b = call.data["b"]
        try:
            result = apply(op, a, b)
        except DivisionByZeroError as err:
            raise HomeAssistantError("Деление на ноль") from err
        return {"result": result}

    hass.services.async_register(
        DOMAIN,
        SERVICE_GET_OPERATIONS,
        handle_get_operations,
        schema=vol.Schema({}),
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
