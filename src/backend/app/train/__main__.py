"""CLI entry: `python -m app.train` (run from src/backend).

Examples:
  python -m app.train                              # full fine-tune (needs a GPU for reasonable time)
  python -m app.train --train-limit 16 --max-steps 20   # fast smoke run
"""

from __future__ import annotations

import argparse

from app.train.config import TrainConfig
from app.train.train import train


def main() -> None:
    parser = argparse.ArgumentParser(description="Fine-tune LayoutLMv3 on CORD.")
    parser.add_argument("--epochs", type=float, default=5.0)
    parser.add_argument("--batch-size", type=int, default=2)
    parser.add_argument("--learning-rate", type=float, default=5e-5)
    parser.add_argument("--train-limit", type=int, default=None, help="cap training examples")
    parser.add_argument("--max-steps", type=int, default=-1, help="-1 = use epochs")
    args = parser.parse_args()

    cfg = TrainConfig(
        epochs=args.epochs,
        train_batch_size=args.batch_size,
        learning_rate=args.learning_rate,
        train_limit=args.train_limit,
        max_steps=args.max_steps,
    )
    out = train(cfg)
    print(f"Saved model + label_map.json to {out}")


if __name__ == "__main__":
    main()
