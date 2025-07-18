import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
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
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import Popover from "@mui/material/Popover";
import { useContext, useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { ISCContext } from "../../indicator-specification-card.jsx";
import DataList from "./components/data-list.jsx";
import GoalList from "./components/goal-list.jsx";

const SpecifyRequirements = () => {
  const { globalShowSummary, setGlobalShowSummary } = useContext(ISCContext);
  const [isGlobalHidden, setIsGlobalHidden] = useState(false);
  const [tipAnchor, setTipAnchor] = useState(null); 
  useEffect(() => {
  if (!globalShowSummary) {
    setIsGlobalHidden(true);
    setState((prev) => ({
      ...prev,
      showSelections: false,
    }));
  } else if (isGlobalHidden) {
    setState((prev) => ({
      ...prev,
      showSelections: true,
    }));
    setIsGlobalHidden(false);
  }
}, [globalShowSummary]);

  const {
    requirements,
    setRequirements,
    lockedStep,
    setLockedStep,
    dataset,
    setDataset,
  } = useContext(ISCContext);
  const [state, setState] = useState({
    showSelections: true,
  });

  const handleTogglePanel = () => {
    setLockedStep((prevState) => ({
      ...prevState,
      requirements: {
        ...prevState.requirements,
        openPanel: !prevState.requirements.openPanel,
      },
    }));
  };

  const handleToggleShowSelection = () => {
    setState((prevState) => ({
      ...prevState,
      showSelections: !prevState.showSelections,
    }));
  };

  const handleFormData = (event) => {
    const { name, value } = event.target;
    setRequirements((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleUnlockPath = () => {
    handleTogglePanel();
    if (lockedStep.path.locked) {
      addNewColumnsMethod();
    }
    setLockedStep((prevState) => ({
      ...prevState,
      path: {
        ...prevState.path,
        locked: false,
        openPanel: true,
      },
    }));
  };

  const addNewColumnsMethod = () => {
    let tempColumnData = [];
    let tempRows = [];
    requirements.data.forEach((item) => {
      // Log
      console.log(
      `Creating column: "${item.value}" with data type: "${item.type?.type}"`
      );
      let fieldUUID = uuidv4();
      tempColumnData.push({
        field: fieldUUID,
        headerName: item.value,
        sortable: false,
        editable: true,
        width: 200,
        type: item.type.type,
        dataType: item.type, // Custom field
      });
      if (Boolean(tempRows.length)) {
        tempRows = tempRows.map((row, index) => ({
          ...row,
          [fieldUUID]:
            item.type.type === "string" ? `${item.value} ${index + 1}` : 0,
        }));
      } else {
        for (let i = 0; i < 3; i++) {
          tempRows.push({
            id: uuidv4(),
            [fieldUUID]:
              item.type.type === "string" ? `${item.value} ${i + 1}` : 0,
          });
        }
      }
    });
    if (
      requirements.data.some((item) => Object.values(item.type).length !== 0) &&
      requirements.data.some((item) => item.value !== "")
    ) {
      setDataset((prevState) => ({
        ...prevState,
        rows: tempRows,
        columns: tempColumnData,
      }));
    }
  };

  const handleToggleGoalEdit = () => {
    setRequirements((prevState) => ({
      ...prevState,
      edit: {
        ...prevState.edit,
        goal: !prevState.edit.goal,
      },
      show: {
        ...prevState.show,
        question: true,
      },
    }));
  };

  const handleToggleQuestionEdit = () => {
    setRequirements((prevState) => ({
      ...prevState,
      edit: {
        ...prevState.edit,
        question: !prevState.edit.question,
      },
      show: {
        ...prevState.show,
        indicatorName: true,
      },
    }));
  };

  return (
    <>
      <Accordion expanded={lockedStep.requirements.openPanel}>
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
                      <Chip
                        label={lockedStep.requirements.step}
                        color="primary"
                      />
                    </Grid>
                    <Grid item>
                      <Typography>
                        Specify your goal, question, and indicator
                      </Typography>
                    </Grid>
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
                              Tip: Think about what exactly you want to measure, why it matters, and what data you need to help you answer your question.
                            </Typography>
                      </Popover>                    
                    </Grid>
                    {!lockedStep.requirements.openPanel && (
                      <>
                        <Grid item>
                          <Tooltip title="Edit requirements">
                            <IconButton onClick={handleTogglePanel}>
                              <EditIcon color="primary" />
                            </IconButton>
                          </Tooltip>
                        </Grid>
                          <Grid item>
                            <Tooltip
                              title={!state.showSelections ? "Show summary" : "Hide summary"}
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

                            {/* Push global button to the far right */}
                            <Grid item xs />
                            <Grid item>
                              <Tooltip
                                title={
                                  globalShowSummary
                                    ? "Hide all summaries"
                                    : "Show all summaries"
                                }
                              >
                                <IconButton onClick={() => setGlobalShowSummary((prev) => !prev)}>
                                  {globalShowSummary ? (
                                    <VisibilityOffIcon color="primary" />
                                  ) : (
                                    <VisibilityIcon color="primary" />
                                  )}
                                </IconButton>
                              </Tooltip>
                            </Grid>
                      </>
                    )}
                  </Grid>
                </Grid>
                {lockedStep.requirements.openPanel && (
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
              in={!lockedStep.requirements.openPanel && state.showSelections}
              timeout={{ enter: 500, exit: 0 }}
              unmountOnExit
            >
              <Grid item xs={12}>
                <Grid container spacing={1}>
                  {requirements.goal !== "" &&
                    requirements.goalType.name !== "" && (
                      <Grid item xs={12}>
                        <Grid container alignItems="center" spacing={1}>
                          <Grid item>
                            <Typography>I want to</Typography>
                          </Grid>
                          <Grid item>
                            <Chip label={requirements.goalType.verb} />
                          </Grid>
                          <Grid item>
                            <Chip label={requirements.goal} />
                          </Grid>
                        </Grid>
                      </Grid>
                    )}
                  {requirements.question !== "" && (
                    <Grid item xs={12}>
                      <Grid container alignItems="center" spacing={1}>
                        <Grid item>
                          <Typography>I am interested in</Typography>
                        </Grid>
                        <Grid item>
                          <Chip label={requirements.question} />
                        </Grid>
                      </Grid>
                    </Grid>
                  )}
                  {requirements.question !== "" && (
                    <Grid item xs={12}>
                      <Grid container alignItems="center" spacing={1}>
                        <Grid item>
                          <Typography>I need an indicator showing</Typography>
                        </Grid>
                        <Grid item>
                          <Chip label={requirements.indicatorName} />
                        </Grid>
                      </Grid>
                    </Grid>
                  )}




                  {requirements.data.some((d) => d.value) && (
                       <Grid item xs={12}>
                         <Grid container alignItems="center" spacing={1}>
                           <Grid item>
                             <Typography>I need the following data</Typography>
                           </Grid>

                         {requirements.data.map((item, index) =>
                            item.value ? (
                             <Grid item key={index}>
                              <Chip label={item.value} />
                           </Grid>
                        ) : null
                       )}
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
            {requirements.edit.goal ? (
              <>
                <Grid item xs={12}>
                  <Grid container spacing={2} justifyContent="center">
                    <Grid item xs={12} md={8}>
                      <Typography variant="body2">Specify your goal</Typography>
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item xs={12}>
                  <Grid container spacing={2} justifyContent="center">
                    <Grid item xs={12} md={8}>
                      <Grid container spacing={2}>
                        <Grid item xs sm={4}>
                          <GoalList />
                        </Grid>
                        <Grid item xs={12} sm>
                          <Grid container spacing={2} alignItems="center">
                            <Grid item xs>
                              <TextField
                                fullWidth
                                required
                                name="goal"
                                value={requirements.goal}
                                label="Describe your goal"
                                placeholder="e.g., the usage of the learning materials in my course."
                                onChange={handleFormData}
                              />
                            </Grid>
                          <Grid item >
                                  <Button fullWidth variant="contained"
                                  color="primary"
                                  onClick={handleToggleGoalEdit}
                                  disabled={
                                    requirements.goal.length < 1 ||
                                    requirements.goalType.verb.length < 1
                                  }>
                                    CONFIRM
                            </Button>   

                            </Grid>
                          </Grid>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>

                </Grid>
                                 
              </>
            ) : (
              <>
                <Grid item xs={12}>
                  <Grid container spacing={2} justifyContent="center">
                    <Grid item xs={12} md={8}>
                      <Grid container alignItems="center" spacing={1}>
                        <Grid item>
                          <Typography>
                            <i>Your goal:</i> I want to{" "}
                            <b>{requirements.goalType.verb}</b> the{" "}
                            <b>{requirements.goal}</b>
                          </Typography>
                        </Grid>
                        <Grid item>
                          <Tooltip title="Edit your goal">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={handleToggleGoalEdit}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              </>
            )}

            {requirements.show.question && (
              <>
                {requirements.edit.question ? (
                  <>
                    <Grid item xs={12}>
                      <Grid container spacing={2} justifyContent="center">
                        <Grid item xs={12}>
                          <Grid container spacing={2} justifyContent="center">
                            <Grid item xs={12} md={8}>
                              <Typography variant="body2">
                                Specify your question
                              </Typography>
                            </Grid>
                          </Grid>
                        </Grid>
                        <Grid item xs={12} md={8}>
                          <Grid container spacing={2} alignItems="center">
                            <Grid item xs>
                              <TextField
                                fullWidth
                                required
                                name="question"
                                value={requirements.question}
                                label="I am interested in"
                                placeholder="e.g., knowing how often these learning materials are viewed by my students."
                                onChange={handleFormData}
                              />
                        </Grid>

                          <Grid item>
                                  <Button fullWidth variant="contained"
                                  color="primary"
                                  onClick={handleToggleQuestionEdit}
                                  disabled={requirements.question.length < 1}>
                                    CONFIRM
                            </Button>   
                          </Grid>
                        </Grid>
                    </Grid>

                      </Grid>
                    </Grid>
                  </>
                ) : (
                  <>
                    <Grid item xs={12}>
                      <Grid container spacing={2} justifyContent="center">
                        <Grid item xs={12} md={8}>
                          <Grid container alignItems="center" spacing={1}>
                            <Grid item>
                              <Typography>
                                <i>Your question:</i> I am interested in{" "}
                                <b>{requirements.question}</b>
                              </Typography>
                            </Grid>
                            <Grid item>
                              <Tooltip title="Edit your question">
                                <IconButton
                                  size="small"
                                  color="primary"
                                  onClick={handleToggleQuestionEdit}
                                >
                                  <EditIcon />
                                </IconButton>
                              </Tooltip>
                            </Grid>
                          </Grid>
                        </Grid>
                      </Grid>
                    </Grid>
                  </>
                )}
              </>
            )}

            {requirements.show.indicatorName && (
              <>
                <Grid item xs={12}>
                  <Grid container spacing={2} justifyContent="center">
                    <Grid item xs={12}>
                      <Grid container spacing={2} justifyContent="center">
                        <Grid item xs={12} md={8}>
                          <Typography variant="body2">
                            Specify your indicator
                          </Typography>
                        </Grid>
                      </Grid>
                    </Grid>
                    <Grid item xs={12} md={8}>
                      <Grid container spacing={2} alignItems="center">
                        <Grid item xs>
                          <TextField
                            fullWidth
                            required
                            name="indicatorName"
                            value={requirements.indicatorName}
                            label="I need an indicator showing"
                            placeholder="e.g., the number of views of learning materials and sort by the most viewed ones."
                            onChange={handleFormData}
                          />
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item xs={12}>
                  <Grid container spacing={2} justifyContent="center">
                    <Grid item xs={12} md={8}>
                      <DataList />
                    </Grid>
                  </Grid>
                </Grid>
              </>
            )}
          </Grid>
        </AccordionDetails>
      {requirements.show.indicatorName && (  //the "NEXT" Button is only visible after the last step
        <AccordionActions sx={{ py: 2 }}>
          <Grid item xs={12}>
            <Grid container spacing={2} justifyContent="center">
              <Grid item xs={12} md={6}>
                <Button
                  fullWidth
                  variant="contained"
                  disabled={
                    requirements.goalType.verb === "" ||
                    requirements.goal === "" ||
                    requirements.question === "" ||
                    requirements.indicatorName === "" ||  requirements.data.some(
  (item) =>
    typeof item.value !== "string" ||
    item.value.trim() === "" ||
    !item.type ||
    typeof item.type.type !== "string" ||
    item.type.type.trim() === ""
)
                    
                  }
                  onClick={handleUnlockPath}
                >
                  Next 
                </Button>
              </Grid>
            </Grid>
          </Grid>
          </AccordionActions>
      )}
      </Accordion>
    </>
  );
};

export default SpecifyRequirements;
