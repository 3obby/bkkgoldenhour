const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function createQR(url = 'landparty.club') {
  try {
    const opts = {
      errorCorrectionLevel: 'H',
      margin: 1,
      width: 1000,
      color: {
        dark: '#000000',   // QR code dots color
        light: '#FFFFFF'   // Background color (will be made transparent later)
      }
    };

    // Generate QR code buffer
    const qrImageBuffer = await QRCode.toBuffer(url, opts);
    console.log('QR code buffer created successfully.');

    // Adjust background transparency using sharp
    const qrImageWithAlpha = await sharp(qrImageBuffer)
      .png()
      .flatten({ background: { r: 255, g: 255, b: 255, alpha: 0.1 } }) // Set background to white with 90% transparency
      .toBuffer();

    // Generate QR code SVG string
    const qrSvg = await QRCode.toString(url, { type: 'svg', margin: 1, color: { dark: '#000000', light: '#FFFFFF' } });

    // Adjust the SVG content to set background transparency
    const transparentBackgroundSvg = qrSvg.replace('<rect width="100%" height="100%" fill="#FFFFFF"/>', '<rect width="100%" height="100%" fill="rgba(255,255,255,0.1)"/>');

    // Create qrcode directory if it doesn't exist
    const qrDir = './qrcode';
    if (!fs.existsSync(qrDir)) {
      fs.mkdirSync(qrDir);
    }

    // Save QR code to file
    const filename = `qrcode-${Date.now()}.png`;
    const filepath = path.join(qrDir, filename);
    await fs.promises.writeFile(filepath, qrImageWithAlpha);
    console.log(`QR code saved to file: ${filepath}`);

    // Save SVG to file
    const filenameSvg = `qrcode-${Date.now()}.svg`;
    const filepathSvg = path.join(qrDir, filenameSvg);
    await fs.promises.writeFile(filepathSvg, transparentBackgroundSvg);
    console.log(`QR code saved to file: ${filepathSvg}`);

    return qrImageWithAlpha;
  } catch (err) {
    console.error('Error generating QR code:', err);
    throw err;
  }
}

// Get URL from command line arguments if provided
const url = process.argv[2] || 'landparty.club';

// Invoke the createQR function with the URL
createQR(url);

module.exports = createQR;
