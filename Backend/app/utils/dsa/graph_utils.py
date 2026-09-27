"""Graph helpers for station connectivity.

We model the network as an adjacency list of station ids.  The utilities
provide BFS and DFS traversal functions that return a list of visited
stations in order of visitation.
"""

from __future__ import annotations

from collections import deque
from typing import Dict, Iterable, List, Set


def bfs(adj: Dict[str, Iterable[str]], start: str) -> List[str]:
    """Breadth‑first search returning a list of visited node ids."""
    visited: Set[str] = set()
    order: List[str] = []
    queue: deque[str] = deque([start])
    while queue:
        node = queue.popleft()
        if node in visited:
            continue
        visited.add(node)
        order.append(node)
        for nb in adj.get(node, []):
            if nb not in visited:
                queue.append(nb)
    return order


def dfs(adj: Dict[str, Iterable[str]], start: str) -> List[str]:
    """Depth‑first search returning a list of visited node ids."""
    visited: Set[str] = set()
    order: List[str] = []

    def _dfs(node: str):
        if node in visited:
            return
        visited.add(node)
        order.append(node)
        for nb in adj.get(node, []):
            _dfs(nb)

    _dfs(start)
    return order