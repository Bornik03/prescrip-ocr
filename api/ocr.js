export const config = {
  api: {
    bodyParser: false,
  },
};

import formidable from "formidable";
import fs from "fs";
import fetch from "node-fetch";
import FormData from "form-data";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  const form = new formidable.IncomingForm();

  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(500).send("Error parsing file");
    }

    const file = files.file;

    if (!file) {
      return res.status(400).send("No file uploaded");
    }

    const formData = new FormData();
    formData.append("file", fs.createReadStream(file.filepath));
    formData.append("apikey", process.env.OCR_API_KEY);
    formData.append("language", "eng");
    formData.append("ocrengine", "3");

    try {
      const response = await fetch("https://api.ocr.space/parse/image", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      const text =
        data?.ParsedResults?.[0]?.ParsedText || "No text found";

      res.status(200).send(text);
    } catch (error) {
      res.status(500).send("OCR API Error");
    }
  });
}
