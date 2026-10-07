import { QaSheetType } from '../types';

export const QA_SHEET_SCHEMAS: Record<string, {
  id: string;
  title: string;
  code: string;
  columns: string[];
}> = {
  in_process: {
    id: "in_process",
    title: "In-Process Lab Quality Sheet",
    code: "QC-SOP-04-F02",
    columns: ["Batch No", "Parameter", "Standard", "Observed", "Status", "Remarks", "Action"]
  },
  finished_goods: {
    id: "finished_goods",
    title: "Finished Goods Quality Report",
    code: "QC-SOP-08-F01",
    columns: ["Batch No", "Parameter", "Standard", "Observed", "Status", "Remarks", "Action"]
  },
  microbiological: {
    id: "microbiological",
    title: "Microbiological Quality Sheet",
    code: "QC-SOP-12-F03",
    columns: ["Sample Code", "Organism Tested", "Limit (cfu/g)", "Observed Count", "Status", "Incubation", "Action"]
  }
};

export const SHEET_COLUMNS: Record<QaSheetType, { key: string; label: string; minWidth?: string }[]> = {
  finished_goods: [
    { key: 'Product Name', label: 'Product Name', minWidth: 'min-w-[170px]' },
    { key: 'Code', label: 'Code', minWidth: 'min-w-[90px]' },
    { key: 'B.NO', label: 'B.NO', minWidth: 'min-w-[110px]' },
    { key: 'M%', label: 'M%', minWidth: 'min-w-[80px]' },
    { key: 'F%', label: 'F%', minWidth: 'min-w-[80px]' },
    { key: 'pH', label: 'pH', minWidth: 'min-w-[70px]' },
    { key: 'PS', label: 'PS (µm)', minWidth: 'min-w-[75px]' },
    { key: 'Colour L*', label: 'L*', minWidth: 'min-w-[70px]' },
    { key: 'Colour a*', label: 'a*', minWidth: 'min-w-[70px]' },
    { key: 'Colour b*', label: 'b*', minWidth: 'min-w-[70px]' },
    { key: 'Count', label: 'Count', minWidth: 'min-w-[75px]' },
  ],
  microbiological: [
    { key: 'Sr. No.', label: 'Sr. No.', minWidth: 'min-w-[60px]' },
    { key: 'Batch No.', label: 'Batch No.', minWidth: 'min-w-[115px]' },
    { key: 'Code No.', label: 'Code No.', minWidth: 'min-w-[100px]' },
    { key: 'Product Name', label: 'Product Name', minWidth: 'min-w-[170px]' },
    { key: 'TPC Total', label: 'TPC Total (CFU/gm)', minWidth: 'min-w-[125px]' },
    { key: 'Y&M', label: 'Y&M (CFU/gm)', minWidth: 'min-w-[105px]' },
    { key: 'Coliform', label: 'Coliform (CFU/gm)', minWidth: 'min-w-[110px]' },
    { key: 'E.coli', label: 'E.coli (CFU/gm)', minWidth: 'min-w-[100px]' },
    { key: 'Enterobacteriaceae', label: 'Enterobacteriaceae', minWidth: 'min-w-[130px]' },
    { key: 'Remark', label: 'Remark', minWidth: 'min-w-[95px]' },
  ],
  in_process: [
    { key: 'sr no', label: 'Sr No', minWidth: 'min-w-[60px]' },
    { key: 'date', label: 'Date', minWidth: 'min-w-[100px]' },
    { key: 'Batch Number', label: 'Batch Number', minWidth: 'min-w-[130px]' },
    { key: 'product code', label: 'Product Code', minWidth: 'min-w-[110px]' },
    { key: 'paper weight', label: 'Paper Wt (g)', minWidth: 'min-w-[105px]' },
    { key: 'sample paper weight', label: 'Sample Paper Wt (g)', minWidth: 'min-w-[120px]' },
    { key: 'sample weight', label: 'Sample Wt (g)', minWidth: 'min-w-[105px]' },
    { key: 'after drying weight', label: 'After Drying Wt (g)', minWidth: 'min-w-[120px]' },
    { key: 'fat %', label: 'Fat %', minWidth: 'min-w-[85px]' },
    { key: 'moisture %', label: 'Moisture %', minWidth: 'min-w-[90px]' },
    { key: 'ph', label: 'pH', minWidth: 'min-w-[75px]' },
    { key: 'particle size', label: 'Particle Size', minWidth: 'min-w-[105px]' },
  ],
};
