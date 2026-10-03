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
