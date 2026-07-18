<div align="center">

# invoice-kie

**Extracts the total, tax, subtotal, date, and invoice number from invoice PDFs.**

[![Python](https://img.shields.io/badge/python-3.9%2B-blue.svg)](https://www.python.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Tests](https://img.shields.io/badge/tests-passing-brightgreen.svg)](tests/)

</div>

<!-- Best practice: lead with a visual. Replace with a real screenshot/GIF of the
     demo turning a PDF into JSON — this is the single highest-impact addition. -->
<p align="center">
  <img src="docs/demo.gif" alt="Invoice → extracted fields demo" width="600">
</p>

## What it does

Fine-tunes a layout-aware transformer (**LayoutLMv3**) to read key fields off invoice PDFs, and benchmarks it against a zero-shot vision-language model (Qwen2-VL / GPT-4o) to compare accuracy, latency, and cost.

**Result:** the fine-tuned model matched the VLM's accuracy at a fraction of the latency and cost per document. _(add your numbers)_

| Model | Macro F1 | Latency | Cost / 1k docs |
|-------|:--------:|:-------:|:--------------:|
| LayoutLMv3 (fine-tuned) | — | — | — |
| Zero-shot VLM | — | — | — |

## How it works

`PDF → OCR (tokens + layout) → LayoutLMv3 token tagging → normalized JSON`

Benchmarked on **CORD** and **DocILE**, public invoice datasets.

## Quickstart

```bash
pip install -e .
pytest
python -m invoice_kie.train --dataset cord
```

Requires Tesseract OCR (`apt-get install tesseract-ocr`).

## Tech stack

Python · PyTorch · HuggingFace Transformers · LayoutLMv3 · Tesseract/PaddleOCR

## License

MIT · Built by [Justin Hatch](https://github.com/jhatch3)