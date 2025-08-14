import React, { useCallback, useContext, useState } from 'react';
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
  Tooltip,
} from '@mui/material';
import { Edit as EditIcon } from '@mui/icons-material';
import SortIcon from '@mui/icons-material/Sort';
import { useGridApiContext } from '@mui/x-data-grid';

import { ISCContext } from '../../../../../indicator-specification-card.jsx';

// =============================
// Constants (avoid magic strings)
// =============================
const COPY = {
  menu: {
    sortOnlySelected: 'Only the selected column is sorted.',
    sortColumn: 'Sort Column',
    renameColumn: 'Rename column',
  },
  dialog: {
    title: 'Rename column',
    question: 'How would you like to rename the column?',
    fieldLabel: 'Column name',
    cancel: 'Cancel',
    confirm: 'Confirm',
    alreadyExists: 'Column name already exists',
  },
  aria: {
    sortColumn: 'sort selected column',
    openRenameDialog: 'open rename column dialog',
    cancelRename: 'cancel rename column',
    confirmRename: 'confirm rename column',
  },
};

const RenameMenuAndDialog = ({ props, columnMenu, setColumnMenu }) => {
  const { colDef } = props;
  const { dataset, setDataset, setRequirements } = useContext(ISCContext);
  const apiRef = useGridApiContext();

  const [column, setColumn] = useState({
    value: colDef.headerName,
    status: { exists: false, message: '' },
  });

  const handleSortColumn = useCallback(() => {
    // 1) figure next direction
    const prev = apiRef.current.getSortModel()[0] || {};
    const nextSort = prev.field !== colDef.field ? 'asc' : prev.sort === 'asc' ? 'desc' : 'asc';

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
    if (nextSort === 'desc') sorted.reverse();

    const newRows = dataset.rows.map((r, i) => ({ ...r, [colDef.field]: sorted[i] }));
    setDataset((p) => ({ ...p, rows: newRows }));
    apiRef.current.hideColumnMenu();
  }, [apiRef, colDef.field, dataset.rows, setDataset]);

  const handleToggleColumnRenameDialog = useCallback(
    () => setColumnMenu((p) => ({ ...p, columnRename: !p.columnRename })),
    [setColumnMenu],
  );

  const handleRenameHeader = useCallback(
    (e) => {
      const val = e.target.value;
      setColumn((p) => ({ ...p, value: val }));
      const exists = dataset.columns.some((c) => c.headerName.toLowerCase() === val.toLowerCase());
      setColumn((p) => ({
        ...p,
        status: {
          exists: exists && val.toLowerCase() !== colDef.headerName.toLowerCase(),
          message: exists ? COPY.dialog.alreadyExists : '',
        },
      }));
    },
    [colDef.headerName, dataset.columns],
  );

  const handleConfirmRenameColumn = useCallback(
    (e) => {
      e.preventDefault();
      apiRef.current.hideColumnMenu();

      if (column.value && !column.status.exists) {
        // 1. Update dataset.columns
        const updatedCols = dataset.columns.map((c) =>
          c.field === colDef.field ? { ...c, headerName: column.value } : c,
        );
        setDataset((p) => ({ ...p, columns: updatedCols }));

        // 2. Update requirements.data
        setRequirements((prev) => {
          const updatedData = prev.data.map((item) =>
            item.value === colDef.headerName ? { ...item, value: column.value } : item,
          );
          return { ...prev, data: updatedData };
        });

        handleToggleColumnRenameDialog();
      }
    },
    [apiRef, colDef.field, colDef.headerName, column.status.exists, column.value, dataset.columns, handleToggleColumnRenameDialog, setDataset, setRequirements],
  );

  return (
    <>
      <Tooltip title={COPY.menu.sortOnlySelected} placement="right">
        <MenuItem onClick={handleSortColumn} aria-label={COPY.aria.sortColumn}>
          <ListItemIcon>
            <SortIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary={COPY.menu.sortColumn} />
        </MenuItem>
      </Tooltip>

      <MenuItem onClick={handleToggleColumnRenameDialog} aria-label={COPY.aria.openRenameDialog}>
        <ListItemIcon>
          <EditIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText primary={COPY.menu.renameColumn} />
      </MenuItem>

      <Dialog open={columnMenu.columnRename} fullWidth maxWidth="xs">
        <DialogTitle>{COPY.dialog.title}</DialogTitle>
        <DialogContent>
          <Typography sx={{ pb: 2, mt: -3 }}>{COPY.dialog.question}</Typography>
          <TextField
            autoFocus
            error={column.status.exists}
            helperText={column.status.message}
            fullWidth
            label={COPY.dialog.fieldLabel}
            value={column.value}
            InputLabelProps={{ shrink: true }}
            onChange={handleRenameHeader}
            variant="outlined"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleToggleColumnRenameDialog} aria-label={COPY.aria.cancelRename}>
            {COPY.dialog.cancel}
          </Button>
          <Button
            variant="contained"
            disabled={!column.value || column.status.exists}
            onClick={handleConfirmRenameColumn}
            fullWidth
            aria-label={COPY.aria.confirmRename}
          >
            {COPY.dialog.confirm}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

RenameMenuAndDialog.displayName = 'RenameMenuAndDialog';

export default RenameMenuAndDialog;
