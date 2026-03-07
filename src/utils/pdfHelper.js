import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export const buildPdfFileName = (baseName = "document") => {
  const safeBaseName = String(baseName)
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "_")
    .trim();

  const datePart = new Date().toISOString().slice(0, 10);

  return `${safeBaseName || "document"}_${datePart}.pdf`;
};

export const downloadElementAsPdf = async ({
  element,
  fileName = "document.pdf",
  orientation = "p",
  unit = "mm",
  format = "a4",
  scale = 2,
}) => {
  if (!element) {
    throw new Error("PDF element not found.");
  }

  const canvas = await html2canvas(element, {
    scale,
    useCORS: true,
    allowTaint: true,
    backgroundColor: "#ffffff",
    scrollX: 0,
    scrollY: 0,
    windowWidth: element.scrollWidth,
    windowHeight: element.scrollHeight,
  });

  const imgData = canvas.toDataURL("image/jpeg", 1.0);
  const pdf = new jsPDF(orientation, unit, format);

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  const imgWidth = pageWidth;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  let heightLeft = imgHeight;
  let position = 0;

  pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
  heightLeft -= pageHeight;

  while (heightLeft > 0) {
    position = heightLeft - imgHeight;
    pdf.addPage();
    pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
  }

  pdf.save(fileName);
};