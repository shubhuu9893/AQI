"""Educational merge‑sort implementation.

The function operates on a list of comparable items and returns a new sorted
list.  It is intentionally written in a clear, recursion‑based style to aid
learning; it is not optimised for performance.
"""

from __future__ import annotations

from typing import List, TypeVar

T = TypeVar("T")


def merge_sort(arr: List[T]) -> List[T]:
    if len(arr) <= 1:
        return arr[:]
    mid = len(arr) // 2
    left = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])
    return _merge(left, right)


def _merge(a: List[T], b: List[T]) -> List[T]:
    result: List[T] = []
    i = j = 0
    while i < len(a) and j < len(b):
        if a[i] <= b[j]:
            result.append(a[i]); i += 1
        else:
            result.append(b[j]); j += 1
    result.extend(a[i:])
    result.extend(b[j:])
    return result