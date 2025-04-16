<?php

namespace App\Exports;

use App\Models\Sale;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

class SalesExport
{
    protected $date;

    public function __construct(string $date)
    {
        $this->date = $date;
    }

    public function download(string $fileName)
    {
        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();

        // Set headers
        $headers = [
            'ID',
            'Fecha',
            'Teléfono',
            'PDV',
            'DNI PDV',
            'Zonificador',
            'Zonal',
            'Producto',
            'Web Producto',
            'Calidad de Cluster',
            'Fecha de Recarga',
            'Monto de Recarga',
            'Monto Acumulado',
            'Comisionable',
            'Acción',
        ];

        foreach ($headers as $key => $header) {
            $sheet->setCellValue(chr(65 + $key) . '1', $header);
        }

        // Get data
        $sales = Sale::with(['user.zonificador.circuit.zonal', 'webproduct.product'])
            ->where('date', $this->date)
            ->get();

        // Fill data
        $row = 2;
        foreach ($sales as $sale) {
            $sheet->setCellValue('A' . $row, $sale->id);
            $sheet->setCellValue('B' . $row, $sale->date);
            $sheet->setCellValue('C' . $row, $sale->telefono);
            $sheet->setCellValue('D' . $row, $sale->user->name);
            $sheet->setCellValue('E' . $row, $sale->user->dni);
            $sheet->setCellValue('F' . $row, $sale->user->zonificador ? $sale->user->zonificador->name : '');
            $sheet->setCellValue('G' . $row, $sale->user->zonificador ? $sale->user->zonificador->circuit->zonal->short_name : '');
            $sheet->setCellValue('H' . $row, $sale->webproduct->product ? $sale->webproduct->product->name : '');
            $sheet->setCellValue('I' . $row, $sale->webproduct->name);
            $sheet->setCellValue('J' . $row, $sale->cluster_quality);
            $sheet->setCellValue('K' . $row, $sale->recharge_date);
            $sheet->setCellValue('L' . $row, $sale->recharge_amount);
            $sheet->setCellValue('M' . $row, $sale->accumulated_amount);
            $sheet->setCellValue('N' . $row, $sale->commissionable_charge ? 'Sí' : 'No');
            $sheet->setCellValue('O' . $row, $sale->action);
            $row++;
        }

        // Auto size columns
        foreach (range('A', 'O') as $column) {
            $sheet->getColumnDimension($column)->setAutoSize(true);
        }

        // Create writer
        $writer = new Xlsx($spreadsheet);

        // Set headers for download
        header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        header('Content-Disposition: attachment; filename="'. $fileName .'"');
        header('Cache-Control: max-age=0');

        // Save file to output
        $writer->save('php://output');
        exit;
    }
}
