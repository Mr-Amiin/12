#!/usr/bin/env python3
"""
Refreshes rates.json from a live exchange-rate provider.

This is the ONLY script that talks to a live API. The website itself never
calls a live provider directly -- app.js only reads the local rates.json file
(see loadCachedCurrencyRates() in app.js). That keeps page loads fast and
avoids rate-limiting/API-key exposure in the browser.

Run this on a schedule (cron / GitHub Actions / CI) per rates-config.json:
    python3 fetch_rates.py
    python3 fetch_rates.py --provider frankfurter
    python3 fetch_rates.py --config rates-config.json

Example cron lines (see rates-config.json "update_frequency"):
    hourly:  0 * * * *   cd /path/to/site && python3 fetch_rates.py
    6-hour:  0 */6 * * * cd /path/to/site && python3 fetch_rates.py
    daily:   0 3 * * *   cd /path/to/site && python3 fetch_rates.py
"""
import argparse
import json
import sys
import time
import urllib.request
import urllib.error
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent
CONFIG_PATH = ROOT / "rates-config.json"
CURRENCY_DATA_PATH = ROOT / "currency-data.json"
RATES_PATH = ROOT / "rates.json"

DEFAULT_CONFIG = {
    "provider": "frankfurter",
    "update_frequency": "hourly",   # hourly | 6h | daily
    "base": "USD",
    "api_key_env": "EXCHANGE_RATE_API_KEY",  # only needed by key-based providers
    "timeout_seconds": 10,
}


# --- Provider abstraction -------------------------------------------------
# Each provider function takes (base_currency, api_key) and returns a dict of
# {ISO_CODE: rate_relative_to_USD}. Swapping providers only means adding a
# function here and pointing "provider" at it in rates-config.json.

def fetch_frankfurter(base, api_key):
    """https://www.frankfurter.app -- free, no key, ECB-derived, ~30 currencies."""
    url = f"https://api.frankfurter.app/latest?from={base}"
    with urllib.request.urlopen(url, timeout=10) as resp:
        data = json.loads(resp.read().decode("utf-8"))
    rates = data.get("rates", {})
    rates[base] = 1.0
    return rates


def fetch_exchangerate_host(base, api_key):
    """https://exchangerate.host -- free, no key, broad currency coverage."""
    url = f"https://api.exchangerate.host/latest?base={base}"
    with urllib.request.urlopen(url, timeout=10) as resp:
        data = json.loads(resp.read().decode("utf-8"))
    rates = data.get("rates", {})
    rates[base] = 1.0
    return rates


def fetch_currencyapi(base, api_key):
    """https://currencyapi.com -- requires an API key."""
    if not api_key:
        raise RuntimeError("currencyapi provider requires an API key")
    url = f"https://api.currencyapi.com/v3/latest?apikey={api_key}&base_currency={base}"
    with urllib.request.urlopen(url, timeout=10) as resp:
        data = json.loads(resp.read().decode("utf-8"))
    rates = {code: v["value"] for code, v in data.get("data", {}).items()}
    rates[base] = 1.0
    return rates


def fetch_open_exchange_rates(base, api_key):
    """https://openexchangerates.org -- requires an App ID; free tier bases at USD only."""
    if not api_key:
        raise RuntimeError("open_exchange_rates provider requires an app id")
    url = f"https://openexchangerates.org/api/latest.json?app_id={api_key}"
    with urllib.request.urlopen(url, timeout=10) as resp:
        data = json.loads(resp.read().decode("utf-8"))
    rates = data.get("rates", {})
    rates["USD"] = 1.0
    if base != "USD" and base in rates and rates[base]:
        pivot = rates[base]
        rates = {code: (v / pivot) for code, v in rates.items()}
    return rates


def fetch_fixer(base, api_key):
    """https://fixer.io -- requires an access key; free tier bases at EUR only."""
    if not api_key:
        raise RuntimeError("fixer provider requires an access key")
    url = f"http://data.fixer.io/api/latest?access_key={api_key}"
    with urllib.request.urlopen(url, timeout=10) as resp:
        data = json.loads(resp.read().decode("utf-8"))
    rates = data.get("rates", {})
    rates["EUR"] = 1.0
    if base != "EUR" and base in rates and rates[base]:
        pivot = rates[base]
        rates = {code: (v / pivot) for code, v in rates.items()}
    return rates


PROVIDERS = {
    "frankfurter": fetch_frankfurter,
    "exchangerate_host": fetch_exchangerate_host,
    "currencyapi": fetch_currencyapi,
    "open_exchange_rates": fetch_open_exchange_rates,
    "fixer": fetch_fixer,
}


def load_config(path):
    if path.exists():
        cfg = json.loads(path.read_text(encoding="utf-8"))
        merged = {**DEFAULT_CONFIG, **cfg}
        return merged
    return dict(DEFAULT_CONFIG)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--provider", help="Override provider from rates-config.json")
    parser.add_argument("--config", default=str(CONFIG_PATH))
    parser.add_argument("--base", help="Override base currency")
    args = parser.parse_args()

    config = load_config(Path(args.config))
    provider_name = args.provider or config["provider"]
    base = args.base or config["base"]

    if provider_name not in PROVIDERS:
        print(f"Unknown provider '{provider_name}'. Options: {', '.join(PROVIDERS)}", file=sys.stderr)
        sys.exit(1)

    import os
    api_key = os.environ.get(config.get("api_key_env", ""), "")

    currencies = json.loads(CURRENCY_DATA_PATH.read_text(encoding="utf-8")) if CURRENCY_DATA_PATH.exists() else {}
    existing = json.loads(RATES_PATH.read_text(encoding="utf-8")) if RATES_PATH.exists() else {"rates": {}}
    fallback_rates = dict(existing.get("rates", {}))

    try:
        live_rates = PROVIDERS[provider_name](base, api_key)
    except (urllib.error.URLError, RuntimeError, TimeoutError, OSError) as exc:
        print(f"Live provider '{provider_name}' failed ({exc}); keeping existing rates.json untouched.", file=sys.stderr)
        sys.exit(2)

    # Merge: live rates win where available; otherwise keep the last-known offline value
    # so every ISO currency in currency-data.json always has *something* to render.
    merged_rates = dict(fallback_rates)
    for code in (currencies.keys() if currencies else live_rates.keys()):
        if code in live_rates:
            merged_rates[code] = live_rates[code]
    merged_rates[base] = 1.0

    payload = {
        "base": base,
        "provider": provider_name,
        "update_frequency": config["update_frequency"],
        "generated_at": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "rates": merged_rates,
    }
    RATES_PATH.write_text(json.dumps(payload, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"Updated rates.json via '{provider_name}': {len(merged_rates)} currencies, base={base}.")


if __name__ == "__main__":
    main()
