import { readFile, mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

const here = dirname(fileURLToPath(import.meta.url));
const frontendRoot = resolve(here, "..");

const samples = JSON.parse(
  await readFile(resolve(frontendRoot, "lib/samples.json"), "utf8"),
);

const money = (n, currency) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency }).format(n);

async function buildPdf(sample) {
  const doc = await PDFDocument.create();
  const page = doc.addPage([595, 842]); // A4 in points
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const ink = rgb(0.1, 0.1, 0.12);
  const muted = rgb(0.42, 0.45, 0.5);

  let y = 780;
  const line = (text, { x = 50, size = 11, f = font, color = ink } = {}) =>
    page.drawText(String(text), { x, y, size, font: f, color });

  line(sample.seller, { size: 22, f: bold });
  y -= 18;
  line("INVOICE", { size: 12, f: bold, color: muted });
  y -= 40;
  line(`Invoice #: ${sample.invoiceNumber}`, { f: bold });
  y -= 18;
  line(`Date: ${sample.date}`, { color: muted });
  y -= 40;

  line("Description", { f: bold });
  line("Amount", { x: 430, f: bold });
  y -= 6;
  page.drawLine({
    start: { x: 50, y },
    end: { x: 545, y },
    thickness: 1,
    color: muted,
  });
  y -= 22;
  for (const item of sample.lineItems) {
    line(item.name);
    line(money(item.price, sample.currency), { x: 430 });
    y -= 20;
  }
  y -= 10;
  line("Subtotal", { x: 350 });
  line(money(sample.subtotal, sample.currency), { x: 430 });
  y -= 18;
  line("Tax", { x: 350 });
  line(money(sample.tax, sample.currency), { x: 430 });
  y -= 20;
  line("Total", { x: 350, f: bold });
  line(money(sample.total, sample.currency), { x: 430, f: bold });

  return doc.save();
}

const outDir = resolve(frontendRoot, "public/samples");
await mkdir(outDir, { recursive: true });

for (const sample of samples) {
  const bytes = await buildPdf(sample);
  await writeFile(resolve(outDir, sample.fileName), bytes);
}

console.log(`Generated ${samples.length} sample PDF(s) in public/samples.`);
