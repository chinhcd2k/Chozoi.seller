import React, {FunctionComponent} from 'react'
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';

interface IExportCSV {
  dataCSV: { all: any, auction: any, normal: any }
  fileName: any
}

export const ExportCSV: FunctionComponent<IExportCSV> = ({dataCSV, fileName}) => {

  const fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
  const fileExtension = '.xlsx';

  const exportToCSV = async () => {
    const all = XLSX.utils.json_to_sheet(dataCSV.all);
    const auction = XLSX.utils.json_to_sheet(dataCSV.auction);
    const normal = XLSX.utils.json_to_sheet(dataCSV.normal);
    const wb = {
      Sheets: {'Tất cả': all, 'Sp thường': normal, 'Sp đấu giá': auction},
      SheetNames: ['Tất cả', 'Sp thường', 'Sp đấu giá']
    };
    const excelBuffer = XLSX.write(wb, {bookType: 'xlsx', type: 'array'});
    const data = new Blob([excelBuffer], {type: fileType});
    FileSaver.saveAs(data, fileName + fileExtension);
  }

  return (
    <button className="d-flex justify-content-center align-items-center" style={{height: 40, width: 100}}
            onClick={(e) => exportToCSV()}>
      <i className="fas fa-download mr-3"/>
      <div>Xuất file</div>
    </button>
  )
}