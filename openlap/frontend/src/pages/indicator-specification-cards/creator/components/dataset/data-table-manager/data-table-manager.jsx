import React, { useCallback, useContext, useEffect, useRef, useState } from "react";
import { DataGrid, useGridApiRef } from "@mui/x-data-grid";
import { ISCContext } from "../../../indicator-specification-card.jsx";
import { ClearAll as ClearAllIcon } from "@mui/icons-material";
import { Grid } from "@mui/material";
import Footer from "./components/footer.jsx";
import NoRowsOverlay from "./components/no-rows-overlay.jsx";
import ColumnMenu from "./column-menu/column-menu.jsx";
import TableHeaderBar from "./components/table-header-bar.jsx";

const DataTableManager = () => {
  const { dataset, setDataset } = useContext(ISCContext);

  // grid UI state
  const [state, setState] = useState({
    cellModesModel: {},
    selectionModel: [],
    value: "",
    anchorEl: null,
    page: 1,
    pageSize: 5,
    gridHeight: 450,
  });

  // sorting state
  const [sortModel, setSortModel] = useState([]);

  const apiRef = useGridApiRef();
  const popperRef = useRef();

  // recalc height whenever pageSize or rows change
  useEffect(() => {
    const rowHeight = 50,
      footerHeight = 60,
      padding = 20;
    const h = state.pageSize * rowHeight + footerHeight + padding;
    setState((p) => ({ ...p, gridHeight: h }));
  }, [state.pageSize, dataset.rows]);

  const handleCellModesModelChange = useCallback((m) =>
    setState((p) => ({ ...p, cellModesModel: m })), []
  );
  const handleCellClick = useCallback((params) => {
    setState((prev) => ({
      ...prev,
      cellModesModel: {
        // reset all to view
        ...Object.keys(prev.cellModesModel).reduce((acc, id) => ({
          ...acc,
          [id]: Object.keys(prev.cellModesModel[id]).reduce(
            (a, fld) => ({ ...a, [fld]: { mode: "view" } }),
            {}
          ),
        }), {}),
        // set just this one to edit
        [params.id]: {
          ...Object.keys(prev.cellModesModel[params.id] || {}).reduce(
            (a, fld) => ({ ...a, [fld]: { mode: "view" } }),
            {}
          ),
          [params.field]: { mode: "edit" },
        },
      },
    }));
  }, []);

  const handleRowSelectionModelChange = useCallback((sel) =>
    setState((p) => ({ ...p, selectionModel: sel })), []
  );

  const handleProcessRowUpdate = useCallback(
    (updatedRow) => {
      const idx = dataset.rows.findIndex((r) => r.id === updatedRow.id);
      const updatedRows = [...dataset.rows];
      updatedRows[idx] = updatedRow;
      setDataset((p) => ({ ...p, rows: updatedRows }));
      return updatedRow;
    },
    [dataset.rows, setDataset]
  );

  const handleColumnHeaderClick = useCallback(
    (params) => apiRef.current.showColumnMenu(params.field),
    []
  );

  const handlePopperOpen = useCallback(
    (e) => {
      const id = e.currentTarget.dataset.id;
      const row = dataset.rows.find((r) => r.id === id);
      setState((p) => ({ ...p, value: row, anchorEl: e.currentTarget }));
    },
    [dataset.rows]
  );

  const handlePopperClose = useCallback(
    (e) => {
      if (
        state.anchorEl == null ||
        popperRef.current.contains(e.nativeEvent.relatedTarget)
      )
        return;
      setState((p) => ({ ...p, anchorEl: null }));
    },
    [state.anchorEl]
  );

  // we display rows *as-is*; the menu is in charge of reordering only
  // the one column’s values in dataset.rows
  const paginatedRows = dataset.rows.slice(
    (state.page - 1) * state.pageSize,
    state.page * state.pageSize
  );

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <TableHeaderBar />
      </Grid>
      <Grid item xs={12}>
        <DataGrid
          // enable arrows on headers
          columns={dataset.columns.map((c) => ({ ...c, sortable: true }))}
          rows={paginatedRows}
          apiRef={apiRef}
          columnMenuClearIcon={<ClearAllIcon />}
          cellModesModel={state.cellModesModel}
          checkboxSelection
          disableRowSelectionOnClick
          disableColumnMenu={false}
          // server mode: grid shows the sort icons but never reorders rows
          sortingMode="server"
          // only one arrow at a time
          disableMultipleColumnsSorting
          // wire our arrow state
          sortModel={sortModel}
          onSortModelChange={(model) => setSortModel(model)}
          onColumnHeaderClick={handleColumnHeaderClick}
          onCellModesModelChange={handleCellModesModelChange}
          onCellClick={handleCellClick}
          onRowSelectionModelChange={handleRowSelectionModelChange}
          pageSizeOptions={[5, 10, 25]}
          processRowUpdate={handleProcessRowUpdate}
          rowHeight={40}
          selectionModel={state.selectionModel}
          showCellVerticalBorder
          showFooterRowCount
          showFooterSelectedRowCount
          slots={{
            noRowsOverlay: () => <NoRowsOverlay />,
            columnMenu: (props) => <ColumnMenu props={props} />,
            footer: () => <Footer state={state} setState={setState} />,
          }}
          sx={{
            "& .MuiDataGrid-columnHeaders": {
              cursor: "pointer",
              fontSize: "17px",
              textDecorationLine: "underline",
            },
            "& .MuiDataGrid-cell:hover": {
              color: "primary.main",
            },
            height: state.gridHeight,
          }}
          componentsProps={{
            row: {
              onMouseEnter: handlePopperOpen,
              onMouseLeave: handlePopperClose,
            },
          }}
        />
      </Grid>
    </Grid>
  );
};

export default DataTableManager;
