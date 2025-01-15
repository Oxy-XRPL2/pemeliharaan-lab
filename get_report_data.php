<?php
include 'db_connect.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

// Function untuk mencatat error
function handleError($message) {
    echo json_encode([
        'error' => true,
        'message' => $message,
        'lab_reports' => [],
        'pc_reports' => []
    ]);
    exit;
}

try {
    $lab = isset($_GET['lab']) ? $_GET['lab'] : '';
    $startDate = isset($_GET['start_date']) ? $_GET['start_date'] : '';
    $endDate = isset($_GET['end_date']) ? $_GET['end_date'] : '';

    // Query untuk checklist_lab
    $sql_lab = "SELECT 
        lab,
        tanggal,
        CONCAT(petugas1, 
            IF(petugas2 != '', CONCAT(', ', petugas2), ''),
            IF(petugas3 != '', CONCAT(', ', petugas3), '')
        ) as petugas,
        CONCAT(komputer_baik, '/', komputer_rusak) as komputer,
        CONCAT(monitor_baik, '/', monitor_rusak) as monitor,
        CONCAT(cpu_baik, '/', cpu_rusak) as cpu,
        CONCAT(keyboard_baik, '/', keyboard_rusak) as keyboard,
        CONCAT(mouse_baik, '/', mouse_rusak) as mouse,
        CONCAT(kabel_baik, '/', kabel_rusak) as kabel,
        'lab' as report_type,
        komputer_keterangan,
        monitor_keterangan,
        cpu_keterangan,
        keyboard_keterangan,
        mouse_keterangan,
        kabel_keterangan
    FROM checklist_lab WHERE 1=1";

    // Query untuk checklist_pc
    $sql_pc = "SELECT 
        nomor_lab as lab,
        tanggal,
        CONCAT(petugas1, 
            IF(petugas2 != '', CONCAT(', ', petugas2), ''),
            IF(petugas3 != '', CONCAT(', ', petugas3), '')
        ) as petugas,
        nomor_pc,
        items,
        keterangan,
        'pc' as report_type
    FROM checklist_pc WHERE 1=1";

    // Menambahkan filter jika ada
    if (!empty($lab)) {
        $lab = $conn->real_escape_string($lab);
        $sql_lab .= " AND lab = '$lab'";
        $sql_pc .= " AND nomor_lab = '$lab'";
    }

    if (!empty($startDate)) {
        $startDate = $conn->real_escape_string($startDate);
        $sql_lab .= " AND tanggal >= '$startDate'";
        $sql_pc .= " AND tanggal >= '$startDate'";
    }

    if (!empty($endDate)) {
        $endDate = $conn->real_escape_string($endDate);
        $sql_lab .= " AND tanggal <= '$endDate'";
        $sql_pc .= " AND tanggal <= '$endDate'";
    }

    $sql_lab .= " ORDER BY tanggal DESC";
    $sql_pc .= " ORDER BY tanggal DESC";

    // Eksekusi query untuk checklist_lab
    $result_lab = $conn->query($sql_lab);
    if (!$result_lab) {
        throw new Exception("Error executing lab query: " . $conn->error);
    }

    $data_lab = array();
    while($row = $result_lab->fetch_assoc()) {
        $data_lab[] = $row;
    }

    // Eksekusi query untuk checklist_pc
    $result_pc = $conn->query($sql_pc);
    if (!$result_pc) {
        throw new Exception("Error executing pc query: " . $conn->error);
    }

    $data_pc = array();
    while($row = $result_pc->fetch_assoc()) {
        $data_pc[] = $row;
    }

    // Menggabungkan data dari kedua tabel
    echo json_encode([
        'error' => false,
        'lab_reports' => $data_lab,
        'pc_reports' => $data_pc
    ]);

} catch (Exception $e) {
    handleError($e->getMessage());
} finally {
    if (isset($conn)) {
        $conn->close();
    }
}
?>