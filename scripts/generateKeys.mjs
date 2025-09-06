/**
 * @fileoverview
 * This script generates a new RSA key pair (public and private keys) using Node.js's crypto module.
 * The keys are encoded in PEM format and saved to the 'certs' directory as 'public.pem' and 'private.pem'.
 *
 * Usage:
 *   Run this script to generate new RSA keys for authentication or encryption purposes.
 *
 * Note:
 *   - Requires Node.js v10.12.0 or higher for crypto.generateKeyPairSync.
 *   - Ensure the 'certs' directory exists or handle directory creation before running.
 *
 * @ts-nocheck // Suppress TypeScript errors for Node.js built-in modules and synchronous file operations.
 */
//
import crypto from "crypto";
import fs from "fs";
import path from "path";


// Define the certs directory
const certsDir = path.resolve("certs");

// Ensure the directory exists (recursive allows nested dirs)
if (!fs.existsSync(certsDir)) {
  fs.mkdirSync(certsDir, { recursive: true });
  console.log(`Created directory: ${certsDir}`);
}

const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
  modulusLength: 2048,
  publicKeyEncoding: {
    type: "pkcs1",
    format: "pem",
  },
  privateKeyEncoding: {
    type: "pkcs1",
    format: "pem",
  },
});

console.log("Public Key: ", publicKey);
console.log("Private Key: ", privateKey);

// Save the keys
fs.writeFileSync(path.join(certsDir, "public.pem"), publicKey);
fs.writeFileSync(path.join(certsDir, "private.pem"), privateKey);

console.log("Keys generated and saved in:", certsDir);