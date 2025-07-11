import React, { useContext, useState, useEffect } from "react";
import { ISCContext } from "../../indicator-specification-card.jsx";
import {
  Accordion,
  AccordionActions,
  AccordionDetails,
  AccordionSummary,
  Button,
  Chip,
  Divider,
  IconButton,
  Grid,
  Tooltip,
  Typography,
} from "@mui/material";
import VisSelection from "../visualization/components/vis-selection.jsx";
import NameDialog from "./components/name-dialog.jsx";
import LockIcon from "@mui/icons-material/Lock";
import EditIcon from "@mui/icons-material/Edit";
import CloseIcon from "@mui/icons-material/Close";

const Finalize = () => {
  const { dataset, visRef, lockedStep, setLockedStep } = useContext(ISCContext);

  const [axisError, setAxisError] = useState(false);
  const [errorType, setErrorType] = useState("");

  useEffect(() => {
    // Determine available types
    const stringCols = dataset.columns.filter((col) => col.type === "string");
    const numberCols = dataset.columns.filter((col) => col.type === "number");
    const seriesLoaded =
      Array.isArray(visRef.data.series) && visRef.data.series.length > 0;

    if (stringCols.length === 0) {
      setErrorType("x");
      setAxisError(true);
    } else if (numberCols.length === 0) {
      setErrorType("y");
      setAxisError(true);
    } else if (!seriesLoaded) {
      setErrorType("series");
      setAxisError(true);
    } else {
      setAxisError(false);
      setErrorType("");
    }
  }, [dataset.columns, visRef.data.series]);

  const [state, setState] = useState({
    showSelections: true,
    openSaveDialog: false,
  });
  const [showCustomize, setShowCustomize] = useState(false);

  const handleTogglePanel = () => {
    setLockedStep((prev) => ({
      ...prev,
      finalize: {
        ...prev.finalize,
        openPanel: !prev.finalize.openPanel,
      },
    }));
  };
  const handleOpenSaveDialog = () => {
    setState((prev) => ({ ...prev, openSaveDialog: !prev.openSaveDialog }));
  };
  const handleToggleCustomizePanel = () => {
    setShowCustomize((s) => !s);
  };

  return (
    <Accordion
      expanded={lockedStep.finalize.openPanel}
      disabled={lockedStep.finalize.locked}
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
                    {!lockedStep.finalize.locked ? (
                      <Chip label={lockedStep.finalize.step} color="primary" />
                    ) : (
                      <IconButton size="small">
                        <LockIcon />
                      </IconButton>
                    )}
                  </Grid>
                  <Grid item>
                    <Typography>Preview & Finalize</Typography>
                  </Grid>
                  {!lockedStep.finalize.openPanel && (
                    <Grid item>
                      <Tooltip title="Edit and customize visualization">
                        <IconButton onClick={handleTogglePanel}>
                          <EditIcon color="primary" />
                        </IconButton>
                      </Tooltip>
                    </Grid>
                  )}
                </Grid>
              </Grid>
              {lockedStep.finalize.openPanel && (
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
        </Grid>
      </AccordionSummary>

      <AccordionDetails>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <VisSelection
              customize={showCustomize}
              handleToggleCustomizePanel={handleToggleCustomizePanel}
            />
          </Grid>

          {axisError && (
            <Grid item xs={12}>
              <Typography color="error" align="center">
                {errorType === "x" && "X-Axis column not found: A categorical column is required"}
                {errorType === "y" && "Y-Axis column not found: A numerical column is required"}
                {errorType === "series" && "Chart data (series) not found"}
              </Typography>
            </Grid>
          )}

          <Grid item xs={12}>
            <Divider />
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
                disabled={
                  dataset.rows.length === 0 || dataset.columns.length === 0
                }
                onClick={handleOpenSaveDialog}
              >
                Save indicator
              </Button>
            </Grid>
          </Grid>
        </Grid>
        <NameDialog
          open={state.openSaveDialog}
          toggleOpen={handleOpenSaveDialog}
        />
      </AccordionActions>
    </Accordion>
  );
};

export default Finalize;
