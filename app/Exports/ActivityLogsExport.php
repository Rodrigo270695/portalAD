<?php

namespace App\Exports;

use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Illuminate\Database\Eloquent\Builder;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ActivityLogsExport
{
    protected $query;

    public function __construct(Builder $query)
    {
        $this->query = $query;
    }

    public function download(): StreamedResponse
    {
        return response()->stream(
            function () {
                $spreadsheet = new Spreadsheet();
                $sheet = $spreadsheet->getActiveSheet();

                // Establecer los encabezados
                $headers = [
                    'Usuario',
                    'Email',
                    'Zonal',
                    'Acción',
                    'Dispositivo',
                    'Dirección IP',
                    'Fecha y Hora',
                    'Tiempo de Respuesta (ms)'
                ];

                // Escribir los encabezados
                foreach ($headers as $index => $header) {
                    $sheet->setCellValue(chr(65 + $index) . '1', $header);
                }

                // Obtener y escribir los datos
                $row = 2;
                $this->query->chunk(1000, function ($activities) use ($sheet, &$row) {
                    foreach ($activities as $activity) {
                        $sheet->setCellValue('A' . $row, $activity->user?->name ?? '-');
                        $sheet->setCellValue('B' . $row, $activity->user?->email ?? '-');
                        $sheet->setCellValue('C' . $row, $activity->user?->circuit?->zonal?->name ?? '-');
                        $sheet->setCellValue('D' . $row, $activity->action);
                        $sheet->setCellValue('E' . $row, $activity->device_type ?? '-');
                        $sheet->setCellValue('F' . $row, $activity->ip_address);
                        $sheet->setCellValue('G' . $row, $activity->created_at->format('d/m/Y H:i:s'));
                        $sheet->setCellValue('H' . $row, $activity->additional_data['response_time'] ?? '-');
                        $row++;
                    }
                });

                // Auto-ajustar el ancho de las columnas
                foreach (range('A', 'H') as $column) {
                    $sheet->getColumnDimension($column)->setAutoSize(true);
                }

                // Crear el archivo Excel
                $writer = new Xlsx($spreadsheet);
                $writer->save('php://output');
            },
            200,
            [
                'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition' => 'attachment; filename="actividades_' . now()->format('Y-m-d_His') . '.xlsx"',
            ]
        );
    }
}
