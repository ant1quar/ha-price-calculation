"""Constants for HA Calc (3D print pricing)."""

DOMAIN = "ha_calc"

STORAGE_KEY = f"{DOMAIN}.store"
STORAGE_VERSION = 1

SERVICE_GET_FILAMENTS = "get_filaments"
SERVICE_SET_FILAMENTS = "set_filaments"
SERVICE_GET_ADDITIONALS = "get_additionals"
SERVICE_SET_ADDITIONALS = "set_additionals"
SERVICE_GET_SETTINGS = "get_settings"
SERVICE_SET_SETTINGS = "set_settings"
SERVICE_CALCULATE = "calculate"

DEFAULT_SETTINGS: dict[str, float] = {
    "material_factor": 1.1,
    "hourly_rate": 0.0,
}
