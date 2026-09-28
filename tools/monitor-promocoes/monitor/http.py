"""HTTP mínimo com a biblioteca padrão (sem dependências pra instalar)."""

from __future__ import annotations

import json
import urllib.error
import urllib.request

USER_AGENT = "monitor-promocoes/1.0"


class HttpError(RuntimeError):
    pass


def request_json(
    url: str,
    method: str = "GET",
    headers: dict[str, str] | None = None,
    body: bytes | None = None,
    timeout: float = 20,
) -> dict:
    req = urllib.request.Request(url, data=body, method=method)
    req.add_header("User-Agent", USER_AGENT)
    req.add_header("Accept", "application/json")
    for name, value in (headers or {}).items():
        req.add_header(name, value)
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as err:
        detail = err.read().decode("utf-8", "replace")[:500]
        raise HttpError(f"{method} {url} -> HTTP {err.code}: {detail}") from err
    except urllib.error.URLError as err:
        raise HttpError(f"{method} {url} -> {err.reason}") from err
