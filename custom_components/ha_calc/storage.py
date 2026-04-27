"""JSON storage for filaments, additionals, settings."""

from __future__ import annotations

from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.helpers.storage import Store

from .const import DEFAULT_SETTINGS, DOMAIN, STORAGE_KEY, STORAGE_VERSION


def default_store_data() -> dict[str, Any]:
    """Initial empty store."""
    return {
        "filaments": [],
        "additionals": [],
        "settings": dict(DEFAULT_SETTINGS),
    }


def merge_defaults(raw: dict[str, Any]) -> dict[str, Any]:
    """Ensure keys exist and settings have defaults."""
    out = default_store_data()
    if not isinstance(raw, dict):
        return out
    fil = raw.get("filaments")
    add = raw.get("additionals")
    sett = raw.get("settings")
    if isinstance(fil, list):
        out["filaments"] = fil
    if isinstance(add, list):
        out["additionals"] = add
    if isinstance(sett, dict):
        merged = dict(DEFAULT_SETTINGS)
        for k, v in sett.items():
            if k in DEFAULT_SETTINGS:
                merged[k] = v
        out["settings"] = merged
    return out


def get_store(hass: HomeAssistant) -> Store:
    """Singleton Store handle in hass.data."""
    key = f"{DOMAIN}_store_handle"
    existing = hass.data.get(key)
    if isinstance(existing, Store):
        return existing
    store = Store(hass, STORAGE_VERSION, STORAGE_KEY)
    hass.data[key] = store
    return store


async def async_load(hass: HomeAssistant) -> dict[str, Any]:
    store = get_store(hass)
    raw = await store.async_load()
    if not raw:
        data = default_store_data()
        await store.async_save(data)
        return data
    return merge_defaults(raw)


async def async_save(hass: HomeAssistant, data: dict[str, Any]) -> None:
    store = get_store(hass)
    await store.async_save(data)
