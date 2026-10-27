# Demo / test documents

Two realistic sample documents are provided as HTML so you can produce the exact file type
needed to exercise each extraction path. They use medicine/test names the app recognises, so
extraction looks clean in a demo.

- `sample-prescription.html` — a prescription (Metformin, Telmisartan, Atorvastatin, Vitamin D3)
- `sample-lab-report.html` — a lab report (HbA1c, FBS, lipid profile, Vitamin D — several out of range)

## How to make uploadable files (and which path each tests)

Open an HTML file in Chrome, then:

| You want to test | Produce this | How |
|---|---|---|
| **PDF text path** (`pdf_text` → Gemini) — fastest, most accurate | a text-layer **PDF** | Chrome → **Print** → **Save as PDF** |
| **Printed OCR path** (`ocr` → Gemini) | a **PNG/JPG image** | Take a **screenshot** of the page (or print to PDF, then screenshot it) |
| **Handwriting / vision path** (`vision` → Gemini reads the image) | a **photo of a handwritten note** | Write a short prescription by hand, photograph it |

Tips for a clean demo:
- The **PDF** gives the cleanest result (no OCR needed) — use it for the main upload shot.
- For the **OCR** shot, a crisp screenshot of the printed page routes to `ocr` (prints are
  high-confidence); a blurry phone photo may route to `vision`.
- Upload the **prescription** as kind *Prescription* and the **lab report** as kind *Lab report*.

## Privacy
These are fictional samples (patient "Sunita Sharma" is not real). Put any real documents in
`demo-documents/private/` (gitignored) — never commit real patient data.
