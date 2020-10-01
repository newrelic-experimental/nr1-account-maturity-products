/* eslint-disable react/react-in-jsx-scope */
/* eslint-disable no-nested-ternary */

import Popup from 'reactjs-popup';
import ReactTable from 'react-table-v6';
import { CreateCSVLink } from './CreateCSVLink';
import semver from 'semver';

export const cellRenderer = function(rowData, popupColHeaders, renderFn) {
  return main(rowData, popupColHeaders, renderFn);

  // -----------------------------------
  function main(row, popupColHeaders, renderFn) {
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
        if (semver.valid(value)) {
          fn = VersionCellRender;
        }
        break;
    }

    return fn ? fn(row, popupColHeaders, renderFn) : null;
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

  function NumberCellRender(row, popupColHeaders, renderFn) {
    const { value } = row;
    const tableData = row.original.LIST;
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

    if (renderFn) {
      return renderFn(row, popupColHeaders, bar);
    }

    return popupColHeaders ? renderPopup(tableData, popupColHeaders, bar) : bar;
  }

  function VersionCellRender(row, latestVersion) {
    const { value } = row;
    const agentVer = semver.clean(value);
    const isLatestVersion = semver.satisfies(
      agentVer,
      `${semver.major(latestVersion)}.${semver.minor(latestVersion)}.x`
    );
    return (
      <div
        style={{
          backgroundColor: isLatestVersion === true ? '#85cc00' : '#ff7878'
        }}
      >
        {String(value)}
      </div>
    );
  }
};

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
        <ReactTable style={{height: '600px'}} data={tableData} columns={popupColHeaders} />
        {CreateCSVLink(popupColHeaders, tableData)}
      </div>
    </Popup>
  );
}
