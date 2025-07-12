import React, { useContext, useState } from "react";
import { ISCContext } from "../../indicator-specification-card.jsx";
import {
  Accordion,
  AccordionActions,
  AccordionDetails,
  AccordionSummary,
  Button,
  Chip,
  Grid,
  Grow,
  IconButton,
  Tooltip,
  Typography,
  Paper,
} from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";
import { blue, orange } from "@mui/material/colors";
import DataTableManager from "./data-table-manager/data-table-manager.jsx";
import DataTable from "./components/data-table.jsx";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import EditIcon from "@mui/icons-material/Edit";
import CloseIcon from "@mui/icons-material/Close";
import ImportDialog from "./components/import-dialog.jsx";

const Dataset = () => {
  const { dataset, lockedStep, setLockedStep } = useContext(ISCContext);
  const [showCSVUpload, setShowCSVUpload] = useState(true);
  const [state, setState] = useState({
    showSelections: true,
    openCsvImport: false,
  });

  const handleOpenImportDataset = () => {
    setState((prevState) => ({
      ...prevState,
      openCsvImport: !prevState.openCsvImport,
    }));
  };

  const handleTogglePanel = () => {
    setLockedStep((prevState) => ({
      ...prevState,
      dataset: {
        ...prevState.dataset,
        openPanel: !prevState.dataset.openPanel,
      },
    }));
  };

  const handleToggleShowSelection = () => {
    setState((prevState) => ({
      ...prevState,
      showSelections: !prevState.showSelections,
    }));
  };

  const handleUnlockVisualization = () => {
    handleTogglePanel();
    setLockedStep((prevState) => ({
      ...prevState,
      visualization: {
        ...prevState.visualization,
        locked: false,
        openPanel: true,
        step: "4",
      },
    }));
  };

  const handleUnlockFinalize = () => {
    handleTogglePanel();
    setLockedStep((prevState) => ({
      ...prevState,
      finalize: {
        ...prevState.finalize,
        locked: false,
        openPanel: true,
      },
    }));
  };

  const buttonStyle = (type = "visualization") => ({
    height: 150,
    width: 150,
    border: "3px solid",
    borderColor: type === "dataset" ? blue[200] : orange[200],
    "&:hover": {
      boxShadow: 5,
      borderColor: type === "dataset" ? blue[900] : orange[800],
    },
    p: 2,
    borderRadius: 2,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    cursor: "pointer",
  });

  return (
    <>
      <Accordion
        expanded={lockedStep.dataset.openPanel}
        disabled={lockedStep.dataset.locked}
      >
        <AccordionSummary>
          <Grid container spacing={1}>
            <Grid item xs={12}>
              <Grid
                container
                alignItems="center"
                justifyContent="space-between"
                spacing={1}
              >
                <Grid item xs>
                  <Grid container alignItems="center" spacing={1}>
                    <Grid item>
                      {!lockedStep.dataset.locked ? (
                        <Chip label={lockedStep.dataset.step} color="primary" />
                      ) : (
                        <IconButton size="small">
                          <LockIcon />
                        </IconButton>
                      )}
                    </Grid>
                    <Grid item>
                      <Typography>Dataset</Typography>
                    </Grid>
                    {!lockedStep.dataset.openPanel && (
                      <>
                        <Grid item>
                          <Tooltip title="Edit dataset">
                            <IconButton onClick={handleTogglePanel}>
                              <EditIcon color="primary" />
                            </IconButton>
                          </Tooltip>
                        </Grid>
                        <Grid item>
                          <Tooltip
                            title={
                              !state.showSelections
                                ? "Show summary"
                                : "Hide summary"
                            }
                          >
                            <IconButton onClick={handleToggleShowSelection}>
                              {!state.showSelections ? (
                                <VisibilityIcon color="primary" />
                              ) : (
                                <VisibilityOffIcon color="primary" />
                              )}
                            </IconButton>
                          </Tooltip>
                        </Grid>
                      </>
                    )}
                  </Grid>
                </Grid>
                {lockedStep.dataset.openPanel && (
                  <Grid item>
                    <Tooltip title="Close panel">
                      <IconButton onClick={handleTogglePanel}>
                        <CloseIcon color="primary" />
                      </IconButton>
                    </Tooltip>
                  </Grid>
                )}
              </Grid>
            </Grid>
            <Grow
              in={
                !lockedStep.dataset.locked &&
                !lockedStep.dataset.openPanel &&
                state.showSelections
              }
              timeout={{ enter: 500, exit: 0 }}
              unmountOnExit
            >
              {dataset.columns.length > 0 && (
                <Grid item xs={12}>
                  <DataTable rows={dataset.rows} columns={dataset.columns} />
                </Grid>
              )}
            </Grow>
          </Grid>
        </AccordionSummary>

        <Grid container justifyContent="center" spacing={4} sx={{ py: 2 }}>
          <Grid item>
            <Paper
              elevation={0}
              sx={buttonStyle()}
              onClick={() => setShowCSVUpload(false)}
            >
              <Typography variant="h6" align="center">
                Manual Data
              </Typography>
            </Paper>
          </Grid>
          <Grid item>
            <Paper
              elevation={0}
              sx={buttonStyle("dataset")}
              onClick={() => {
                handleOpenImportDataset();
                setShowCSVUpload(true);
              }}
            >
              <Typography variant="h6" align="center">
                Upload CSV
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        <AccordionDetails>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <DataTableManager showCSV={showCSVUpload} />
            </Grid>
          </Grid>
        </AccordionDetails>

        <AccordionActions sx={{ py: 2 }}>
          <Grid item xs={12}>
            <Grid container spacing={2} justifyContent="center">
              <Grid item xs={12} md={6}>
                <Button
                  fullWidth
                  variant="contained"
                  disabled={dataset.rows.length === 0}
                  onClick={
                    lockedStep.dataset.step === "3"
                      ? handleUnlockVisualization
                      : lockedStep.dataset.step === "4"
                      ? handleUnlockFinalize
                      : undefined
                  }
                >
                  Next
                </Button>
              </Grid>
            </Grid>
          </Grid>
          <ImportDialog
            open={state.openCsvImport}
            toggleOpen={handleOpenImportDataset}
            setShowCSV={setShowCSVUpload}
          />
        </AccordionActions>
      </Accordion>
    </>
  );
};

export default Dataset;
