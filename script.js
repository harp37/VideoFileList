let fileList = [];
let disableResolutions = false;
let disableExtensions = false;
let replaceDots = false;
let curtailLongTitles = false;

function handleGenerateList() {
  const fileInput = document.getElementById('fileInput');
  if (fileInput.files.length === 0) {
    alert('Please select one or more files.');
    return;

  const fileListDiv = document.getElementById('fileList');
  fileListDiv.classList.add('file-list-generated');
  }

  fileList = Array.from(fileInput.files);
  createFileList();
}

function createFileList() {
  const fileListDiv = document.getElementById('fileList');
  fileListDiv.innerHTML = ''; // Clear previous file list

  const table = document.createElement('table');
  const tableHead = document.createElement('thead');
  const tableBody = document.createElement('tbody');
  const headerRow = document.createElement('tr');

  const headers = ['File Name', 'Runtime', 'Bitrate (Mbps)', 'Date Modified'];
  headers.forEach(headerText => {
    const headerCell = document.createElement('th');
    headerCell.textContent = headerText;
    headerRow.appendChild(headerCell);
  });

  tableHead.appendChild(headerRow);
  table.appendChild(tableHead);
  table.appendChild(tableBody);
  fileListDiv.appendChild(table);

  fileList.forEach(file => {
    const fileRow = document.createElement('tr');
    const fileNameCell = document.createElement('td');
    let fileName = file.name;

    if (disableResolutions) {
      fileName = removeResolutionsFromFileName(fileName);
    }

    if (disableExtensions) {
      fileName = removeExtensionsFromFileName(fileName);
    }

    if (replaceDots) {
      fileName = replaceDotsWithSpaces(fileName);
    }

    if (curtailLongTitles) {
      fileName = curtailFileName(fileName);
    }

    fileNameCell.textContent = fileName;
    const runtimeCell = document.createElement('td');
    const bitrateCell = document.createElement('td');
    const modifiedDateCell = document.createElement('td');

    getVideoMetadata(file, runtimeCell, bitrateCell, modifiedDateCell);

    fileRow.appendChild(fileNameCell);
    fileRow.appendChild(runtimeCell);
    fileRow.appendChild(bitrateCell);
    fileRow.appendChild(modifiedDateCell);
    tableBody.appendChild(fileRow);
  });

  // Call function to add export buttons
  addExportButtons();
}

function addExportButtons() {
  const fileListDiv = document.getElementById('fileList');

  // Remove existing export buttons if any
  const existingExportButtonsDiv = document.getElementById('exportButtonsDiv');
  if (existingExportButtonsDiv) {
    fileListDiv.removeChild(existingExportButtonsDiv);
  }

  // Create a div to hold the export buttons
  const exportButtonsDiv = document.createElement('div');
  exportButtonsDiv.id = 'exportButtonsDiv';

  // Create the export buttons
  const exportPDFButton = document.createElement('button');
  exportPDFButton.textContent = 'Export to PDF';
  exportPDFButton.addEventListener('click', exportToPDF);
  exportButtonsDiv.appendChild(exportPDFButton);

  const exportPNGButton = document.createElement('button');
  exportPNGButton.textContent = 'Export to PNG';
  exportPNGButton.addEventListener('click', exportToPNG);
  exportButtonsDiv.appendChild(exportPNGButton);

  const exportPlainTextButton = document.createElement('button');
  exportPlainTextButton.textContent = 'Export to Plain Text';
  exportPlainTextButton.addEventListener('click', exportToPlainText);
  exportButtonsDiv.appendChild(exportPlainTextButton);

  const exportExcelButton = document.createElement('button');
  exportExcelButton.textContent = 'Export to Excel Spreadsheet';
  exportExcelButton.addEventListener('click', exportToExcel);
  exportButtonsDiv.appendChild(exportExcelButton);

  // Append the export buttons to the file list div
  fileListDiv.appendChild(exportButtonsDiv);
}

function getVideoMetadata(file, runtimeCell, bitrateCell, dateModifiedCell) {
  const video = document.createElement('video');
  video.preload = 'metadata';
  video.onloadedmetadata = function() {
    const seconds = video.duration;
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const formattedSeconds = Math.floor(seconds % 60);

    const runtime = `${pad(hours, 2)}:${pad(minutes, 2)}:${pad(formattedSeconds, 2)}`;

    const bitrate = calculateBitrate(file, seconds);

    runtimeCell.textContent = runtime;
    bitrateCell.textContent = bitrate;
    dateModifiedCell.textContent = formatDate(file.lastModified);
  };
  video.src = URL.createObjectURL(file);
}

function calculateBitrate(file, duration) {
  const fileSize = file.size;
  const bits = fileSize * 8;
  const megabits = bits / (1024 * 1024);
  const bitrate = megabits / duration;
  return bitrate.toFixed(2);
}

function formatDate(timestamp) {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function exportToPDF() {
  const table = document.querySelector('table');
  const fileListDiv = document.getElementById('fileList');
  const fileListHeight = fileListDiv.offsetHeight;

  const pdfContent = `
    <html>
    <head>
      <title>Video File List</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Open+Sans&display=swap');

        body {
          font-family: 'Open Sans', Arial, sans-serif;
          margin: 0;
          font-size: 12px;
        }

        .pdf-container {
          width: 100%;
          height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .pdf-content {
          width: 100%;
          height: 100%;
          margin: 0;
          background-color: #fff;
          padding: 1in;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 12px;
        }

        th {
          background-color: #333;
          color: #fff;
          padding: 10px;
          text-align: left;
        }

        td {
          padding: 10px;
        }

        tr:nth-child(even) {
          background-color: #fff;
        }

        .pdf-footer {
          margin-top: 20px;
          font-style: italic;
          text-align: center;
          color: #333;
        }
      </style>
    </head>
    <body>
      <div class="pdf-container">
        <div class="pdf-content">
          ${table.outerHTML}
          <div class="pdf-footer">
            This PDF was beautifully crafted by Video File List.
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  const iframe = document.createElement('iframe');
  iframe.style.display = 'none';
  document.body.appendChild(iframe);
  const iframeWindow = iframe.contentWindow;

  iframeWindow.document.open();
  iframeWindow.document.write(pdfContent);
  iframeWindow.document.close();

  iframeWindow.print();
}

function exportToPNG() {
  const table = document.querySelector('table');
  const fileListDiv = document.getElementById('fileList');
  const fileListHeight = fileListDiv.offsetHeight;

  html2canvas(table, { height: fileListHeight })
    .then(canvas => {
      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = image;
      link.download = 'file_list.png';
      link.click();
    });
}

function exportToPlainText() {
  const table = document.querySelector('table');
  const rows = Array.from(table.querySelectorAll('tr'));

  let plainTextContent = '';

  rows.forEach(row => {
    const cells = Array.from(row.querySelectorAll('td'));
    plainTextContent += '| '; // Add " | " at the beginning of each line

    cells.forEach((cell, index) => {
      plainTextContent += cell.textContent;
      if (index !== cells.length - 1) {
        plainTextContent += ' | '; // Add " | " between columns
      }
    });

    plainTextContent += ' |\n'; // Add " | " at the end of each line and a new line
  });

  const link = document.createElement('a');
  link.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(plainTextContent);
  link.download = 'file_list.txt';
  link.click();
}

function exportToExcel() {
  const table = document.querySelector('table');
  const rows = Array.from(table.querySelectorAll('tr'));

  let excelContent = 'File Name\tRuntime\tBitrate\tDate Modified\n'; // Excel header row

  rows.forEach(row => {
    const cells = Array.from(row.querySelectorAll('td'));

    cells.forEach((cell, index) => {
      excelContent += cell.textContent;
      if (index !== cells.length - 1) {
        excelContent += '\t'; // Tab character to separate columns
      }
    });

    excelContent += '\n'; // New line character to separate rows
  });

  const link = document.createElement('a');
  link.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(excelContent);
  link.download = 'file_list.xlsx';
  link.click();
}

function pad(num, size) {
  let padded = String(num);
  while (padded.length < size) {
    padded = '0' + padded;
  }
  return padded;
}

function toggleDisableResolutions() {
  disableResolutions = !disableResolutions;
  createFileList();
}

function toggleDisableExtensions() {
  disableExtensions = !disableExtensions;
  createFileList();
}

function removeResolutionsFromFileName(fileName) {
  const resolutions = ['4k', '2160p', '1080p', '720p', '480p', '480p-1080p', '8k', ' UHD' ' HD'];
  resolutions.forEach(resolution => {
    fileName = fileName.replace(new RegExp(resolution, 'gi'), '');
  });
  return fileName.trim();
}

function removeExtensionsFromFileName(fileName) {
  const extensions = ['.mp4', '.wmv', '.mkv', '.mov', '.mpeg', '.mpg', '.webm', '.ogv', '.f4v', '.flv', '.avi', '.m4p', '.MTS', '.M2TS', '.TS', '.m4v'];
  extensions.forEach(extension => {
    fileName = fileName.replace(new RegExp(extension, 'gi'), '');
  });
  return fileName.trim();
}

function toggleReplaceDots() {
  replaceDots = !replaceDots;
  createFileList();
}

function toggleCurtailLongTitles() {
  curtailLongTitles = !curtailLongTitles;
  createFileList();
}

function replaceDotsWithSpaces(fileName) {
  return fileName.replace(/\./g, ' ');
}

function curtailFileName(fileName) {
  const maxCharacters = 90;
  if (fileName.length > maxCharacters) {
    fileName = fileName.substring(0, maxCharacters - 3) + '...';
  }
  return fileName;
}
