from __future__ import annotations

import json
import sys
from pathlib import Path


def main() -> int:
    base_path = Path(__file__).resolve().parent.parent
    translations_dir = base_path / "translations"
    files = sorted(translations_dir.glob("*.json"))

    if not files:
        print("No translation files found.")
        return 1

    baseline_path = files[0]
    baseline_keys = set(json.loads(baseline_path.read_text(encoding="utf-8")))
    success = True

    for path in files[1:]:
        keys = set(json.loads(path.read_text(encoding="utf-8")))
        missing = baseline_keys - keys
        extra = keys - baseline_keys

        if missing or extra:
            success = False
            print(f"\n{path.name} does not match {baseline_path.name} keys:")
            if missing:
                print("  Missing keys:", ", ".join(sorted(missing)))
            if extra:
                print("  Extra keys:", ", ".join(sorted(extra)))

    if success:
        print("All translation files share the same keys.")

    return 0 if success else 1


if __name__ == "__main__":
    sys.exit(main())
