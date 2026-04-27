"""Calculator logic (ported from Nest calculator.service.ts)."""

from __future__ import annotations

from typing import Literal, TypedDict

OperationId = Literal["add", "subtract", "multiply", "divide"]


class OperationMeta(TypedDict):
    """Operation descriptor for UI."""

    id: OperationId
    label: str


OPERATIONS: list[OperationMeta] = [
    {"id": "add", "label": "Сложить"},
    {"id": "subtract", "label": "Вычесть"},
    {"id": "multiply", "label": "Умножить"},
    {"id": "divide", "label": "Разделить"},
]

_ALLOWED: frozenset[str] = frozenset(op["id"] for op in OPERATIONS)


class DivisionByZeroError(Exception):
    """Raised when dividing by zero (maps to same UX as Nest ForbiddenException)."""


def get_operations() -> list[OperationMeta]:
    """Return a copy of the operations list."""
    return list(OPERATIONS)


def is_valid_operation_id(op: str) -> bool:
    """True if op is one of the known operation ids."""
    return op in _ALLOWED


def apply(operation: str, a: float, b: float) -> float:
    """Apply operation to a and b. Raises DivisionByZeroError for divide by zero."""
    if operation == "add":
        return a + b
    if operation == "subtract":
        return a - b
    if operation == "multiply":
        return a * b
    if operation == "divide":
        if b == 0:
            raise DivisionByZeroError
        return a / b
    raise RuntimeError(f"unhandled operation: {operation!r}")
