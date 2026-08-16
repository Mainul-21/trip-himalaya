export type PreparedImageUpload = {
  filename: string;
  mimeType: "image/webp";
  dataBase64: string;
};

const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const maxInputBytes = 12 * 1024 * 1024;
const maxOutputBytes = 1.5 * 1024 * 1024;

function dataUrl(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("That image could not be read."));
    reader.onload = () => resolve(String(reader.result));
    reader.readAsDataURL(blob);
  });
}

function outputName(filename: string) {
  const base = filename.replace(/\.[^.]+$/, "").trim() || "tour-photo";
  return `${base}.webp`;
}

export async function prepareImageUpload(file: File): Promise<PreparedImageUpload> {
  if (!allowedTypes.has(file.type)) {
    throw new Error("Choose a JPG, PNG, or WebP image.");
  }
  if (file.size > maxInputBytes) {
    throw new Error("Choose an image smaller than 12 MB.");
  }

  const source = await createImageBitmap(file);
  const longestSide = Math.max(source.width, source.height);
  const scale = Math.min(1, 1600 / longestSide);
  const width = Math.max(1, Math.round(source.width * scale));
  const height = Math.max(1, Math.round(source.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) {
    source.close();
    throw new Error("Your browser could not prepare that image.");
  }
  context.drawImage(source, 0, 0, width, height);
  source.close();

  const render = (quality: number) =>
    new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(blob => (blob ? resolve(blob) : reject(new Error("That image could not be prepared."))), "image/webp", quality);
    });

  let output = await render(0.8);
  if (output.size > maxOutputBytes) output = await render(0.68);
  if (output.size > maxOutputBytes) {
    throw new Error("This image is still too large after optimisation. Choose a simpler photo.");
  }

  const encoded = await dataUrl(output);
  return {
    filename: outputName(file.name),
    mimeType: "image/webp",
    dataBase64: encoded.split(",")[1] ?? "",
  };
}
