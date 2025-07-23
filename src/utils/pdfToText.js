import { getDocument, GlobalWorkerOptions, version } from 'pdfjs-dist';

GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${version}/pdf.worker.min.js`;

export async function pdfToText(file) {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await getDocument({ data: arrayBuffer }).promise;

  let fullText = '';

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const content = await page.getTextContent();

    const lines = [];
    let currentY = null;
    let currentLine = [];

    for (const item of content.items) {
      const { str, transform } = item;
      const y = transform[5];

      if (currentY === null || Math.abs(y - currentY) > 5) {
        if (currentLine.length > 0) {
          lines.push(currentLine.join(' '));
          currentLine = [];
        }
        currentY = y;
      }

      currentLine.push(str);
    }

    if (currentLine.length > 0) {
      lines.push(currentLine.join(' '));
    }

    fullText += lines.join('\n') + '\n\n';
  }

  return fullText.trim();
}