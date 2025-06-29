// document.addEventListener("DOMContentLoaded", () => {
//   const report = JSON.parse(localStorage.getItem("ransomshield_report"));
//   const container = document.getElementById("report-output");
//   const count = document.getElementById("file-count");

//   if (!container || !count) {
//     console.error("❌ container or count element not found in DOM");
//     return;
//   }

//   if (!report || !report.reports) {
//     container.innerHTML = `<p style='color:red'>No report found. Please run a scan first.</p>`;
//   } else {
//     count.textContent = `📁 Files Analyzed: ${report.totalFiles} | ⏱️ Time: ${new Date(report.timestamp).toLocaleString()}`;
//     report.reports.forEach(r => {
//       const div = document.createElement("div");
//       div.classList.add("report-entry");
//       div.innerHTML = `<h3>📄 ${r.file}</h3><pre>${r.analysis}</pre>`;
//       container.appendChild(div);
//     });
//   }

//   window.downloadPDF = async function () {
//     const { jsPDF } = window.jspdf;
//     const doc = new jsPDF();
//     doc.setFont("courier", "normal");
//     doc.setFontSize(12);
//     doc.text("RansomShield AI Threat Report", 10, 10);

//     if (report && report.reports) {
//       let y = 20;
//       for (let i = 0; i < report.reports.length; i++) {
//         const entry = report.reports[i];
//         const lines = doc.splitTextToSize(`${i + 1}. File: ${entry.file}\n${entry.analysis}`, 180);
//         if (y + lines.length * 8 > 280) {
//           doc.addPage();
//           y = 20;
//         }
//         doc.text(lines, 10, y);
//         y += lines.length * 8;
//       }
//       doc.save("ransomshield_threat_report.pdf");
//     }
//   };
// });


// 📁 /public/main.js
// Shows a hardcoded fake report without relying on localStorage

document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("report-output");
  const count = document.getElementById("file-count");

  const fakeReport = {
    totalFiles: 1,
    timestamp: new Date().toISOString(),
    reports: [
      {
        file: "ransom_test.js",
        analysis: `
Threat Score: 9/10

Suspicious Patterns:
- File deletion using fs.unlinkSync()
- Writes encrypted content to a file
- No user prompt before critical file operations
- Usage of obfuscated variable names

Suggested Fixes:
- Avoid automatic file deletions
- Use encryption libraries responsibly
- Always request user confirmation before executing destructive actions
- Refactor obfuscated code to improve maintainability
        `.trim()
      }
    ]
  };

  // Fill summary
  count.textContent = `📁 Files Analyzed: ${fakeReport.totalFiles} | ⏱️ Time: ${new Date(fakeReport.timestamp).toLocaleString()}`;

  // Render fake report
  fakeReport.reports.forEach((r) => {
    const div = document.createElement("div");
    div.classList.add("report-entry");
    div.innerHTML = `
      <h3>📄 ${r.file}</h3>
      <pre>${r.analysis}</pre>
    `;
    container.appendChild(div);
  });

  // PDF Download Function
  window.downloadPDF = async function () {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFont("courier", "normal");
    doc.setFontSize(12);
    doc.text("RansomShield AI Threat Report", 10, 10);

    let y = 20;
    fakeReport.reports.forEach((entry, i) => {
      const lines = doc.splitTextToSize(`${i + 1}. File: ${entry.file}\n${entry.analysis}`, 180);
      if (y + lines.length * 8 > 280) {
        doc.addPage();
        y = 20;
      }
      doc.text(lines, 10, y);
      y += lines.length * 8;
    });

    doc.save("ransomshield_fake_report.pdf");
  };
});