import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
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
} from '@mui/material';
import Popover from '@mui/material/Popover';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { v4 as uuidv4 } from 'uuid';

import { ISCContext } from '../../indicator-specification-card.jsx';
import DataList from './components/data-list.jsx';
import GoalList from './components/goal-list.jsx';

// =============================
// Constants (avoid magic strings)
// =============================
const DEFAULT_ROW_COUNT = 3;

const COPY = {
  title: 'Specify your goal, question, and indicator',
  tips:
    'Tip: Think about what exactly you want to measure, why it matters, and what data you need to help you answer your question.',
  actions: {
    editRequirements: 'Edit requirements',
    showSummary: 'Show summary',
    hideSummary: 'Hide summary',
    showAll: 'Show all summaries',
    hideAll: 'Hide all summaries',
    closePanel: 'Close panel',
    confirm: 'CONFIRM',
    next: 'Next',
  },
  labels: {
    iWantTo: 'I want to',
    iAmInterestedIn: 'I am interested in',
    iNeedIndicator: 'I need an indicator showing',
    iNeedData: 'I need the following data',
    goalField: 'Describe your goal',
    goalEg: 'e.g., the usage of the learning materials in my course.',
    questionField: 'I am interested in',
    questionEg: 'e.g., knowing how often these learning materials are viewed by my students.',
    indicatorField: 'I need an indicator showing',
    indicatorEg:
      'e.g., the number of views of learning materials and sort by the most viewed ones.',
  },
  tooltips: {
    editGoal: 'Edit your goal',
    editQuestion: 'Edit your question',
  },
};

const SpecifyRequirements = () => {
  const { globalShowSummary, setGlobalShowSummary } = useContext(ISCContext);
  const [isGlobalHidden, setIsGlobalHidden] = useState(false);
  const [tipAnchor, setTipAnchor] = useState(null);

  const {
    requirements,
    setRequirements,
    lockedStep,
    setLockedStep,
    dataset,
    setDataset,
  } = useContext(ISCContext);

  const [state, setState] = useState({ showSelections: true });

  // Sync local summary visibility with global toggle
  useEffect(() => {
    if (!globalShowSummary) {
      setIsGlobalHidden(true);
      setState((prev) => ({ ...prev, showSelections: false }));
    } else if (isGlobalHidden) {
      setState((prev) => ({ ...prev, showSelections: true }));
      setIsGlobalHidden(false);
    }
  }, [globalShowSummary, isGlobalHidden]);

  // =============================
  // Derived booleans
  // =============================
  const hasGoal = useMemo(
    () => requirements.goal !== '' && requirements.goalType.name !== '',
    [requirements.goal, requirements.goalType.name],
  );

  const hasQuestion = useMemo(
    () => requirements.question !== '',
    [requirements.question],
  );

  const hasIndicatorName = useMemo(
    () => requirements.indicatorName !== '',
    [requirements.indicatorName],
  );

  const hasAnyDataValues = useMemo(
    () => requirements.data.some((d) => d.value),
    [requirements.data],
  );

  const isNextDisabled = useMemo(() => {
    const hasInvalidData = requirements.data.some(
      (item) =>
        typeof item.value !== 'string' ||
        item.value.trim() === '' ||
        !item.type ||
        typeof item.type.type !== 'string' ||
        item.type.type.trim() === '',
    );

    return (
      requirements.goalType.verb === '' ||
      requirements.goal === '' ||
      requirements.question === '' ||
      requirements.indicatorName === '' ||
      hasInvalidData
    );
  }, [
    requirements.data,
    requirements.goal,
    requirements.goalType.verb,
    requirements.indicatorName,
    requirements.question,
  ]);

  // =============================
  // Handlers (stable with useCallback)
  // =============================
  const handleTogglePanel = useCallback(() => {
    setLockedStep((prevState) => ({
      ...prevState,
      requirements: {
        ...prevState.requirements,
        openPanel: !prevState.requirements.openPanel,
      },
    }));
  }, [setLockedStep]);

  const handleToggleShowSelection = useCallback(() => {
    setState((prevState) => ({
      ...prevState,
      showSelections: !prevState.showSelections,
    }));
  }, []);

  const handleFormData = useCallback(
    (event) => {
      const { name, value } = event.target;
      setRequirements((prevState) => ({ ...prevState, [name]: value }));
    },
    [setRequirements],
  );

  const addNewColumnsMethod = useCallback(() => {
    let tempColumnData = [];
    let tempRows = [];

    requirements.data.forEach((item) => {
      const fieldUUID = uuidv4();

      tempColumnData.push({
        field: fieldUUID,
        headerName: item.value,
        sortable: false,
        editable: true,
        width: 200,
        type: item.type.type,
        dataType: item.type, // Custom field (preserve existing structure)
      });

      if (Boolean(tempRows.length)) {
        tempRows = tempRows.map((row, index) => ({
          ...row,
          [fieldUUID]: item.type.type === 'string' ? `${item.value} ${index + 1}` : 0,
        }));
      } else {
        for (let i = 0; i < DEFAULT_ROW_COUNT; i++) {
          tempRows.push({
            id: uuidv4(),
            [fieldUUID]: item.type.type === 'string' ? `${item.value} ${i + 1}` : 0,
          });
        }
      }
    });

    const hasTypes = requirements.data.some((item) => Object.values(item.type).length !== 0);
    const hasValues = requirements.data.some((item) => item.value !== '');

    if (hasTypes && hasValues) {
      setDataset((prevState) => ({ ...prevState, rows: tempRows, columns: tempColumnData }));
    }
  }, [requirements.data, setDataset]);

  const handleUnlockPath = useCallback(() => {
    handleTogglePanel();
    if (lockedStep.path.locked) {
      addNewColumnsMethod();
    }
    setLockedStep((prevState) => ({
      ...prevState,
      path: { ...prevState.path, locked: false, openPanel: true },
    }));
  }, [addNewColumnsMethod, handleTogglePanel, lockedStep.path.locked, setLockedStep]);

  const handleOpenTip = useCallback((e) => setTipAnchor(e.currentTarget), []);
  const handleCloseTip = useCallback(() => setTipAnchor(null), []);

  return (
    <>
      <Accordion expanded={lockedStep.requirements.openPanel}>
        <AccordionSummary>
          <Grid container spacing={1}>
            <Grid item xs={12}>
              <Grid container alignItems="center" justifyContent="space-between" spacing={1}>
                <Grid item xs>
                  <Grid container alignItems="center" spacing={1}>
                    <Grid item>
                      <Chip label={lockedStep.requirements.step} color="primary" />
                    </Grid>
                    <Grid item>
                      <Typography>{COPY.title}</Typography>
                    </Grid>
                    <Grid item>
                      <IconButton size="small" onClick={handleOpenTip} sx={{ ml: 1 }} aria-label="tips">
                        <TipsAndUpdatesIcon color="primary" />
                      </IconButton>
                      <Popover
                        open={Boolean(tipAnchor)}
                        anchorEl={tipAnchor}
                        onClose={handleCloseTip}
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                        PaperProps={{
                          sx: {
                            backgroundColor: 'primary.main',
                            color: 'primary.contrastText',
                            position: 'absolute',
                            p: 2,
                          },
                        }}
                      >
                        <IconButton
                          size="small"
                          onClick={handleCloseTip}
                          sx={{ position: 'absolute', top: 4, right: 4, color: 'primary.contrastText' }}
                          aria-label="close tips"
                        >
                          <CloseIcon fontSize="small" />
                        </IconButton>
                        <Typography sx={{ p: 2, maxWidth: 250 }}>{COPY.tips}</Typography>
                      </Popover>
                    </Grid>

                    {!lockedStep.requirements.openPanel && (
                      <>
                        <Grid item>
                          <Tooltip title={COPY.actions.editRequirements}>
                            <IconButton onClick={handleTogglePanel} aria-label="edit requirements">
                              <EditIcon color="primary" />
                            </IconButton>
                          </Tooltip>
                        </Grid>
                        <Grid item>
                          <Tooltip title={!state.showSelections ? COPY.actions.showSummary : COPY.actions.hideSummary}>
                            <IconButton onClick={handleToggleShowSelection} aria-label="toggle summary visibility">
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
                          <Tooltip title={globalShowSummary ? COPY.actions.hideAll : COPY.actions.showAll}>
                            <IconButton onClick={() => setGlobalShowSummary((prev) => !prev)} aria-label="toggle all summaries">
                              {globalShowSummary ? <VisibilityOffIcon color="primary" /> : <VisibilityIcon color="primary" />}
                            </IconButton>
                          </Tooltip>
                        </Grid>
                      </>
                    )}
                  </Grid>
                </Grid>
                {lockedStep.requirements.openPanel && (
                  <Grid item>
                    <Tooltip title={COPY.actions.closePanel}>
                      <IconButton onClick={handleTogglePanel} aria-label="close panel">
                        <CloseIcon color="primary" />
                      </IconButton>
                    </Tooltip>
                  </Grid>
                )}
              </Grid>
            </Grid>

            <Grow in={!lockedStep.requirements.openPanel && state.showSelections} timeout={{ enter: 500, exit: 0 }} unmountOnExit>
              <Grid item xs={12}>
                <Grid container spacing={1}>
                  {hasGoal && (
                    <Grid item xs={12}>
                      <Grid container alignItems="center" spacing={1}>
                        <Grid item>
                          <Typography>{COPY.labels.iWantTo}</Typography>
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

                  {hasQuestion && (
                    <Grid item xs={12}>
                      <Grid container alignItems="center" spacing={1}>
                        <Grid item>
                          <Typography>{COPY.labels.iAmInterestedIn}</Typography>
                        </Grid>
                        <Grid item>
                          <Chip label={requirements.question} />
                        </Grid>
                      </Grid>
                    </Grid>
                  )}

                  {hasQuestion && (
                    <Grid item xs={12}>
                      <Grid container alignItems="center" spacing={1}>
                        <Grid item>
                          <Typography>{COPY.labels.iNeedIndicator}</Typography>
                        </Grid>
                        <Grid item>
                          <Chip label={requirements.indicatorName} />
                        </Grid>
                      </Grid>
                    </Grid>
                  )}

                  {hasAnyDataValues && (
                    <Grid item xs={12}>
                      <Grid container alignItems="center" spacing={1}>
                        <Grid item>
                          <Typography>{COPY.labels.iNeedData}</Typography>
                        </Grid>
                        {requirements.data.map((item, index) =>
                          item.value ? (
                            <Grid item key={index}>
                              <Chip label={item.value} />
                            </Grid>
                          ) : null,
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
                                label={COPY.labels.goalField}
                                placeholder={COPY.labels.goalEg}
                                onChange={handleFormData}
                              />
                            </Grid>
                            <Grid item>
                              <Button
                                fullWidth
                                variant="contained"
                                color="primary"
                                onClick={() =>
                                  setRequirements((prevState) => ({
                                    ...prevState,
                                    edit: { ...prevState.edit, goal: !prevState.edit.goal },
                                    show: { ...prevState.show, question: true },
                                  }))
                                }
                                disabled={requirements.goal.length < 1 || requirements.goalType.verb.length < 1}
                              >
                                {COPY.actions.confirm}
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
                            <i>Your goal:</i> I want to <b>{requirements.goalType.verb}</b> the <b>{requirements.goal}</b>
                          </Typography>
                        </Grid>
                        <Grid item>
                          <Tooltip title={COPY.tooltips.editGoal}>
                            <IconButton size="small" color="primary" onClick={() => setRequirements((prevState) => ({
                              ...prevState,
                              edit: { ...prevState.edit, goal: !prevState.edit.goal },
                              show: { ...prevState.show, question: true },
                            }))} aria-label="edit goal">
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
                              <Typography variant="body2">Specify your question</Typography>
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
                                label={COPY.labels.questionField}
                                placeholder={COPY.labels.questionEg}
                                onChange={handleFormData}
                              />
                            </Grid>
                            <Grid item>
                              <Button
                                fullWidth
                                variant="contained"
                                color="primary"
                                onClick={() => setRequirements((prevState) => ({
                                  ...prevState,
                                  edit: { ...prevState.edit, question: !prevState.edit.question },
                                  show: { ...prevState.show, indicatorName: true },
                                }))}
                                disabled={requirements.question.length < 1}
                              >
                                {COPY.actions.confirm}
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
                                <i>Your question:</i> I am interested in <b>{requirements.question}</b>
                              </Typography>
                            </Grid>
                            <Grid item>
                              <Tooltip title={COPY.tooltips.editQuestion}>
                                <IconButton size="small" color="primary" onClick={() => setRequirements((prevState) => ({
                                  ...prevState,
                                  edit: { ...prevState.edit, question: !prevState.edit.question },
                                  show: { ...prevState.show, indicatorName: true },
                                }))} aria-label="edit question">
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
                          <Typography variant="body2">Specify your indicator</Typography>
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
                            label={COPY.labels.indicatorField}
                            placeholder={COPY.labels.indicatorEg}
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

        {requirements.show.indicatorName && (
          // the "NEXT" Button is only visible after the last step
          <AccordionActions sx={{ py: 2 }}>
            <Grid item xs={12}>
              <Grid container spacing={2} justifyContent="center">
                <Grid item xs={12} md={6}>
                  <Button
                    fullWidth
                    variant="contained"
                    disabled={isNextDisabled}
                    onClick={handleUnlockPath}
                  >
                    {COPY.actions.next}
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

SpecifyRequirements.displayName = 'SpecifyRequirements';

export default SpecifyRequirements;
