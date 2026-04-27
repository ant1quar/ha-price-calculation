"""3D print landed cost and margin prices (gross margin on revenue)."""

from __future__ import annotations

from typing import TypedDict


class MarginPrices(TypedDict):
    """Landed cost and selling prices at fixed margins."""

    landed: float
    price_margin_60: float
    price_margin_75: float
    price_margin_80: float


class PricingBreakdown(TypedDict):
    """Table-level costs; per-piece = table / N for plastic and machine."""

    plastic_table: float
    additionals_table: float
    machine_table: float
    plastic_per_piece: float
    additionals_per_piece: float
    machine_per_piece: float


class PricingResult(TypedDict):
    """Full calculate response body."""

    per_piece: MarginPrices
    table_total: MarginPrices
    breakdown: PricingBreakdown


MARGINS = (0.6, 0.75, 0.8)


def margin_price(landed: float, margin: float) -> float:
    """price = landed / (1 - margin) for target gross margin share of revenue."""
    return landed / (1.0 - margin)


def _margin_block(landed: float) -> MarginPrices:
    return {
        "landed": landed,
        "price_margin_60": margin_price(landed, 0.6),
        "price_margin_75": margin_price(landed, 0.75),
        "price_margin_80": margin_price(landed, 0.8),
    }


def calculate_pricing(
    *,
    price_kg: float,
    mass_g: float,
    print_hours: float,
    models_on_table: int,
    material_factor: float,
    hourly_rate: float,
    additional_lines: list[tuple[float, float]],
) -> PricingResult:
    """mass_g = total filament mass for the whole table (g).

    additional_lines: (qty_per_model, unit_price_rub) — extras per one model;
    table extras = N * sum(qty * price).
    Per-piece landed = table_landed / N (only place N is used for splitting).
    """
    n = float(models_on_table)
    plastic_table = (mass_g / 1000.0) * price_kg * material_factor
    additionals_per_piece = sum(qty * price for qty, price in additional_lines)
    additionals_table = n * additionals_per_piece
    machine_table = print_hours * hourly_rate
    table_landed = plastic_table + additionals_table + machine_table
    piece_landed = table_landed / n

    plastic_per_piece = plastic_table / n
    machine_per_piece = machine_table / n

    return {
        "per_piece": _margin_block(piece_landed),
        "table_total": _margin_block(table_landed),
        "breakdown": {
            "plastic_table": plastic_table,
            "additionals_table": additionals_table,
            "machine_table": machine_table,
            "plastic_per_piece": plastic_per_piece,
            "additionals_per_piece": additionals_per_piece,
            "machine_per_piece": machine_per_piece,
        },
    }
