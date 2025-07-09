import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import LockIcon from "@mui/icons-material/Lock";
import TipsAndUpdatesIcon from "@mui/icons-material/TipsAndUpdates";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
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
} from "@mui/material";
import Popover from "@mui/material/Popover";
import { useContext, useEffect, useState } from "react";
import { ISCContext } from "../../indicator-specification-card.jsx";
import DataTable from "./components/data-table.jsx";
import DataTableManager from "./data-table-manager/data-table-manager.jsx";


const Dataset = () => {
    // Used if Hide All Summary is used
  const { globalShowSummary } = useContext(ISCContext);
  useEffect(() => {
      setState((prev) => ({
        ...prev,
        showSelections: globalShowSummary,
      }));
    }, [globalShowSummary]);

  const { dataset, lockedStep, setLockedStep } = useContext(ISCContext);
  const [state, setState] = useState({
    showSelections: true,
  });

  // Used for the tooltip
  const [tipAnchor, setTipAnchor] = useState(null);
  

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
                    <Grid item>
                        <IconButton
                          size="small"
                          onClick={(e) => setTipAnchor(e.currentTarget)}
                          sx={{ ml: 1 }}
                        >
                          <TipsAndUpdatesIcon color="primary" />
                          </IconButton>
                          <Popover
                        open={Boolean(tipAnchor)}
                        anchorEl={tipAnchor}
                        onClose={() => setTipAnchor(null)}
                        anchorOrigin={{
                          vertical: "bottom",
                          horizontal: "left",
                        }}
                        
                      >
                        <Typography sx={{ p: 2, maxWidth: 250}}>
                          Tip: Add your data by filling in the table or uploading a CSV file.  
                          Use the rows to enter the values you want to visualize. You can always add or remove rows and columns as needed.
                        </Typography>
                      </Popover>
                    </Grid>
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
        <AccordionDetails>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <DataTableManager />
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
                    dataset.rows.length === 0 && dataset.columns.length === 0
                  }
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
        </AccordionActions>
      </Accordion>
    </>
  );
};

export default Dataset;
