import { resultFor, genericResult } from "@/lib/samples";

// Frontend-only MOCK of the extraction pipeline. This is NOT the real backend.
// It returns fixture data so the demo works end-to-end before FastAPI exists.

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function POST(request: Request): Promise<Response> {
  const form = await request.formData();
  const file = form.get("file");
  const name = file instanceof File ? file.name : "";
  const ms = Number(process.env.EXTRACT_DELAY_MS ?? 1200);

  // Let a file named `fail.pdf` demonstrate the error path.
  if (name === "fail.pdf") {
    await delay(Math.min(ms, 400));
    return Response.json({ message: "Extraction failed" }, { status: 500 });
  }

  await delay(ms);
  return Response.json(resultFor(name) ?? genericResult);
}
