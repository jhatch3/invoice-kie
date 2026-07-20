"""Fine-tune LayoutLMv3 for token classification on CORD.

Produces a saved model + processor + label_map.json under `output_dir`, which the production
`LayoutLMv3Pipeline` (Phase 2c) and the eval harness (Phase 3) load.
"""

from __future__ import annotations

import json
from pathlib import Path

import torch
from transformers import (
    LayoutLMv3ForTokenClassification,
    LayoutLMv3Processor,
    Trainer,
    TrainingArguments,
)

from app.extraction.labels import build_label_list, label_maps
from app.train.config import TrainConfig
from app.train.dataset import build_dataset


def train(cfg: TrainConfig) -> Path:
    """Run training and save the artifact. Returns the output directory."""
    labels = build_label_list()
    label2id, id2label = label_maps(labels)

    processor = LayoutLMv3Processor.from_pretrained(cfg.model_name, apply_ocr=False)
    model = LayoutLMv3ForTokenClassification.from_pretrained(
        cfg.model_name,
        num_labels=len(labels),
        id2label=id2label,
        label2id=label2id,
    )

    train_ds = build_dataset(
        "train", processor, cfg.data_dir, limit=cfg.train_limit, max_length=cfg.max_length
    )

    # Train in mixed precision on the GPU. This is not just a speedup: at fp32 even a micro-batch
    # of 2 overflows 8 GB and spills to shared system memory (the Windows WDDM fallback), making
    # steps ~10x slower (~27 s/it vs ~2.5 s/it). Halving the footprint keeps it resident in VRAM.
    # LayoutLMv3 has no gradient checkpointing, so precision + a small micro-batch (with gradient
    # accumulation for the effective batch) is what makes training practical here.
    use_cuda = torch.cuda.is_available()
    use_bf16 = use_cuda and torch.cuda.is_bf16_supported()
    use_fp16 = use_cuda and not use_bf16

    args = TrainingArguments(
        output_dir=str(cfg.output_dir),
        per_device_train_batch_size=cfg.train_batch_size,
        gradient_accumulation_steps=cfg.gradient_accumulation_steps,
        num_train_epochs=cfg.epochs,
        max_steps=cfg.max_steps,
        learning_rate=cfg.learning_rate,
        seed=cfg.seed,
        bf16=use_bf16,
        fp16=use_fp16,
        logging_steps=5,
        save_strategy="no",
        report_to="none",
        dataloader_num_workers=0,
    )

    trainer = Trainer(model=model, args=args, train_dataset=train_ds)
    trainer.train()

    cfg.output_dir.mkdir(parents=True, exist_ok=True)
    model.save_pretrained(cfg.output_dir)
    processor.save_pretrained(cfg.output_dir)
    (cfg.output_dir / "label_map.json").write_text(
        json.dumps(
            {"label2id": label2id, "id2label": {str(k): v for k, v in id2label.items()}},
            indent=2,
        ),
        encoding="utf-8",
    )
    return cfg.output_dir
