/* eslint-disable react/react-in-jsx-scope */
/* eslint-disable no-nested-ternary */

import Popup from 'reactjs-popup';
import ReactTable from 'react-table-v6';
import { CreateCSVLink } from './CreateCSVLink';

export const cellRenderer = function(rowData, popupColHeaders) {
  return main(rowData, popupColHeaders);

  // -----------------------------------
  function main(row, popupColHeaders) {
    const { value } = row;
    let fn;
    switch (typeof value) {
      case 'boolean':
        fn = BooleanCellRender;
        break;
      case 'number':
        fn = NumberCellRender;
        break;
      case 'string':
        fn = StringCellRender;
        break;
    }

    return fn ? fn(row, popupColHeaders) : null;
  }

  function StringCellRender(row) {
    const { value } = row;
    return String(value.length);
  }

  function BooleanCellRender(row) {
    const { value } = row;
    return (
      <div
        style={{
          backgroundColor: value === true ? '#85cc00' : '#ff7878'
        }}
      >
        {String(value)}
      </div>
    );
  }

  function NumberCellRender(row, popupColHeaders) {
    const { value } = row;
    const appList = row.original.LIST;
    const bar = (
      <div
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: '#cccccc',
          borderRadius: '2px'
        }}
      >
        <div
          style={{
            width: `${value}%`,
            height: '100%',
            backgroundColor:
              value >= 70 ? '#85cc00' : value >= 30 ? '#ffbf00' : '#ff7878',
            borderRadius: '2px',
            transition: 'all .2s ease-out'
          }}
        >
          {value}
        </div>
      </div>
    );

    return popupColHeaders ? renderPopup(appList, popupColHeaders, bar) : bar;
  }

  function renderPopup(tableData, popupColHeaders, trigger) {
    const contentStyle = {
      maxWidth: '1500x',
      width: '90%'
    };
    return (
      <Popup
        trigger={trigger}
        position="right center"
        modal
        contentStyle={contentStyle}
      >
        <div>
          <ReactTable data={tableData} columns={popupColHeaders} />
          {CreateCSVLink(popupColHeaders, tableData)}
        </div>
      </Popup>
    );
  }
};
