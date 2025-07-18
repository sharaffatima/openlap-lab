import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import LockIcon from "@mui/icons-material/Lock";
import TipsAndUpdatesIcon from "@mui/icons-material/TipsAndUpdates";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Chip,
  Grid,
  Grow,
  IconButton,
  Paper,
  Tooltip,
  Typography,
} from "@mui/material";
import { blue, orange } from "@mui/material/colors";
import Popover from "@mui/material/Popover";
import { useContext, useEffect, useState } from "react";
import { ISCContext } from "../../indicator-specification-card.jsx";

const ChoosePath = () => {
  // Used if Hide All Summary is used
  const { globalShowSummary } = useContext(ISCContext);
  useEffect(() => {
    setState((prev) => ({
      ...prev,
      showSelections: globalShowSummary,
    }));
  }, [globalShowSummary]);


  const { requirements, setRequirements, lockedStep, setLockedStep } =
    useContext(ISCContext);
  const [state, setState] = useState({
    showSelections: true,
  });

  // Used for the tooltip
  const [tipAnchor, setTipAnchor] = useState(null);

  const handleChooseVisualizationPath = () => {
    let vis = "Visualization";
    handleTogglePanel();
    if (requirements.selectedPath !== vis) {
      setLockedStep((prevState) => ({
        ...prevState,
        visualization: {
          ...prevState.visualization,
          locked: false,
          openPanel: true,
          step: "3",
        },
        dataset: {
          ...prevState.dataset,
          locked: true,
          openedPanel: false,
          step: "4",
        },
      }));
      setRequirements((prevState) => ({
        ...prevState,
        selectedPath: vis,
      }));
    } else {
      setLockedStep((prevState) => ({
        ...prevState,
        visualization: {
          ...prevState.visualization,
          openedPanel: true,
        },
      }));
    }
  };

  const handleChooseDatasetPath = () => {
    handleTogglePanel();
    let data = "Dataset";
    if (requirements.selectedPath !== data) {
      {
        setLockedStep((prevState) => ({
          ...prevState,
          dataset: {
            ...prevState.dataset,
            locked: false,
            openPanel: true,
            step: "3",
          },
          visualization: {
            ...prevState.visualization,
            locked: true,
            openPanel: false,
            step: "4",
          },
        }));
        setRequirements((prevState) => ({
          ...prevState,
          selectedPath: data,
        }));
      }
    } else {
      setLockedStep((prevState) => ({
        ...prevState,
        dataset: {
          ...prevState.dataset,
          openedPanel: true,
        },
      }));
    }
  };

  const handleTogglePanel = () => {
    setLockedStep((prevState) => ({
      ...prevState,
      path: {
        ...prevState.path,
        openPanel: !prevState.path.openPanel,
      },
    }));
  };

  const handleToggleShowSelection = () => {
    setState((prevState) => ({
      ...prevState,
      showSelections: !prevState.showSelections,
    }));
  };

  const buttonStyle = (type = "visualization") => {
    return {
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
    };
  };

  return (
    <>
      <Accordion
        expanded={lockedStep.path.openPanel}
        disabled={lockedStep.path.locked}
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
                      {!lockedStep.path.locked ? (
                        <Chip label={lockedStep.path.step} color="primary" />
                      ) : (
                        <IconButton size="small">
                          <LockIcon />
                        </IconButton>
                      )}
                    </Grid>
                    <Grid item>
                      <Typography>How would you like to start?</Typography>
                    </Grid>
                    {!lockedStep.path.openPanel && (
                      <>
                        <Grid item>
                          <Tooltip title="Edit path">
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
                        <Typography sx={{ p: 2, maxWidth: 250}}>
                          Tip: Start with data if you already know what values (rows/columns) you want to show.  
                              Start with visualization if you prefer to pick the chart type first.  
                              Don’t worry — you’ll complete both steps either way.
                        </Typography>
                      </Popover>
                    </Grid>
                  </Grid>
                </Grid>
                {lockedStep.path.openPanel && (
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
              in={!lockedStep.path.openPanel && state.showSelections}
              timeout={{ enter: 500, exit: 0 }}
              unmountOnExit
            >
              <Grid item xs={12}>
                {requirements.selectedPath !== "" && (
                  <Grid item xs={12}>
                    <Grid container alignItems="center" spacing={1}>
                      <Grid item>
                        <Typography>Selected path:</Typography>
                      </Grid>
                      <Grid item>
                        <Chip label={requirements.selectedPath} />
                      </Grid>
                    </Grid>
                  </Grid>
                )}
              </Grid>
            </Grow>
          </Grid>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container justifyContent="center" spacing={4} sx={{ py: 2 }}>
            <Grid item>
              <Paper
                elevation={0}
                sx={buttonStyle()}
                onClick={handleChooseVisualizationPath}
              >
                <Typography variant="h6" align="center">
                  Select Visualization
                </Typography>
              </Paper>
            </Grid>

            <Grid item>
              <Paper
                elevation={0}
                sx={buttonStyle("dataset")}
                onClick={handleChooseDatasetPath}
              >
                <Typography variant="h6" align="center">
                  Select Data
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>
    </>
  );
};

export default ChoosePath;
