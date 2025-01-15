// Fungsi untuk mengisi tabel laporan lab
function fillLabReportTable(data) {
    const tbody = document.querySelector('#report-data tbody');
    tbody.innerHTML = ''; // Bersihkan tabel terlebih dahulu

    // Periksa apakah data lab_reports ada
    if (data.lab_reports && data.lab_reports.length > 0) {
        data.lab_reports.forEach(report => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${report.lab}</td>
                <td>${formatDate(report.tanggal)}</td>
                <td>${report.petugas}</td>
                <td>${report.komputer} ${report.komputer_keterangan ? `<br><small>${report.komputer_keterangan}</small>` : ''}</td>
                <td>${report.monitor} ${report.monitor_keterangan ? `<br><small>${report.monitor_keterangan}</small>` : ''}</td>
                <td>${report.cpu} ${report.cpu_keterangan ? `<br><small>${report.cpu_keterangan}</small>` : ''}</td>
                <td>${report.keyboard} ${report.keyboard_keterangan ? `<br><small>${report.keyboard_keterangan}</small>` : ''}</td>
                <td>${report.mouse} ${report.mouse_keterangan ? `<br><small>${report.mouse_keterangan}</small>` : ''}</td>
                <td>${report.kabel} ${report.kabel_keterangan ? `<br><small>${report.kabel_keterangan}</small>` : ''}</td>
            `;
            tbody.appendChild(row);
        });
    }

    // Periksa apakah data pc_reports ada
    if (data.pc_reports && data.pc_reports.length > 0) {
        data.pc_reports.forEach(report => {
            const row = document.createElement('tr');
            const checkedItems = report.items.split(',');
            
            // Membuat status untuk setiap komponen berdasarkan items yang dicheck
            const components = {
                komputer: checkedItems.includes('komputer') ? '1/0' : '0/1',
                monitor: checkedItems.includes('monitor') ? '1/0' : '0/1',
                cpu: checkedItems.includes('cpu') ? '1/0' : '0/1',
                keyboard: checkedItems.includes('keyboard') ? '1/0' : '0/1',
                mouse: checkedItems.includes('mouse') ? '1/0' : '0/1',
                kabel: checkedItems.includes('kabel') ? '1/0' : '0/1'
            };

            row.innerHTML = `
                <td>${report.lab} (PC ${report.nomor_pc})</td>
                <td>${formatDate(report.tanggal)}</td>
                <td>${report.petugas}</td>
                <td>${components.komputer}</td>
                <td>${components.monitor}</td>
                <td>${components.cpu}</td>
                <td>${components.keyboard}</td>
                <td>${components.mouse}</td>
                <td>${components.kabel}</td>
            `;
            if (report.keterangan) {
                row.querySelector('td:last-child').innerHTML += `<br><small>${report.keterangan}</small>`;
            }
            tbody.appendChild(row);
        });
    }

    // Jika tidak ada data sama sekali
    if ((!data.lab_reports || data.lab_reports.length === 0) && 
        (!data.pc_reports || data.pc_reports.length === 0)) {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="9" class="text-center">Tidak ada data yang ditemukan</td>';
        tbody.appendChild(row);
    }
}

// Fungsi untuk mengambil data laporan
async function fetchReportData() {
    const labFilter = document.getElementById('lab-filter').value;
    const dateFilter = document.getElementById('date-filter').value;
    
    let url = 'get_report_data.php'; // Sesuaikan dengan path yang benar
    if (labFilter) url += `lab=${encodeURIComponent(labFilter)}&`;
    if (dateFilter) url += `start_date=${encodeURIComponent(dateFilter)}&end_date=${encodeURIComponent(dateFilter)}`;
    
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        fillLabReportTable(data);
    } catch (error) {
        console.error('Error:', error);
        const tbody = document.querySelector('#report-data tbody');
        tbody.innerHTML = `<tr><td colspan="9" class="text-center">Terjadi kesalahan saat mengambil data: ${error.message}</td></tr>`;
    }
}

// Mengisi pilihan lab di filter
function populateLabFilter() {
    const labFilter = document.getElementById('lab-filter');
    const labs = ['Lab 1', 'Lab 2', 'Lab 3', 'Lab 4', 'Lab 5'];
    
    labs.forEach(lab => {
        const option = document.createElement('option');
        option.value = lab;
        option.textContent = lab;
        labFilter.appendChild(option);
    });
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    populateLabFilter();
    fetchReportData(); // Ambil semua data saat halaman dimuat
    
    document.getElementById('apply-filters').addEventListener('click', fetchReportData);
});