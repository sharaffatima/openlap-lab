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
import ChartTypeFilter from "./components/chart-type-filter.jsx";
import VisualizationFilter from "./components/visualization-filter.jsx";

const Visualization = () => {
  // Used if Hide All Summary is used
  const { globalShowSummary } = useContext(ISCContext);
  useEffect(() => {
      setState((prev) => ({
        ...prev,
        showSelections: globalShowSummary,
      }));
    }, [globalShowSummary]);


  const {
    requirements,
    setRequirements,
    lockedStep,
    setLockedStep,
    visRef,
    setVisRef,
  } = useContext(ISCContext);
  const [state, setState] = useState({
    showSelections: true,
  });

  // Used for the tooltip
  const [tipAnchor, setTipAnchor] = useState(null);

  const handleTogglePanel = () => {
    setLockedStep((prevState) => ({
      ...prevState,
      visualization: {
        ...prevState.visualization,
        openPanel: !prevState.visualization.openPanel,
      },
    }));
  };

  const handleToggleShowSelection = () => {
    setState((prevState) => ({
      ...prevState,
      showSelections: !prevState.showSelections,
    }));
  };

  const handleUnlockDataset = () => {
    handleTogglePanel();
    setLockedStep((prevState) => ({
      ...prevState,
      dataset: {
        ...prevState.dataset,
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
        expanded={lockedStep.visualization.openPanel}
        disabled={lockedStep.visualization.locked}
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
                      {!lockedStep.visualization.locked ? (
                        <Chip
                          label={lockedStep.visualization.step}
                          color="primary"
                        />
                      ) : (
                        <IconButton size="small">
                          <LockIcon />
                        </IconButton>
                      )}
                    </Grid>
                    <Grid item>
                      <Typography>Visualization</Typography>
                    </Grid>
                    {!lockedStep.visualization.openPanel && (
                      <>
                        <Grid item>
                          <Tooltip title="Edit visualization selection">
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
                          <Tooltip title="Tip">
                            <IconButton
                              onClick={(event) => setTipAnchor(event.currentTarget)}
                            >
                              <TipsAndUpdatesIcon color="primary" />
                            </IconButton>
                          </Tooltip>
                          <Popover
                            open={Boolean(tipAnchor)}
                            anchorEl={tipAnchor}
                            onClose={() => setTipAnchor(null)}
                            anchorOrigin={{
                              vertical: "bottom",
                              horizontal: "left",
                            }}
                            transformOrigin={{
                              vertical: "top",
                              horizontal: "left",
                        }}
                        PaperProps={{
                          sx: {
                            backgroundColor: "primary.main",
                            color: "primary.contrastText",
                            position: "absolute",
                            p: 2,
                          }
                        }}
                      >
                          <IconButton
                            size="small"
                            onClick={() => setTipAnchor(null)}
                            sx={{
                              position: "absolute",
                              top: 4,
                              right: 4,
                              color: "primary.contrastText",
                            }}
                          >
                            <CloseIcon fontSize="small" />
                          </IconButton>
                            <Typography sx={{ p: 2, maxWidth: 250 }}>
                              Tip: Choose a chart type that fits your data.  
		Make sure the number of columns and their types (e.g. categorical or numeric) match the requirements of the selected chart.  
		Charts that match your dataset are marked with a green thumb icon.
                          </Typography>
                          </Popover>
                        </Grid>
                  </Grid>
                </Grid>
                {lockedStep.visualization.openPanel && (
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
                !lockedStep.visualization.locked &&
                !lockedStep.visualization.openPanel &&
                state.showSelections
              }
              timeout={{ enter: 500, exit: 0 }}
              unmountOnExit
            >
              <Grid item xs={12}>
                <Grid container spacing={1}>
                  {visRef.filter.type !== "" &&
                    requirements.goalType.name !== "" && (
                      <Grid item xs={12}>
                        <Grid container alignItems="center" spacing={1}>
                          <Grid item>
                            <Typography>Filter applied</Typography>
                          </Grid>
                          <Grid item>
                            <Chip label={visRef.filter.type} />
                          </Grid>
                        </Grid>
                      </Grid>
                    )}
                  {visRef.chart.type !== "" && (
                    <Grid item xs={12}>
                      <Grid container alignItems="center" spacing={1}>
                        <Grid item>
                          <Typography>Chart selected</Typography>
                        </Grid>
                        <Grid item>
                          <Chip label={visRef.chart.type} />
                        </Grid>
                      </Grid>
                    </Grid>
                  )}
                </Grid>
              </Grid>
            </Grow>
          </Grid>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <ChartTypeFilter />
            </Grid>
            <Grid item xs={12}>
              <VisualizationFilter />
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
                  disabled={visRef.chart.type === ""}
                  onClick={
                    lockedStep.visualization.step === "3"
                      ? handleUnlockDataset
                      : lockedStep.visualization.step === "4"
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

export default Visualization;
