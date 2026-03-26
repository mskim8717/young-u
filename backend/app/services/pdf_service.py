import tempfile
import os
from pathlib import Path


async def extract_text_from_pdf(file_bytes: bytes, filename: str) -> str:
    """Extract text from PDF. Tries opendataloader-pdf first, falls back to pdfplumber."""

    # Try opendataloader-pdf first
    try:
        import opendataloader_pdf

        with tempfile.TemporaryDirectory() as tmpdir:
            input_path = os.path.join(tmpdir, filename)
            output_dir = os.path.join(tmpdir, "output")
            os.makedirs(output_dir, exist_ok=True)

            with open(input_path, "wb") as f:
                f.write(file_bytes)

            opendataloader_pdf.convert(
                input_path=[input_path],
                output_dir=output_dir,
                format="markdown",
            )

            md_files = list(Path(output_dir).rglob("*.md"))
            if md_files:
                return md_files[0].read_text(encoding="utf-8")

            txt_files = list(Path(output_dir).rglob("*.txt"))
            if txt_files:
                return txt_files[0].read_text(encoding="utf-8")
    except Exception:
        pass

    # Fallback: pdfplumber
    try:
        import pdfplumber
        import io

        text_parts = []
        with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text_parts.append(page_text)
        return "\n\n".join(text_parts)
    except Exception as e:
        return f"PDF 텍스트 추출 실패: {str(e)}"
