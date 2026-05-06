const puppeteer = require('puppeteer');
const path = require('path');

async function generarPDF(htmlContent, options = {}) {
    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
        const page = await browser.newPage();
        
        await page.setContent(htmlContent, {
            waitUntil: 'networkidle0'
        });

        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: {
                top: '20mm',
                right: '20mm',
                bottom: '20mm',
                left: '20mm'
            },
            ...options
        });

        return pdfBuffer;
    } finally {
        await browser.close();
    }
}

module.exports = {
    generarPDF
};