import { useContext, useEffect, useMemo, useState, useCallback } from 'react';
import Alert from '@mui/material/Alert';
import {
  Accordion,
  AccordionActions,
  AccordionDetails,
  AccordionSummary,
  Button,
  Chip,
  Divider,
  Grid,
  IconButton,
  Popover,
  Tooltip,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import LockIcon from '@mui/icons-material/Lock';
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';

import { ISCContext } from '../../indicator-specification-card.jsx';
import VisSelection from '../visualization/components/vis-selection.jsx';
import NameDialog from './components/name-dialog.jsx';

// =============================
// Constants (avoid magic strings)
// =============================
const AXIS = {
  X: 'x',
  Y: 'y',
  SERIES: 'series',
};

const COPY = {
  title: 'Preview & Finalize',
  tip:
    'Tip: Take a final look at your indicator with the chosen data. ' +
    'Customize the chart by adding a title, subtitle, and choosing colors that highlight your message. ' +
    'Make sure everything looks clear and meaningful before you finish.',
  errors: {
    x: 'X-Axis column not found: A categorical column is required.',
    y: 'Y-Axis column not found: A numerical column is required.',
    series: 'Chart data (series) not found.',
  },
  actions: {
    editTooltip: 'Edit and customize visualization',
    closeTooltip: 'Close panel',
    save: 'Save indicator',
  },
};

const Finalize = () => {
  const { dataset, visRef, lockedStep, setLockedStep } = useContext(ISCContext);

  const [axisError, setAxisError] = useState(false);
  const [errorType, setErrorType] = useState('');

  // Pre-compute derived data for clarity and efficiency
  const stringCols = useMemo(
    () => dataset.columns.filter((col) => col.type === 'string'),
    [dataset.columns],
  );
  const numberCols = useMemo(
    () => dataset.columns.filter((col) => col.type === 'number'),
    [dataset.columns],
  );
  const seriesLoaded = useMemo(
    () => Array.isArray(visRef.data.series) && visRef.data.series.length > 0,
    [visRef.data.series],
  );

  useEffect(() => {
    if (stringCols.length === 0) {
      setErrorType(AXIS.X);
      setAxisError(true);
    } else if (numberCols.length === 0) {
      setErrorType(AXIS.Y);
      setAxisError(true);
    } else if (!seriesLoaded) {
      setErrorType(AXIS.SERIES);
      setAxisError(true);
    } else {
      setAxisError(false);
      setErrorType('');
    }
  }, [stringCols.length, numberCols.length, seriesLoaded]);

  const [state, setState] = useState({
    showSelections: true,
    openSaveDialog: false,
  });
  const [showCustomize, setShowCustomize] = useState(false);
  const [tipAnchor, setTipAnchor] = useState(null);

  // Handlers
  const handleTogglePanel = useCallback(() => {
    setLockedStep((prev) => ({
      ...prev,
      finalize: {
        ...prev.finalize,
        openPanel: !prev.finalize.openPanel,
      },
    }));
  }, [setLockedStep]);

  const handleOpenSaveDialog = useCallback(() => {
    setState((prev) => ({ ...prev, openSaveDialog: !prev.openSaveDialog }));
  }, []);

  const handleToggleCustomizePanel = useCallback(() => {
    setShowCustomize((s) => !s);
  }, []);

  const handleOpenTip = useCallback((event) => {
    setTipAnchor(event.currentTarget);
  }, []);

  const handleCloseTip = useCallback(() => {
    setTipAnchor(null);
  }, []);

  return (
    <Accordion expanded={lockedStep.finalize.openPanel} disabled={lockedStep.finalize.locked}>
      <AccordionSummary>
        <Grid container spacing={1}>
          <Grid item xs={12}>
            <Grid container alignItems="center" justifyContent="space-between" spacing={1}>
              <Grid item xs>
                <Grid container alignItems="center" spacing={1}>
                  <Grid item>
                    {!lockedStep.finalize.locked ? (
                      <Chip label={lockedStep.finalize.step} color="primary" />
                    ) : (
                      <IconButton size="small" aria-label="locked">
                        <LockIcon />
                      </IconButton>
                    )}
                  </Grid>
                  <Grid item>
                    <Typography>{COPY.title}</Typography>
                  </Grid>

                  {/* Axis Error Messages right below title */}
                  {axisError && (
                    <Grid item xs={12} sx={{ pl: 4, pt: 1, pr: 2 }}>
                      <Alert severity="error" variant="outlined">
                        {errorType === AXIS.X && COPY.errors.x}
                        {errorType === AXIS.Y && COPY.errors.y}
                        {errorType === AXIS.SERIES && COPY.errors.series}
                      </Alert>
                    </Grid>
                  )}
                  {/* End error section */}

                  {!lockedStep.finalize.openPanel && (
                    <Grid item>
                      <Tooltip title={COPY.actions.editTooltip}>
                        <IconButton onClick={handleTogglePanel} aria-label="edit and customize">
                          <EditIcon color="primary" />
                        </IconButton>
                      </Tooltip>
                    </Grid>
                  )}
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
                      <Typography sx={{ p: 2, maxWidth: 250 }}>{COPY.tip}</Typography>
                    </Popover>
                  </Grid>
                </Grid>
              </Grid>
              {lockedStep.finalize.openPanel && (
                <Grid item>
                  <Tooltip title={COPY.actions.closeTooltip}>
                    <IconButton onClick={handleTogglePanel} aria-label="close panel">
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
            <VisSelection customize={showCustomize} handleToggleCustomizePanel={handleToggleCustomizePanel} />
          </Grid>

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
                disabled={dataset.rows.length === 0 || dataset.columns.length === 0}
                onClick={handleOpenSaveDialog}
              >
                {COPY.actions.save}
              </Button>
            </Grid>
          </Grid>
        </Grid>
        <NameDialog open={state.openSaveDialog} toggleOpen={handleOpenSaveDialog} />
      </AccordionActions>
    </Accordion>
  );
};

Finalize.displayName = 'Finalize';

export default Finalize;
