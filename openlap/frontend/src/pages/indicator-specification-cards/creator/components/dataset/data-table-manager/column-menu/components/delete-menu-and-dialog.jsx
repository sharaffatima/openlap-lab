import React, { useCallback, useContext } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Typography,
} from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import { useGridApiContext } from '@mui/x-data-grid';

import { ISCContext } from '../../../../../indicator-specification-card.jsx';

// =============================
// Constants (avoid magic strings)
// =============================
const COPY = {
  menu: {
    deleteColumn: 'Delete column',
  },
  dialog: {
    title: 'Are you sure you want to delete this column?',
    body:
      'Deleting this dataset will permanently remove all associated data and cannot be undone. Please consider the following before proceeding:',
    cancel: 'Cancel',
    confirm: 'Delete',
  },
  aria: {
    openDeleteDialog: 'open delete column dialog',
    cancelDelete: 'cancel delete column',
    confirmDelete: 'confirm delete column',
  },
};

const DeleteMenuAndDialog = ({ props, columnMenu, setColumnMenu }) => {
  const {
    colDef: { field },
  } = props;

  const { dataset, setDataset, requirements, setRequirements } = useContext(ISCContext);
  const apiRef = useGridApiContext();

  const handleToggleColumnDeleteDialog = useCallback(() => {
    setColumnMenu((prevState) => ({ ...prevState, columnDelete: !prevState.columnDelete }));
  }, [setColumnMenu]);

  const handleConfirmDeleteColumn = useCallback(() => {
    const index = dataset.columns.findIndex((col) => col.field === field);

    if (index !== -1) {
      const newColumnData = [...dataset.columns.slice(0, index), ...dataset.columns.slice(index + 1)];
      const newRowData = dataset.rows.map((row) => {
        const { [field]: _removed, ...newRow } = row; // remove the deleted field key from each row
        return newRow;
      });

      setDataset((prevState) => ({
        ...prevState,
        rows: newColumnData.length === 0 ? [] : newRowData,
        columns: newColumnData,
      }));

      // Keep requirements.data aligned with dataset columns
      setRequirements((prev) => ({ ...prev, data: prev.data.filter((_, i) => i !== index) }));
    }

    apiRef.current.hideColumnMenu();
    handleToggleColumnDeleteDialog();
  }, [apiRef, dataset.columns, dataset.rows, field, handleToggleColumnDeleteDialog, setDataset, setRequirements]);

  return (
    <>
      <MenuItem onClick={handleToggleColumnDeleteDialog} aria-label={COPY.aria.openDeleteDialog}>
        <ListItemIcon>
          <DeleteIcon fontSize="small" color="error" />
        </ListItemIcon>
        <ListItemText primary={COPY.menu.deleteColumn} />
      </MenuItem>

      <Dialog open={columnMenu.columnDelete} fullWidth maxWidth="sm">
        <DialogTitle>{COPY.dialog.title}</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>{COPY.dialog.body}</Typography>
        </DialogContent>
        <DialogActions>
          <Button color="primary" onClick={handleToggleColumnDeleteDialog} fullWidth aria-label={COPY.aria.cancelDelete}>
            {COPY.dialog.cancel}
          </Button>
          <Button onClick={handleConfirmDeleteColumn} variant="contained" color="error" fullWidth aria-label={COPY.aria.confirmDelete}>
            {COPY.dialog.confirm}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

DeleteMenuAndDialog.displayName = 'DeleteMenuAndDialog';

export default DeleteMenuAndDialog;
