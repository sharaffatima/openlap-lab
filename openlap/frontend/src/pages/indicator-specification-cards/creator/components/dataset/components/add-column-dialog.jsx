import React, { useContext, useState, useEffect } from "react";
import { ISCContext } from "../../../indicator-specification-card.jsx";
import {
  Autocomplete,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  TextField,
  Typography,
} from "@mui/material";
import { DataTypes } from "../../../utils/data/config.js";
import { v4 as uuidv4 } from "uuid";
import { useSnackbar } from "notistack";

const AddColumnDialog = ({ open, toggleOpen }) => {
  const { dataset, setDataset, setRequirements, requirements } = useContext(ISCContext);
  const { enqueueSnackbar } = useSnackbar();

  const [state, setState] = useState({
    columnName: {
      value: "",
      exists: false,
    },
    typeSelected: Object.values(DataTypes)[0],
    numberOfRows: dataset.rows.length,
  });

  const handleAddColumn = (event) => {
    const value = event.target.value;
    // check if a column with this name already exists
    const exists = dataset.columns.some(
      (col) => col.headerName.toLowerCase() === value.toLowerCase()
    );
    setState((prev) => ({
      ...prev,
      columnName: {
        value,
        exists,
      },
    }));
  };

  const handleSelectType = (value) => {
    setState((prev) => ({
      ...prev,
      typeSelected: value,
    }));
  };

  const handleRowNumber = (event) => {
    let { value } = event.target;
    const parsedValue = value === "" ? "" : parseInt(value, 10);
    if ((!isNaN(parsedValue) && parsedValue >= 0) || value === "") {
      setState((prev) => ({
        ...prev,
        numberOfRows: parsedValue,
      }));
    }
  };

  const handleAddNewColumn = () => {
    let fieldUUID = uuidv4();
    const newColumnData = [
      ...dataset.columns,
      {
        field: fieldUUID,
        headerName: state.columnName.value,
        sortable: false,
        editable: true,
        width: 200,
        type: state.typeSelected.type,
      },
    ];
    let newRows = [];
    if (Boolean(dataset.rows.length)) {
      newRows = dataset.rows.map((row, index) => ({
        ...row,
        [fieldUUID]:
          state.typeSelected.type === "string"
            ? `${state.columnName.value} ${index + 1}`
            : 0,
      }));
    } else {
      for (let i = 0; i < state.numberOfRows; i++) {
        newRows.push({
          id: uuidv4(),
          [fieldUUID]:
            state.typeSelected.type === "string"
              ? `${state.columnName.value} ${i + 1}`
              : 0,
        });
      }
    }

    // reset local state
    setState({
      columnName: { value: "", exists: false },
      typeSelected: Object.values(DataTypes)[0],
      numberOfRows: dataset.rows.length,
    });

    // update context
    setDataset((prev) => ({
      ...prev,
      rows: newRows,
      columns: newColumnData,
    }));

      // Update requirements.data as well
    setRequirements((prev) => ({
      ...prev,
      data: [
        ...prev.data,
        {
          value: state.columnName.value,
          type: { type: state.typeSelected.type, value: state.typeSelected.value },
          placeholder: "",
        },
      ],
  }));

    enqueueSnackbar("New column added successfully", {
      variant: "success",
    });
    toggleOpen();
  };

  return (
    <Dialog open={Boolean(open)} fullWidth maxWidth="xs">
      <DialogTitle>Add a column</DialogTitle>
      <DialogContent>
        <Grid container spacing={2}>
          <Grid item xs={12} sx={{ mt: 2 }}>
            <TextField
              autoFocus
              error={state.columnName.exists}
              helperText={
                state.columnName.exists
                  ? `Column with name '${state.columnName.value}' already exists!`
                  : ""
              }
              fullWidth
              label="Column name"
              value={state.columnName.value}
              placeholder="e.g., Name of materials"
              InputLabelProps={{
                shrink: true,
              }}
              onChange={handleAddColumn}
              variant="outlined"
            />
          </Grid>
          <Grid item xs={12}>
            <Autocomplete
              options={Object.values(DataTypes)}
              fullWidth
              value={state.typeSelected}
              getOptionLabel={(option) => option.value}
              renderOption={(props, option) => {
                const { key, ...restProps } = props;
                return (
                  <li {...restProps} key={key}>
                    <Grid container sx={{ py: 0.5 }}>
                      <Grid item xs={12}>
                        <Typography>{option.value}</Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="body2" sx={{ fontStyle: "italic" }}>
                          {option.description}
                        </Typography>
                      </Grid>
                    </Grid>
                  </li>
                );
              }}
              renderInput={(params) => (
                <TextField {...params} placeholder="Select a column type" />
              )}
              onChange={(event, value) => {
                if (value) handleSelectType(value);
              }}
            />
          </Grid>
          {dataset.rows.length === 0 && (
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Number of rows"
                value={state.numberOfRows}
                type="number"
                InputLabelProps={{
                  shrink: true,
                }}
                onChange={handleRowNumber}
                variant="outlined"
              />
            </Grid>
          )}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={toggleOpen} fullWidth color="primary" variant="outlined">
          Cancel
        </Button>
        <Button
          onClick={handleAddNewColumn}
          disabled={
            state.columnName.value.trim() === "" ||
            state.columnName.exists ||
            (dataset.rows.length === 0 && !state.numberOfRows) ||
            Object.entries(state.typeSelected).length === 0
          }
          autoFocus
          fullWidth
          variant="contained"
          color="primary"
        >
          Add column
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddColumnDialog;
