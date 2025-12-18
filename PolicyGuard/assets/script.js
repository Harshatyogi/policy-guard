/* ------------------ REQUIRED FIELDS ------------------ */
const REQUIRED_FIELDS = [
    "CHASSIS NO",
    "ENGINE NUMBER",
    "PLATE NO",
    "REGISTRATION YEAR",
    "MANUFACTURE YEAR",
    "VEHICLE AGE",
    "SEATING CAPACITY",
    "POLICYTYPE",
    "SUMINSURED",
    "CLAIMYN",
    "NO OF CLAIMS",
    "NO CLAIM BONUS",
    "ISCOMMERCIAL YN",
    "DRIVER LICENSE"
];

const BACKEND_URL = "http://localhost:8000";

/* ------------------ BACKEND STATUS ------------------ */
function checkBackendStatus() {
    const popup = document.getElementById("statusPopup");
    popup.style.display = "block";
    popup.innerText = "Checking...";
    popup.className = "status-popup";

    fetch(BACKEND_URL)
        .then(() => {
            popup.innerText = "🟢 Backend Connected";
            popup.classList.add("status-ok");
        })
        .catch(() => {
            popup.innerText = "🔴 Backend Not Connected";
            popup.classList.add("status-fail");
        });

    setTimeout(() => popup.style.display = "none", 3000);
}

/* ------------------ MANUAL VALIDATION ------------------ */
function submitManual() {
    const form = document.getElementById("manualForm");
    let payload = {};

    [...new FormData(form).entries()].forEach(([key, value]) => {
        if (value !== "") payload[key] = value;
    });

    fetch(`${BACKEND_URL}/validate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            data: payload,
            run_vehicle: true,
            run_policy: true,
            run_usage: true
        })
    })
    .then(res => res.json())
    .then(data => {
        const r = data.summary;

        document.getElementById("result").innerHTML = `
            <div class="result-card">
                <h3>Validation Summary</h3>

                <div class="result-row">
                    <span>Vehicle Info</span>
                    <span class="badge ${r.vehicle_info.valid ? "success" : "fail"}">${r.vehicle_info.valid}</span>
                </div>
                <p class="reason-text">${getReason(r.vehicle_info)}</p>

                <div class="result-row">
                    <span>Policy Info</span>
                    <span class="badge ${r.policy_info.valid ? "success" : "fail"}">${r.policy_info.valid}</span>
                </div>
                <p class="reason-text">${getReason(r.policy_info)}</p>

                <div class="result-row">
                    <span>Usage Risk</span>
                    <span class="badge ${r.usage_risk.valid ? "success" : "fail"}">${r.usage_risk.valid}</span>
                </div>
                <p class="reason-text">${getReason(r.usage_risk)}</p>
            </div>
        `;
    });
}

/* ------------------ EXCEL UPLOAD + MANUAL MAPPING ------------------ */
function uploadExcel() {
    const file = document.getElementById("excelFile").files[0];
    if (!file) return alert("Please select an Excel file");

    let reader = new FileReader();

    reader.onload = function (e) {
        let workbook = XLSX.read(e.target.result, { type: "binary" });
        let sheet = workbook.Sheets[workbook.SheetNames[0]];
        let rows = XLSX.utils.sheet_to_json(sheet);

        if (rows.length === 0) {
            document.getElementById("excelResult").innerHTML = `
                <div class="result-card">
                    <h3>❌ Empty Excel File</h3>
                </div>`;
            return;
        }

        let raw = rows[0];
        let excelColumns = Object.keys(raw);
           document.getElementById("mappingContainer").style.display = "block";

// Show excel columns on LEFT side
          document.getElementById("excelFields").innerHTML =
            excelColumns.map(col => `<div class="draggable" draggable="true" ondragstart="drag(event)" id="drag_${col}">${col}</div>`).join("");

// Show required fields on RIGHT side
          document.getElementById("requiredFields").innerHTML =
    REQUIRED_FIELDS.map(field => `
        <div class="drop-box" ondrop="drop(event)" ondragover="allowDrop(event)" id="drop_${field}">
            <strong>${field}</strong>
            <div class="mapped-value" id="mapped_${field}"></div>
        </div>
    `).join("");

        // Show mapping UI
        document.getElementById("mappingContainer").style.display = "block";

        // Build dropdown mapping table
        let tableHTML = `
            <table class="map-table">
                <tr>
                    <th>Required Field</th>
                    <th>Select Excel Column</th>
                </tr>
        `;

        REQUIRED_FIELDS.forEach(field => {
            tableHTML += `
            <tr>
                <td>${field}</td>
                <td>
                    <select id="map_${field}">
                        <option value="">--Select--</option>
                        ${excelColumns.map(col => `<option value="${col}">${col}</option>`).join("")}
                    </select>
                </td>
            </tr>`;
        });

        tableHTML += `</table>`;
        document.getElementById("mappingTable").innerHTML = tableHTML;

        // Store Excel row globally for later
        window.rawExcelRow = raw;
    };

    reader.readAsBinaryString(file);
}

/* ------------------ APPLY MANUAL MAPPING ------------------ */
function applyManualMapping() {
    let raw = window.rawExcelRow;
    let finalMapped = {};

    REQUIRED_FIELDS.forEach(field => {
        let selectedColumn = document.getElementById("map_" + field).value;

        if (selectedColumn && raw[selectedColumn] !== undefined) {
            finalMapped[field] = raw[selectedColumn];
        } else {
            finalMapped[field] = "";
        }
    });

    // Show mapped output
    document.getElementById("excelResult").innerHTML = `
        <div class="result-card">
            <h3>Final Mapped Output</h3>
            <pre>${JSON.stringify(finalMapped, null, 2)}</pre>
        </div>
    `;

    // Send to backend
    fetch(`${BACKEND_URL}/validate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            data: finalMapped,
            run_vehicle: true,
            run_policy: true,
            run_usage: true
        })
    })
    .then(res => res.json())
    .then(data => {
        const r = data.summary;

        document.getElementById("excelResult").innerHTML += `
            <div class="result-card">
                <h3>Validation Summary</h3>

                <div class="result-row">
                    <span>Vehicle Info</span>
                    <span class="badge ${r.vehicle_info.valid ? "success" : "fail"}">${r.vehicle_info.valid}</span>
                </div>
                <p class="reason-text">${getReason(r.vehicle_info)}</p>

                <div class="result-row">
                    <span>Policy Info</span>
                    <span class="badge ${r.policy_info.valid ? "success" : "fail"}">${r.policy_info.valid}</span>
                </div>
                <p class="reason-text">${getReason(r.policy_info)}</p>

                <div class="result-row">
                    <span>Usage Risk</span>
                    <span class="badge ${r.usage_risk.valid ? "success" : "fail"}">${r.usage_risk.valid}</span>
                </div>
                <p class="reason-text">${getReason(r.usage_risk)}</p>
            </div>
        `;
    });
}

/* ------------------ REASON HANDLING ------------------ */
function getReason(section) {
    if (!section.messages || section.messages.length === 0) {
        return "<span class='green-text'>✔ No issues. All rules satisfied.</span>";
    }
    return section.messages.map(m => `• ${m}`).join("<br>");
}
// Allow drop
function allowDrop(ev) {
    ev.preventDefault();
    ev.currentTarget.classList.add("highlight");
}

function drag(ev) {
    ev.dataTransfer.setData("text", ev.target.id);
}

function drop(ev) {
    ev.preventDefault();
    ev.currentTarget.classList.remove("highlight");

    let draggedId = ev.dataTransfer.getData("text");
    let excelColumn = draggedId.replace("drag_", "");

    // show mapped value on UI
    ev.currentTarget.querySelector(".mapped-value").innerText = excelColumn;

    // store mapping globally
    if (!window.dragMapping) window.dragMapping = {};
    let field = ev.currentTarget.id.replace("drop_", "");
    window.dragMapping[field] = excelColumn;
}
function applyDragDropMapping() {
    let raw = window.rawExcelRow;
    let finalMapped = {};

    REQUIRED_FIELDS.forEach(field => {
        let excelCol = window.dragMapping?.[field];

        if (excelCol && raw[excelCol] !== undefined) {
            finalMapped[field] = raw[excelCol];
        } else {
            finalMapped[field] = "";
        }
    });

    document.getElementById("excelResult").innerHTML = `
        <div class="result-card">
            <h3>Final Mapped Output (Drag & Drop)</h3>
            <pre>${JSON.stringify(finalMapped, null, 2)}</pre>
        </div>
    `;

    // SEND TO BACKEND
    fetch(`${BACKEND_URL}/validate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            data: finalMapped,
            run_vehicle: true,
            run_policy: true,
            run_usage: true
        })
    })
    .then(res => res.json())
    .then(data => {
        const r = data.summary;

        document.getElementById("excelResult").innerHTML += `
            <div class="result-card">
                <h3>Validation Summary</h3>
                <p><strong>Vehicle:</strong> ${r.vehicle_info.valid}</p>
                <p><strong>Policy:</strong> ${r.policy_info.valid}</p>
                <p><strong>Usage:</strong> ${r.usage_risk.valid}</p>
            </div>
        `;
    });
}
