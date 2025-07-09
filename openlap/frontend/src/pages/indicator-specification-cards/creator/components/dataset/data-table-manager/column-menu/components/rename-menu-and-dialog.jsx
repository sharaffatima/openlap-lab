import React, { useContext, useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  ListItemIcon,
  ListItemText,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import { Edit as EditIcon } from "@mui/icons-material";
import SortIcon from "@mui/icons-material/Sort";
import { useGridApiContext } from "@mui/x-data-grid";
import { ISCContext } from "../../../../../indicator-specification-card.jsx";

const RenameMenuAndDialog = ({ props, columnMenu, setColumnMenu }) => {
  const { colDef } = props;
  const { dataset, setDataset } = useContext(ISCContext);
  const apiRef = useGridApiContext();

  const [column, setColumn] = useState({
    value: colDef.headerName,
    status: { exists: false, message: "" },
  });

  const handleSortColumn = () => {
    // 1) figure next direction
    const prev = apiRef.current.getSortModel()[0] || {};
    const nextSort =
      prev.field !== colDef.field
        ? "asc"
        : prev.sort === "asc"
        ? "desc"
        : "asc";

    // 2) show the arrow
    apiRef.current.setSortModel([{ field: colDef.field, sort: nextSort }]);

    // 3) manually sort *just* this column’s values
    const values = dataset.rows.map((r) => r[colDef.field]);
    const sorted = [...values].sort((a, b) => {
      if (a == null && b == null) return 0;
      if (a == null) return 1;
      if (b == null) return -1;
      return a < b ? -1 : a > b ? 1 : 0;
    });
    if (nextSort === "desc") sorted.reverse();

    console.log(
      `Sorted values for ${colDef.field} (${nextSort}):`,
      sorted
    );

    const newRows = dataset.rows.map((r, i) => ({
      ...r,
      [colDef.field]: sorted[i],
    }));
    setDataset((p) => ({ ...p, rows: newRows }));
    apiRef.current.hideColumnMenu();
  };

  const handleToggleColumnRenameDialog = () =>
    setColumnMenu((p) => ({ ...p, columnRename: !p.columnRename }));

  const handleRenameHeader = (e) => {
    const val = e.target.value;
    setColumn((p) => ({ ...p, value: val }));
    const exists = dataset.columns.some(
      (c) => c.headerName.toLowerCase() === val.toLowerCase()
    );
    setColumn((p) => ({
      ...p,
      status: {
        exists: exists && val.toLowerCase() !== colDef.headerName.toLowerCase(),
        message: exists ? "Column name already exists" : "",
      },
    }));
  };

  const handleConfirmRenameColumn = (e) => {
    e.preventDefault();
    apiRef.current.hideColumnMenu();
    if (column.value && !column.status.exists) {
      const updatedCols = dataset.columns.map((c) =>
        c.field === colDef.field ? { ...c, headerName: column.value } : c
      );
      setDataset((p) => ({ ...p, columns: updatedCols }));
      handleToggleColumnRenameDialog();
    }
  };

  return (
    <>
      <MenuItem onClick={handleSortColumn}>
        <ListItemIcon>
          <SortIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText primary="Sort Column" />
      </MenuItem>

      <MenuItem onClick={handleToggleColumnRenameDialog}>
        <ListItemIcon>
          <EditIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText primary="Rename column" />
      </MenuItem>

      <Dialog open={columnMenu.columnRename} fullWidth maxWidth="xs">
        <DialogTitle>Rename column</DialogTitle>
        <DialogContent>
          <Typography sx={{ pb: 2, mt: -3 }}>
            How would you like to rename the column?
          </Typography>
          <TextField
            autoFocus
            error={column.status.exists}
            helperText={column.status.message}
            fullWidth
            label="Column name"
            value={column.value}
            InputLabelProps={{ shrink: true }}
            onChange={handleRenameHeader}
            variant="outlined"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleToggleColumnRenameDialog}>Cancel</Button>
          <Button
            variant="contained"
            disabled={!column.value || column.status.exists}
            onClick={handleConfirmRenameColumn}
            fullWidth
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default RenameMenuAndDialog;
