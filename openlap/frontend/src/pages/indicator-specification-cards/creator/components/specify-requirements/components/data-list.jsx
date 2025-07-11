import React, { useContext , useState } from "react";
import {
  Autocomplete,
  Button,
  Grid,
  IconButton,
  TextField,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from "@mui/material";
import { Add, Close } from "@mui/icons-material";
import { ISCContext } from "../../../indicator-specification-card.jsx";
import { DataTypes } from "../../../utils/data/config.js";
import { v4 as uuidv4 } from "uuid";

const DataList = () => {
  const { requirements, setRequirements, setDataset } = useContext(ISCContext);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [rowToDelete, setRowToDelete] = useState(null);

  const handleChangeValue = (index, event) => {
    const { name, value } = event.target;
    const newData = [...requirements.data];
    newData[index][name] = value;
    setRequirements({ ...requirements, data: newData });
  };

  const handleChangeType = (index, value) => {
    const newData = [...requirements.data];
    newData[index] = {
      ...newData[index],
      type: value || { type: "" }, // fallback to empty object with type
    };

    // Update requirements state
    setRequirements((prev) => ({
      ...prev,
      data: newData,
    }));

  };

  const handleAddDataRow = () => {
    setRequirements((prevState) => ({
      ...prevState,
      data: [...prevState.data, { value: "" }],
    }));
  };

  const handleDeleteDataRow = (indexToRemove) => {
    setRequirements((prevState) => ({
      ...prevState,
      data: [...prevState.data].filter((_, index) => index !== indexToRemove),
    }));
  };

  const handleOpenDeleteDialog = (index) => {
    setRowToDelete(index);
    setDeleteDialogOpen(true);
  };

  // Confirm delete
  const handleConfirmDelete = () => {
    if (rowToDelete !== null) {
      handleDeleteDataRow(rowToDelete);
      setRowToDelete(null);
      setDeleteDialogOpen(false);
    }
  };

  // Cancel delete
  const handleCancelDelete = () => {
    setRowToDelete(null);
    setDeleteDialogOpen(false);
  };


  return (
    <>
      <Grid container spacing={2}>
        {requirements.data.map((requirement, index) => {
          return (
            <Grid item xs={12} key={index}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item>
                      <Typography>{index + 1}</Typography>
                    </Grid>
                    <Grid item xs>
                      <TextField
                        fullWidth
                        required
                        name="value"
                        label="I need data"
                        value={requirement.value}
                        onChange={(event) => handleChangeValue(index, event)}
                        placeholder={requirement.placeholder || ""}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Autocomplete
                        fullWidth
                        options={Object.values(DataTypes)}
                        name="type"
                        value={
                          Object.values(DataTypes).find(
                            (dt) => dt.value === (requirement.type?.value || requirement.type?.type)
                          ) || null
                        }
                        getOptionLabel={(option) => {
                          return option?.value || "Unknown";
                        }}
                        renderOption={(props, option) => {
                          const { key, ...restProps } = props;
                          return (
                            <li key={key} {...restProps}>
                              <Grid container sx={{ py: 0.5 }}>
                                <Grid item xs={12}>
                                  <Typography>{option.value}</Typography>
                                </Grid>
                                <Grid item xs={12}>
                                  <Typography
                                    variant="body2"
                                    sx={{ fontStyle: "italic" }}
                                  >
                                    {option.description}
                                  </Typography>
                                </Grid>
                              </Grid>
                            </li>
                          );
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            placeholder="Select a column type"
                          />
                        )}
                        onChange={(event, value) => {
                          handleChangeType(index, value || { type: "" });
                        }}
                      />
                    </Grid>
                  </Grid>
                </Grid>

                {index > 1 && (
                  <Grid item>
                    <IconButton
                      color="error"
                      onClick={() => handleOpenDeleteDialog(index)}
                    >
                      <Close />
                    </IconButton>
                  </Grid>
                )}
              </Grid>
            </Grid>
          );
        })}

        <Grid item xs={12}>
          <Button
            sx={{ ml: 3.5 }}
            startIcon={<Add />}
            onClick={handleAddDataRow}
          >
            Add more data
          </Button>
        </Grid>
      </Grid>
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCancelDelete}
      >
        <DialogTitle>Delete Data Row</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this data row? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete} color="primary">
            Cancel
          </Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default DataList;
