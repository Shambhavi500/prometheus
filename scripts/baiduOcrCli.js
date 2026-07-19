#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

/**
 * Standalone Node.js CLI script for testing the Baidu OCR API integration.
 * Usage:
 *   node scripts/baiduOcrCli.js <path_to_image_or_pdf>
 * 
 * Set environment variables before running:
 *   $env:BAIDU_API_KEY="your_api_key"
 *   $env:BAIDU_SECRET_KEY="your_secret_key"
 */

const apiKey = process.env.BAIDU_API_KEY;
const secretKey = process.env.BAIDU_SECRET_KEY;

async function getAccessToken() {
  if (!apiKey || !secretKey) {
    console.warn("⚠️  BAIDU_API_KEY or BAIDU_SECRET_KEY not set. Using dry-run mock mode.");
    return null;
  }
  
  const url = `https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=${encodeURIComponent(apiKey)}&client_secret=${encodeURIComponent(secretKey)}`;
  const res = await fetch(url, { method: 'POST' });
  if (!res.ok) {
    throw new Error(`Auth failed: ${res.statusText}`);
  }
  const data = await res.json();
  return data.access_token;
}

async function main() {
  const filePath = process.argv[2];
  if (!filePath) {
    console.log("Usage: node scripts/baiduOcrCli.js <path_to_image_or_pdf>");
    console.log("\nSimulated execution:");
    console.log("No file provided, running standard OCR mock check...");
    console.log(JSON.stringify({
      log_id: 12345678,
      words_result: [
        { words: "HELIOS GRID REVIEW BOARD" },
        { words: "PROJECT: AQUILA SWITCHGEAR TEST REPORT" },
        { words: "VERDICT: APPROVED" }
      ]
    }, null, 2));
    return;
  }

  const absolutePath = path.resolve(filePath);
  if (!fs.existsSync(absolutePath)) {
    console.error(`Error: File not found at ${absolutePath}`);
    process.exit(1);
  }

  const fileBuffer = fs.readFileSync(absolutePath);
  const base64Content = fileBuffer.toString('base64');

  try {
    const token = await getAccessToken();
    if (!token) {
      console.log("\n=== MOCK OCR RESULT (No Credentials Supplied) ===");
      console.log(`File: ${path.basename(filePath)}`);
      console.log(JSON.stringify({
        log_id: Date.now(),
        words_result: [
          { words: `[OCR Mock Basic Extraction for ${path.basename(filePath)}]` },
          { words: "PARAMETER: Nominal power voltage 110kV" },
          { words: "EQUIPMENT: TX-01 Autotransformer" }
        ]
      }, null, 2));
      return;
    }

    console.log("🔄 Contacting Baidu OCR Cloud service...");
    const url = `https://aip.baidubce.com/rest/2.0/ocr/v1/accurate_basic?access_token=${token}`;
    
    const body = new URLSearchParams();
    body.append("image", base64Content);

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body.toString()
    });

    if (!res.ok) {
      throw new Error(`OCR Processing failed: ${res.statusText}`);
    }

    const result = await res.json();
    console.log("\n=== OCR SUCCESS ===");
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error("❌ Error running Baidu OCR:", error.message);
    process.exit(1);
  }
}

main();
