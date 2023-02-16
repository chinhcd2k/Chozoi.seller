import React, {FunctionComponent} from 'react'
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';

interface IExportCSV {
  csvData: any,
  fileName: any,
  sheetName:any
}

export const ExportCSV: FunctionComponent<IExportCSV> = ({csvData, fileName,sheetName}) => {
  const fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
  const fileExtension = '.xlsx';

  const exportToCSV = (csvData: any, fileName: any,sheetName:any) => {
    const ws = XLSX.utils.json_to_sheet(csvData);
    const wb = {Sheets: {'data': ws}, SheetNames: ['data']};
    const excelBuffer = XLSX.write(wb, {bookType: 'xlsx', type: 'array'});
    const data = new Blob([excelBuffer], {type: fileType});
    FileSaver.saveAs(data, fileName + fileExtension);
  }

  return (
    <button className="export-file d-flex justify-content-center align-items-center"
            onClick={(e) => exportToCSV(csvData, fileName,sheetName)}
    style={{backgroundColor:"#FFFFFF",border:"1px solid #000000"}}><i className="fas fa-download"/>
      <p style={{marginLeft:"8px",marginBottom:"0px"}}>Xuất file</p></button>
  )
}