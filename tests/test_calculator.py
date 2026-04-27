"""Unit tests for calculator logic (no Home Assistant runtime)."""

from __future__ import annotations

import importlib.util
from pathlib import Path

_CALC = Path(__file__).resolve().parents[1] / "custom_components" / "ha_calc" / "calculator.py"
_spec = importlib.util.spec_from_file_location("ha_calc_calculator_standalone", _CALC)
assert _spec and _spec.loader
_mod = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(_mod)

apply = _mod.apply
get_operations = _mod.get_operations
DivisionByZeroError = _mod.DivisionByZeroError


def test_operations_stable_ids() -> None:
    ops = get_operations()
    assert [o["id"] for o in ops] == ["add", "subtract", "multiply", "divide"]


def test_add_and_divide() -> None:
    assert apply("add", 2, 3) == 5
    assert apply("divide", 10, 2) == 5


def test_subtract_multiply() -> None:
    assert apply("subtract", 10, 3) == 7
    assert apply("multiply", 4, 2.5) == 10


def test_divide_by_zero() -> None:
    try:
        apply("divide", 1, 0)
    except DivisionByZeroError:
        return
    raise AssertionError("expected DivisionByZeroError")
