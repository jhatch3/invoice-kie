"""Training configuration for the LayoutLMv3 fine-tune on CORD."""

from __future__ import annotations

from dataclasses import dataclass, field
from pathlib import Path

# repo root: src/backend/app/train/config.py -> parents[4]
_REPO_ROOT = Path(__file__).resolve().parents[4]


@dataclass
class TrainConfig:
    model_name: str = "microsoft/layoutlmv3-base"
    data_dir: Path = field(default_factory=lambda: _REPO_ROOT / "data" / "cord" / "raw")
    output_dir: Path = field(default_factory=lambda: _REPO_ROOT / "models" / "layoutlmv3-cord")

    epochs: float = 5.0
    learning_rate: float = 5e-5
    # Keep the per-device micro-batch small so it fits in 8 GB VRAM (avoids the Windows
    # shared-memory spill that makes steps ~100x slower); use accumulation for effective batch.
    train_batch_size: int = 2
    gradient_accumulation_steps: int = 4  # effective batch = train_batch_size * this
    max_length: int = 512
    seed: int = 42

    # Caps for a fast smoke run; None / -1 means "use the full split / epochs".
    train_limit: int | None = None
    max_steps: int = -1
