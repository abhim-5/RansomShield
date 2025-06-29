// 📁 /public/main.js
// Clean RansomShield UI Interactions (No GSAP, No Cursor Trail)

// Load AI report data from localStorage
const report = JSON.parse(localStorage.getItem("ransomshield_report"));
const container = document.getElementById("report-output");
const count = document.getElementById("file-count");

if (!report || !report.reports) {
  container.innerHTML = `<p style='color:red'>No report found. Please run a scan first.</p>`;
} else {
  count.textContent = `📁 Files Analyzed: ${report.totalFiles} | ⏱️ Time: ${new Date(report.timestamp).toLocaleString()}`;
  report.reports.forEach(r => {
    const div = document.createElement("div");
    div.classList.add("report-entry");
    div.innerHTML = `
      <h3>📄 ${r.file}</h3>
      <pre>${r.analysis}</pre>
    `;
    container.appendChild(div);
  });
}

// PDF Download Function
async function downloadPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  doc.setFont("courier", "normal");
  doc.setFontSize(12);
  doc.text("RansomShield AI Threat Report", 10, 10);

  if (report && report.reports) {
    let y = 20;
    for (let i = 0; i < report.reports.length; i++) {
      const entry = report.reports[i];
      const lines = doc.splitTextToSize(`${i + 1}. File: ${entry.file}\n${entry.analysis}`, 180);
      if (y + lines.length * 8 > 280) {
        doc.addPage();
        y = 20;
      }
      doc.text(lines, 10, y);
      y += lines.length * 8;
    }
    doc.save("ransomshield_threat_report.pdf");
  }
}
