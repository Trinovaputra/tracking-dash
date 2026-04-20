import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import fs from "fs";
import path from "path";

interface GeneratePDFParams {
  userName: string;
  pelatihanName: string;
  lokasi: string;
  tanggalTerbit: Date;
  urutPendaftar: number;
}

export async function buildCertificatePDF({
  userName,
  pelatihanName,
  lokasi,
  tanggalTerbit,
  urutPendaftar
}: GeneratePDFParams): Promise<string> {
  
  const nomorUrutStr = String(urutPendaftar).padStart(3, '0');
  const inisialPelatihan = pelatihanName.split(' ').map(w => w[0]).join('').toUpperCase();
  const bulanStr = String(tanggalTerbit.getMonth() + 1).padStart(2, '0');
  const tahunStr = tanggalTerbit.getFullYear();
  const uidSertifikat = `No. ${nomorUrutStr}/FMM/${inisialPelatihan}/${bulanStr}/${tahunStr}`;

  const tanggalTerbitStr = tanggalTerbit.toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric",
  });

  const templatePath = path.join(process.cwd(), "public", "template-sertifikat.png");
  const templateBytes = fs.readFileSync(templatePath);
  
  const pdfDoc = await PDFDocument.create();
  const image = await pdfDoc.embedPng(templateBytes);
  const { width, height } = image.scale(1);
  const page = pdfDoc.addPage([width, height]);
  page.drawImage(image, { x: 0, y: 0, width, height });

  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const colorName = rgb(0.31, 0.13, 0.79); 
  const colorText = rgb(0.35, 0.25, 0.65); 

  // --- 1. PENGATURAN UKURAN FONT ---
  const uidFontSize = Math.round(height * 0.028);      
  const baseNameFontSize = Math.round(height * 0.068); 
  const descFontSize = Math.round(height * 0.023);     

  // --- 2. KOORDINAT Y (NAIK-TURUN) ---
  // Dinaikkan ke 0.795 agar duduk pas di garis biru yang kamu gambar
  const yPosisiUID = height * 0.795;  
  
  const yPosisiNama = height * 0.525; 
  const yPosisiDesc1 = height * 0.440; 
  const yPosisiDesc2 = height * 0.402; 
  const yPosisiDesc3 = height * 0.364; 

  // --- 3. KOORDINAT X ---
  const centerX = width * 0.65; 
  const rightMarginX = width - (width * 0.08); 

  // --- TULIS UID (Rata Kanan) ---
  const uidWidth = fontRegular.widthOfTextAtSize(uidSertifikat, uidFontSize);
  page.drawText(uidSertifikat, {
    x: rightMarginX - uidWidth, 
    y: yPosisiUID,
    size: uidFontSize, 
    font: fontRegular, 
    color: colorName,
  });

  // --- TULIS NAMA PESERTA ---
  const namaPeserta = userName.toUpperCase();
  let currentNameSize = baseNameFontSize;
  let nameTextWidth = fontBold.widthOfTextAtSize(namaPeserta, currentNameSize);
  
  const maxNameWidth = width * 0.60; 
  if (nameTextWidth > maxNameWidth) {
    currentNameSize = (maxNameWidth / nameTextWidth) * currentNameSize;
    nameTextWidth = fontBold.widthOfTextAtSize(namaPeserta, currentNameSize);
  }

  page.drawText(namaPeserta, {
    x: centerX - (nameTextWidth / 2), 
    y: yPosisiNama, 
    size: currentNameSize, 
    font: fontBold, 
    color: colorName,
  });

  // --- TULIS DESKRIPSI (Rata Kanan Penuh) ---
  const descLine1 = `Has participated and completed the ${pelatihanName}`;
  const descLine2 = `training held by Feducation Mitra Mediatama on ${tanggalTerbitStr}`;
  const descLine3 = `at ${lokasi}`;

  const descWidth1 = fontRegular.widthOfTextAtSize(descLine1, descFontSize);
  page.drawText(descLine1, {
    x: rightMarginX - descWidth1, 
    y: yPosisiDesc1, 
    size: descFontSize, font: fontRegular, color: colorText,
  });

  const descWidth2 = fontRegular.widthOfTextAtSize(descLine2, descFontSize);
  page.drawText(descLine2, {
    x: rightMarginX - descWidth2, 
    y: yPosisiDesc2, 
    size: descFontSize, font: fontRegular, color: colorText,
  });

  const descWidth3 = fontRegular.widthOfTextAtSize(descLine3, descFontSize);
  page.drawText(descLine3, {
    x: rightMarginX - descWidth3, 
    y: yPosisiDesc3, 
    size: descFontSize, font: fontRegular, color: colorText,
  });

  // Simpan File
  const pdfBytes = await pdfDoc.save();
  const fileName = `Sertifikat_Feducation-${userName.replace(/\s+/g, "-")}-${Date.now()}.pdf`;
  const savePath = path.join(process.cwd(), "public", "sertifikats", fileName);

  const dir = path.dirname(savePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(savePath, pdfBytes);

  return `/sertifikats/${fileName}`; 
}