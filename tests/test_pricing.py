"""Unit tests for 3D pricing (no Home Assistant runtime)."""

from __future__ import annotations

import importlib.util
from pathlib import Path

_PRICING = Path(__file__).resolve().parents[1] / "custom_components" / "ha_calc" / "pricing.py"
_spec = importlib.util.spec_from_file_location("ha_calc_pricing_standalone", _PRICING)
assert _spec and _spec.loader
_mod = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(_mod)

calculate_pricing = _mod.calculate_pricing
margin_price = _mod.margin_price


def test_margin_price_formula() -> None:
    assert abs(margin_price(100.0, 0.6) - 250.0) < 1e-9
    assert abs(margin_price(100.0, 0.75) - 400.0) < 1e-9
    assert abs(margin_price(100.0, 0.8) - 500.0) < 1e-9


def test_table_mass_and_split_by_n() -> None:
    """mass_g is whole table; per_piece * N == table."""
    r = calculate_pricing(
        price_kg=1000.0,
        mass_g=200.0,
        print_hours=2.0,
        models_on_table=2,
        material_factor=1.0,
        hourly_rate=50.0,
        additional_lines=[(1.0, 10.0)],
    )
    plastic_table = 0.2 * 1000.0
    additionals_table = 2.0 * 10.0
    machine_table = 2.0 * 50.0
    table_expect = plastic_table + additionals_table + machine_table
    piece_expect = table_expect / 2.0
    assert abs(r["table_total"]["landed"] - table_expect) < 1e-9
    assert abs(r["per_piece"]["landed"] - piece_expect) < 1e-9
    assert abs(r["per_piece"]["landed"] * 2.0 - r["table_total"]["landed"]) < 1e-9
    b = r["breakdown"]
    assert abs(b["plastic_table"] - plastic_table) < 1e-9
    assert abs(b["additionals_table"] - additionals_table) < 1e-9
    assert abs(b["machine_table"] - machine_table) < 1e-9


def test_breakdown_per_piece_sums_to_piece_landed() -> None:
    r = calculate_pricing(
        price_kg=800.0,
        mass_g=100.0,
        print_hours=1.0,
        models_on_table=4,
        material_factor=1.1,
        hourly_rate=120.0,
        additional_lines=[(2.0, 15.5)],
    )
    b = r["breakdown"]
    expect = b["plastic_per_piece"] + b["additionals_per_piece"] + b["machine_per_piece"]
    assert abs(r["per_piece"]["landed"] - expect) < 1e-9
