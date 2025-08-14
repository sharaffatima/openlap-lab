import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Divider,
  Grid,
  Grow,
  Paper,
  Tooltip,
  Typography,
} from '@mui/material';
import Alert from '@mui/material/Alert';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Recommend } from '@mui/icons-material';

import { DataTypes, visualizations } from '../../../utils/data/config.js';
import { ISCContext } from '../../../indicator-specification-card.jsx';
import VisualizationDescription from './visualization-description.jsx';

// =============================
// Constants (avoid magic strings)
// =============================
const TYPE_MAP = {
  string: 'Categorical',
  number: 'Numerical',
};

const COPY = {
  headings: {
    availableCharts: 'Available charts',
    recommendationsNote: 'Recommendations are based on your dataset',
  },
  actions: {
    showDescription: 'Show description',
  },
  aria: {
    toggleDescription: 'toggle description',
    chartCard: 'select chart',
  },
};

const VisualizationFilter = () => {
  const { dataset, visRef, setVisRef } = useContext(ISCContext);

  const [state, setState] = useState({
    openFilters: false,
    visualizationList: [],
    recommendation: false,
    showDescription: false,
  });

  const [columnError, setColumnError] = useState({ hasError: false, errorMessages: [] });

  // Pre-derive common values
  const columnTypes = useMemo(() => dataset.columns.map((col) => col.type), [dataset.columns]);

  // Validate dataset vs required chart datatypes
  useEffect(() => {
    if (!visRef.chart || !visRef.chart.dataTypes || !dataset.columns) return;

    const requiredTypes = visRef.chart.dataTypes.reduce((acc, dt) => {
      if (dt.required > 0) acc[dt.type.value] = dt.required;
      return acc;
    }, {});

    const availableTypes = dataset.columns.reduce((acc, col) => {
      const mappedType = TYPE_MAP[col.type];
      if (mappedType) acc[mappedType] = (acc[mappedType] || 0) + 1;
      return acc;
    }, {});

    const messages = Object.entries(requiredTypes).reduce((arr, [type, requiredCount]) => {
      const availableCount = availableTypes[type] || 0;
      if (availableCount < requiredCount) {
        arr.push(`Missing required ${type} column(s): needed ${requiredCount}, found ${availableCount}`);
      }
      return arr;
    }, []);

    if (messages.length > 0) setColumnError({ hasError: true, errorMessages: messages });
    else setColumnError({ hasError: false, errorMessages: [] });
  }, [visRef.chart, dataset.columns]);

  const handleSelectVisualization = useCallback(
    (chart) => {
      localStorage.removeItem('categories');
      localStorage.removeItem('series');

      if (visRef.chart.type !== chart.type) {
        setVisRef((prevState) => ({ ...prevState, chart }));
      } else {
        setVisRef((prevState) => ({ ...prevState, chart: { type: '' } }));
      }
    },
    [setVisRef, visRef.chart.type],
  );

  // Build visualization list based on filter
  useEffect(() => {
    if (visRef.filter.type === '') {
      setState((prevState) => ({ ...prevState, visualizationList: visualizations }));
    } else {
      const tempVisualizationList = visualizations.filter((v) => v.filters.includes(visRef.filter.type));
      setState((prevState) => ({ ...prevState, visualizationList: tempVisualizationList }));
    }
  }, [visRef.filter.type]);

  // Check if any chart is recommended for current dataset
  const checkVisualizationRecommendation = useCallback((visualization, colTypes) => {
    let requiredCategorical = 0;
    let requiredNumerical = 0;
    let requiredCatOrdered = 0;

    visualization.dataTypes.forEach((dataType) => {
      if (dataType.type === DataTypes.categorical) requiredCategorical += dataType.required;
      else if (dataType.type === DataTypes.numerical) requiredNumerical += dataType.required;
      else if (dataType.type === DataTypes.catOrdered) requiredCatOrdered += dataType.required;
    });

    const availableStrings = colTypes.filter((type) => type === 'string').length;
    const availableNumbers = colTypes.filter((type) => type === 'number').length;

    const hasRequiredStrings = availableStrings >= requiredCategorical + requiredCatOrdered;
    const hasRequiredNumbers = availableNumbers >= requiredNumerical;

    return hasRequiredStrings && hasRequiredNumbers;
  }, []);

  const hasAnyRecommendation = useMemo(() => {
    return state.visualizationList.some((viz) => checkVisualizationRecommendation(viz, columnTypes));
  }, [state.visualizationList, columnTypes, checkVisualizationRecommendation]);

  useEffect(() => {
    setState((prevState) => ({ ...prevState, recommendation: hasAnyRecommendation }));
  }, [hasAnyRecommendation]);

  const handleToggleShowDescription = useCallback(() => {
    setState((prevState) => ({ ...prevState, showDescription: !prevState.showDescription }));
  }, []);

  // Sorted list is a pure view concern
  const sortedVisualizationList = useMemo(() => {
    return [...state.visualizationList].sort((a, b) => a.type.localeCompare(b.type));
  }, [state.visualizationList]);

  return (
    <>
      <Accordion variant="outlined" defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>
            <b>{COPY.headings.availableCharts}</b>
          </Typography>
        </AccordionSummary>

        <AccordionDetails>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              {/* Show column validation errors */}
              {columnError.hasError && (
                <Grid item xs={12}>
                  <Alert severity="error" variant="outlined">
                    {columnError.errorMessages.map((msg, i) => (
                      <Typography key={i} sx={{ mb: 0.5 }}>
                        {msg}
                      </Typography>
                    ))}
                  </Alert>
                </Grid>
              )}

              <Grid container spacing={2} justifyContent="center">
                {visRef.filter.type && (
                  <Grid item xs={12}>
                    <Typography align="center" variant="body2">
                      Chart(s) recommended based on chart type: <b>{visRef.filter.type}</b>
                    </Typography>
                  </Grid>
                )}

                {sortedVisualizationList.map((visualization, index) => {
                  if (!visualization.enable) return null;
                  return (
                    <Grid
                      key={index}
                      item
                      xs={6}
                      sm={4}
                      md={2}
                      sx={{ cursor: 'pointer' }}
                      onClick={() => handleSelectVisualization(visualization)}
                    >
                      <Grid container spacing={2}>
                        <Grid item xs>
                          <Grid container spacing={2}>
                            <Grid item xs={12}>
                              <Tooltip
                                arrow
                                title={
                                  <Typography variant="body2" sx={{ p: 1, whiteSpace: 'pre-line' }}>
                                    {visualization.description}
                                  </Typography>
                                }
                              >
                                <Paper
                                  role="button"
                                  aria-label={COPY.aria.chartCard}
                                  variant="outlined"
                                  sx={{
                                    pb: 1,
                                    pt: 2,
                                    '&:hover': { boxShadow: 5 },
                                    border: visRef.chart.type === visualization.type ? '2px solid #F57C00' : '',
                                  }}
                                >
                                  <Grid container direction="column" alignItems="center">
                                    <Grid item>
                                      <Box component="img" src={visualization.image} height="48px" alt={`${visualization.type} chart`} />
                                    </Grid>
                                    <Grid item xs={12}>
                                      <Grid container alignItems="center">
                                        {checkVisualizationRecommendation(visualization, columnTypes) && (
                                          <Grid item>
                                            <Recommend color="success" />
                                          </Grid>
                                        )}
                                        <Grid item xs>
                                          <Typography variant="body2" gutterBottom>
                                            {visualization.type}
                                          </Typography>
                                        </Grid>
                                      </Grid>
                                    </Grid>
                                  </Grid>
                                </Paper>
                              </Tooltip>
                            </Grid>
                          </Grid>
                        </Grid>
                      </Grid>
                    </Grid>
                  );
                })}

                {state.recommendation && (
                  <Grid item xs={12}>
                    <Grid container spacing={1} alignItems="center" justifyContent="center">
                      <Grid item>
                        <Recommend color="success" />
                      </Grid>
                      <Grid item>
                        <Typography gutterBottom variant="body2">
                          {COPY.headings.recommendationsNote}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Grid>
                )}
              </Grid>
            </Grid>

            <Grid item xs={12}>
              {Boolean(visRef.chart.type) && (
                <>
                  {!state.showDescription && (
                    <Grid container justifyContent="flex-end">
                      <Button variant="contained" onClick={handleToggleShowDescription} aria-label={COPY.aria.toggleDescription}>
                        {COPY.actions.showDescription}
                      </Button>
                    </Grid>
                  )}
                  <Grow in={state.showDescription} timeout={{ enter: 500, exit: 0 }} unmountOnExit>
                    <div>
                      <Grid item xs={12}>
                        <Divider />
                      </Grid>
                      <Grid item xs={12}>
                        <VisualizationDescription toggleDescription={handleToggleShowDescription} />
                      </Grid>
                    </div>
                  </Grow>
                </>
              )}
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>
    </>
  );
};

VisualizationFilter.displayName = 'VisualizationFilter';

export default VisualizationFilter;
