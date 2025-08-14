import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
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
  Alert,
} from '@mui/material';
import Popover from '@mui/material/Popover';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import LockIcon from '@mui/icons-material/Lock';
import { blue, orange } from '@mui/material/colors';

import { ISCContext } from '../../indicator-specification-card.jsx';
import DataTableManager from './data-table-manager/data-table-manager.jsx';
import DataTable from './components/data-table.jsx';
import ImportDialog from './components/import-dialog.jsx';

// =============================
// Constants (avoid magic strings)
// =============================
const AXIS = {
  X: 'x',
  Y: 'y',
  SERIES: 'series',
};

const COPY = {
  title: 'Dataset',
  tips:
    'Tip: Add your data by filling in the table or uploading a CSV file. Use the rows to enter the values you want to visualize. You can always add or remove rows and columns as needed.',
  errors: {
    x: 'X-Axis column not found: A categorical column is required.',
    y: 'Y-Axis column not found: A numerical column is required.',
    series: 'Chart data (series) not found.',
    noData: 'No data in dataset to display. Please add some data to proceed.',
  },
  actions: {
    editDataset: 'Edit dataset',
    showSummary: 'Show summary',
    hideSummary: 'Hide summary',
    closePanel: 'Close panel',
    manualData: 'Manual Data',
    uploadCsv: 'Upload CSV',
    next: 'Next',
  },
  aria: {
    tipsButton: 'tips',
    closeTips: 'close tips',
    edit: 'edit dataset',
    closePanel: 'close panel',
  },
};

const Dataset = () => {
  const { dataset, lockedStep, setLockedStep, visRef, globalShowSummary } = useContext(ISCContext);

  const [axisError, setAxisError] = useState(false);
  const [errorType, setErrorType] = useState('');

  const [showCSVUpload, setShowCSVUpload] = useState(true);
  const [state, setState] = useState({ showSelections: true, openCsvImport: false });
  const [tipAnchor, setTipAnchor] = useState(null);

  // Derived columns
  const stringCols = useMemo(() => dataset.columns.filter((col) => col.type === 'string'), [dataset.columns]);
  const numberCols = useMemo(() => dataset.columns.filter((col) => col.type === 'number'), [dataset.columns]);
  const seriesLoaded = useMemo(
    () => Array.isArray(visRef.data.series) && visRef.data.series.length > 0,
    [visRef.data.series],
  );

  // Axis Error
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

  // Hide / Show All Summary Button
  useEffect(() => {
    setState((prevState) => ({ ...prevState, showSelections: globalShowSummary }));
  }, [globalShowSummary]);

  // Handlers (stable)
  const handleOpenImportDataset = useCallback(() => {
    setState((prevState) => ({ ...prevState, openCsvImport: !prevState.openCsvImport }));
  }, []);

  const handleTogglePanel = useCallback(() => {
    setLockedStep((prevState) => ({
      ...prevState,
      dataset: { ...prevState.dataset, openPanel: !prevState.dataset.openPanel },
    }));
  }, [setLockedStep]);

  const handleToggleShowSelection = useCallback(() => {
    setState((prevState) => ({ ...prevState, showSelections: !prevState.showSelections }));
  }, []);

  const handleUnlockVisualization = useCallback(() => {
    handleTogglePanel();
    setLockedStep((prevState) => ({
      ...prevState,
      visualization: { ...prevState.visualization, locked: false, openPanel: true, step: '4' },
    }));
  }, [handleTogglePanel, setLockedStep]);

  const handleUnlockFinalize = useCallback(() => {
    handleTogglePanel();
    setLockedStep((prevState) => ({
      ...prevState,
      finalize: { ...prevState.finalize, locked: false, openPanel: true },
    }));
  }, [handleTogglePanel, setLockedStep]);

  const handleOpenTip = useCallback((e) => setTipAnchor(e.currentTarget), []);
  const handleCloseTip = useCallback(() => setTipAnchor(null), []);

  const buttonStyle = useCallback(
    (type = 'visualization') => ({
      height: 150,
      width: 150,
      border: '3px solid',
      borderColor: type === 'dataset' ? blue[200] : orange[200],
      '&:hover': { boxShadow: 5, borderColor: type === 'dataset' ? blue[900] : orange[800] },
      p: 2,
      borderRadius: 2,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      cursor: 'pointer',
    }),
    [],
  );

  const isNextDisabled = useMemo(() => dataset.rows.length === 0 || dataset.columns.length === 0, [dataset.rows.length, dataset.columns.length]);

  return (
    <>
      <Accordion expanded={lockedStep.dataset.openPanel} disabled={lockedStep.dataset.locked}>
        <AccordionSummary>
          <Grid container spacing={1}>
            <Grid item xs={12}>
              <Grid container alignItems="center" justifyContent="space-between" spacing={1}>
                <Grid item xs>
                  <Grid container spacing={1}>
                    <Grid item>
                      {!lockedStep.dataset.locked ? (
                        <Chip label={lockedStep.dataset.step} color="primary" />
                      ) : (
                        <IconButton size="small" aria-label="locked">
                          <LockIcon />
                        </IconButton>
                      )}
                    </Grid>
                    <Grid item>
                      <Typography>{COPY.title}</Typography>
                    </Grid>

                    {/* Error directly under "Dataset" */}
                    {axisError && (
                      <Grid item xs={12} sx={{ mt: 1 }}>
                        <Alert severity="error" variant="outlined" sx={{ pl: 4, pt: 1, pr: 2 }}>
                          {errorType === AXIS.X && COPY.errors.x}
                          {errorType === AXIS.Y && COPY.errors.y}
                          {errorType === AXIS.SERIES && COPY.errors.series}
                        </Alert>
                      </Grid>
                    )}

                    {!lockedStep.dataset.openPanel && (
                      <>
                        <Grid item>
                          <Tooltip title={COPY.actions.editDataset}>
                            <IconButton onClick={handleTogglePanel} aria-label={COPY.aria.edit}>
                              <EditIcon color="primary" />
                            </IconButton>
                          </Tooltip>
                        </Grid>
                        <Grid item>
                          <Tooltip title={!state.showSelections ? COPY.actions.showSummary : COPY.actions.hideSummary}>
                            <IconButton onClick={handleToggleShowSelection} aria-label="toggle summary visibility">
                              {!state.showSelections ? <VisibilityIcon color="primary" /> : <VisibilityOffIcon color="primary" />}
                            </IconButton>
                          </Tooltip>
                        </Grid>
                      </>
                    )}

                    <Grid item>
                      <IconButton size="small" onClick={handleOpenTip} sx={{ ml: 1 }} aria-label={COPY.aria.tipsButton}>
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
                          aria-label={COPY.aria.closeTips}
                        >
                          <CloseIcon fontSize="small" />
                        </IconButton>
                        <Typography sx={{ p: 2, maxWidth: 250 }}>{COPY.tips}</Typography>
                      </Popover>
                    </Grid>
                  </Grid>
                </Grid>

                {lockedStep.dataset.openPanel && (
                  <Grid item>
                    <Tooltip title={COPY.actions.closePanel}>
                      <IconButton onClick={handleTogglePanel} aria-label={COPY.aria.closePanel}>
                        <CloseIcon color="primary" />
                      </IconButton>
                    </Tooltip>
                  </Grid>
                )}
              </Grid>
            </Grid>

            <Grow in={!lockedStep.dataset.locked && !lockedStep.dataset.openPanel && state.showSelections} timeout={{ enter: 500, exit: 0 }} unmountOnExit>
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
            <Paper elevation={0} sx={buttonStyle()} onClick={() => setShowCSVUpload(false)}>
              <Typography variant="h6" align="center">
                {COPY.actions.manualData}
              </Typography>
            </Paper>
          </Grid>
          <Grid item>
            <Paper
              elevation={0}
              sx={buttonStyle('dataset')}
              onClick={() => {
                handleOpenImportDataset();
                setShowCSVUpload(true);
              }}
            >
              <Typography variant="h6" align="center">
                {COPY.actions.uploadCsv}
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
              {/* info banner shown when no table data are present */}
              {isNextDisabled && (
                <Grid item xs={12}>
                  <Alert severity="error" variant="outlined">
                    {COPY.errors.noData}
                  </Alert>
                </Grid>
              )}

              <Grid item xs={12} md={6}>
                <Button
                  fullWidth
                  variant="contained"
                  disabled={isNextDisabled}
                  onClick={
                    lockedStep.dataset.step === '3'
                      ? handleUnlockVisualization
                      : lockedStep.dataset.step === '4'
                      ? handleUnlockFinalize
                      : undefined
                  }
                >
                  {COPY.actions.next}
                </Button>
              </Grid>
            </Grid>
          </Grid>
          <ImportDialog open={state.openCsvImport} toggleOpen={handleOpenImportDataset} setShowCSV={setShowCSVUpload} />
        </AccordionActions>
      </Accordion>
    </>
  );
};

Dataset.displayName = 'Dataset';

export default Dataset;
