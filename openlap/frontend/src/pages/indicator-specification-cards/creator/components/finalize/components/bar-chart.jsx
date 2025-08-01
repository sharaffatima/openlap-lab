import React, { useContext, useEffect, useRef, useState } from "react";
import { CustomThemeContext } from "../../../../../../setup/theme-manager/theme-context-manager.jsx";
import Chart from "react-apexcharts";
import {
  Button,
  FormControl,
  Grow,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Tooltip,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import PaletteIcon from "@mui/icons-material/Palette";
import CloseIcon from "@mui/icons-material/Close";
import CustomizationPanel from "./customization-panel/customization-panel.jsx";
import { ISCContext } from "../../../indicator-specification-card.jsx";

const BarChart = ({ customize = false, handleToggleCustomizePanel }) => {
  const { darkMode } = useContext(CustomThemeContext);
  const { visRef, setVisRef, dataset } = useContext(ISCContext);
  const chartRef = useRef(null);

  const [state, setState] = useState({
    series: [],
    configuration: {
      isShowHideLegendAvailable: true,
      isLegendPositionChangeable: true,
      isLegendPositionBottomAvailable: true,
      isLegendPositionTopAvailable: true,
      isLegendPositionLeftAvailable: true,
      isLegendPositionRightAvailable: true,
      isShowHideAxesAvailable: true,
      isShowHideXAxisAvailable: true,
      isShowHideYAxisAvailable: true,
      isChartTitleAvailable: true,
      isChartSubtitleAvailable: true,
      isTitleAndSubtitlePositionChangeable: true,
      isTitleAndSubtitlePositionCenterAvailable: true,
      isTitleAndSubtitlePositionLeftAvailable: true,
      isTitleAndSubtitlePositionRightAvailable: true,
      isShowHideLabelsAvailable: true,
      isShowHideLabelsBackgroundAvailable: true,
      isLabelsPositionChangeable: true,
      isLabelsPositionTopAvailable: true,
      isLabelsPositionCenterAvailable: true,
      isSeriesColorChangeable: true,
      isSeriesSingleColor: true,
      isSeriesMultipleColor: false,
      isSortingOrderChangeable: true,
      isLegendTextColorAvailable: true,
      isDataLabelsColorAvailable: true,
      isDataLabelsWithBackgroundColorAvailable: true,
      isShowHideXAxisTitleAvailable: true,
      isShowHideYAxisTitleAvailable: true,
      isShowHideAxesTitleAvailable: true,
      isSortingOrderAscendingAvailable: true,
      isSortingOrderDescendingAvailable: true,
      isCategoriesFilteringAvailable: true,
    },
    options: visRef.edit
      ? visRef.data.options
      : {
          chart: {
            id: visRef.chart.code,
            type: "bar",
            stacked: false,
            width: "100%",
            foreColor: darkMode ? "#ffffff" : "#000000",
            toolbar: {
              show: false,
              autoSelected: "zoom",
            },
            zoom: {
              enabled: true,
            },
          },
          title: {
            text: "",
            align: "left",
            style: {
              fontSize: 18,
              cssClass: "x-y-axis-hide-title",
            },
          },
          subtitle: {
            text: "",
            align: "left",
            margin: 15,
          },
          plotOptions: {
            bar: {
              borderRadius: 4,
              horizontal: false,
              grouped: false,
              dataLabels: {
                position: "center",
              },
            },
          },
          dataLabels: {
            enabled: true,
            style: {
              colors: ["#000000"],
              fontWeight: 400,
            },
            background: {
              enabled: false,
              foreColor: "#ffffff",
              padding: 10,
              borderRadius: 2,
              borderWidth: 1,
              borderColor: "#ffffff",
            },
          },
          xaxis: {
            name: "",
            title: {
              text: "",
              style: {
                cssClass: "x-y-axis-show-title",
              },
            },
            categories: [],
            labels: {
              show: true,
            },
          },
          yaxis: {
            title: {
              text: "",
              style: {
                cssClass: "x-y-axis-show-title",
              },
            },
            labels: {
              show: true,
            },
          },
          legend: {
            show: true,
            showForSingleSeries: true,
            position: "bottom",
            horizontalAlign: "center",
            labels: {
              colors: undefined,
              useSeriesColors: false,
            },
            onItemClick: {
              toggleDataSeries: false,
            },
          },
          tooltip: {
            enabled: true,
            followCursor: true,
            theme: darkMode ? "dark" : "light",
            onDatasetHover: {
              highlightDataSeries: true,
            },
          },
        },
    axisOptions: {
      xAxisOptions: [],
      yAxisOptions: [],
      selectedXAxis: "",
      selectedYAxis: "",
    },
  });

  // * This effect is used to update the chart when the dark mode changes.
  useEffect(() => {
    setState((prevState) => ({
      ...prevState,
      options: {
        ...prevState.options,
        chart: {
          ...prevState.options.chart,
          foreColor: darkMode ? "#ffffff" : "#000000",
        },
        tooltip: {
          ...prevState.options.tooltip,
          theme: darkMode ? "dark" : "light",
        },
      },
    }));
  }, [darkMode]);

  // * This effect is used to update the chart when the dataset column changes.
  useEffect(() => {
    const stringColumns = dataset.columns.filter(
      (col) => col.type === "string"
    );
    const numberColumns = dataset.columns.filter(
      (col) => col.type === "number"
    );
    setState((prevState) => ({
      ...prevState,
      axisOptions: {
        ...prevState.axisOptions,
        xAxisOptions: stringColumns,
        yAxisOptions: numberColumns,
      },
    }));
    setVisRef((prevVisRef) => ({
      ...prevVisRef,
      data: {
        ...prevVisRef.data,
        axisOptions: {
          ...prevVisRef.data.axisOptions,
          xAxisOptions: stringColumns,
          yAxisOptions: numberColumns,
        },
      },
      edit: false,
    }));
  }, [dataset.columns]);

  // * This effect is used to update the chart when the selected X-axis or Y-axis changes.
  useEffect(() => {
    const selectedXAxis =
      visRef.data.axisOptions.selectedXAxis || state.axisOptions.selectedXAxis;
    const selectedYAxis =
      visRef.data.axisOptions.selectedYAxis || state.axisOptions.selectedYAxis;
    const stringColumns =
      visRef.data.axisOptions.xAxisOptions || state.axisOptions.xAxisOptions;
    const numberColumns =
      visRef.data.axisOptions.yAxisOptions || state.axisOptions.yAxisOptions;

    let updatedSelectedXAxis = "";
    if (visRef.edit && selectedXAxis.length !== 0)
      updatedSelectedXAxis = selectedXAxis;
    else if (selectedXAxis.length !== 0) {
      updatedSelectedXAxis =
        stringColumns.find((col) => col.field === selectedXAxis)?.field ||
        (stringColumns.length > 0 ? stringColumns[0].field : "");
    } else {
      updatedSelectedXAxis =
        stringColumns.length > 0 ? stringColumns[0].field : "";
    }

    let updatedSelectedYAxis = "";
    if (visRef.edit && selectedYAxis.length !== 0)
      updatedSelectedYAxis = selectedYAxis;
    else if (selectedYAxis.length !== 0) {
      updatedSelectedYAxis =
        numberColumns.find((col) => col.field === selectedYAxis)?.field ||
        (numberColumns.length > 0 ? numberColumns[0].field : "");
    } else {
      updatedSelectedYAxis =
        numberColumns.length > 0 ? numberColumns[0].field : "";
    }

    setState((prevState) => ({
      ...prevState,
      axisOptions: {
        ...prevState.axisOptions,
        selectedXAxis: updatedSelectedXAxis,
        selectedYAxis: updatedSelectedYAxis,
      },
    }));
  }, [
    visRef.data.axisOptions.xAxisOptions,
    visRef.data.axisOptions.yAxisOptions,
  ]);

  // * This effect is used to log when a column has a data type and which column is preselected.
  useEffect(() => {
    const { selectedXAxis, selectedYAxis } = state.axisOptions;

    if (!selectedXAxis && !selectedYAxis) return; 

    const xAxisColumn = dataset.columns.find(
      (col) => col.field === selectedXAxis
    );
    const yAxisColumn = dataset.columns.find(
      (col) => col.field === selectedYAxis
    );
    /*
    if (selectedXAxis) {
      if (xAxisColumn) {
        console.log(`Visual assigned X-Axis: ${xAxisColumn.headerName} ${xAxisColumn.type}`);
      } else {
        console.log("X-Axis column not found");
      }
    }

    if (selectedYAxis) {
      if (yAxisColumn) {
        console.log(`Visual assigned Y-Axis: ${yAxisColumn.headerName} ${yAxisColumn.type}`);
      } else {
        console.log("Y-Axis column not found");
      }
    }
      */
    if (!xAxisColumn || !yAxisColumn) return;

    // * Grouping data by unique X-axis values
    const groupedData = dataset.rows.reduce((acc, row) => {
      const xValue = row[selectedXAxis] || "Unknown";
      acc[xValue] = (acc[xValue] || 0) + (row[selectedYAxis] || 0);
      return acc;
    }, {});

    // * Preparing categories and series for the chart
    const categories = Object.keys(groupedData);
    const series = [
      {
        name: yAxisColumn.headerName || "Default Series",
        data: categories.map((category) => groupedData[category]),
        color: customize
          ? state.series[0].color
          : visRef.data.series[0]?.color || "#008FFB",
      },
    ];

    setState((prevState) => {
      let tempState = {
        ...prevState,
        series: series,
        options: {
          ...prevState.options,
          xaxis: {
            ...prevState.options.xaxis,
            categories: categories,
            name: xAxisColumn.headerName,
            title: {
              ...prevState.options.xaxis.title,
              text: xAxisColumn.headerName,
            },
          },
          yaxis: {
            ...prevState.options.yaxis,
            categories: categories,
            title: {
              ...prevState.options.yaxis.title,
              text: yAxisColumn.headerName,
            },
          },
        },
      };

      setVisRef((prevVisRef) => ({
        ...prevVisRef,
        data: {
          ...prevVisRef.data,
          series: tempState.series,
          options: tempState.options,
          axisOptions: {
            ...prevVisRef.data.axisOptions,
            selectedXAxis: state.axisOptions.selectedXAxis,
            selectedYAxis: state.axisOptions.selectedYAxis,
          },
        },
        edit: false,
      }));
      return tempState;
    });
  }, [
    dataset,
    state.axisOptions.selectedXAxis,
    state.axisOptions.selectedYAxis,
  ]);

  const handleXAxisChange = (event) => {
    setState((prevState) => ({
      ...prevState,
      axisOptions: {
        ...prevState.axisOptions,
        selectedXAxis: event.target.value,
      },
      options: {
        ...prevState.options,
        xaxis: {
          ...prevState.options.xaxis,
          title: {
            ...prevState.options.xaxis.title,
            text: prevState.axisOptions.selectedXAxis,
          },
        },
      },
    }));
  };

  const handleYAxisChange = (event) => {
    setState((prevState) => ({
      ...prevState,
      axisOptions: {
        ...prevState.axisOptions,
        selectedYAxis: event.target.value,
      },
      options: {
        ...prevState.options,
        yaxis: {
          ...prevState.options.yaxis,
          title: {
            ...prevState.options.yaxis.title,
            text: prevState.options.yaxis.selectedYAxis,
          },
        },
      },
    }));
  };

  return (
    <>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <FormControl fullWidth>
            <InputLabel id="x-axis-select-label">X-Axis</InputLabel>
            <Select
              labelId="x-axis-select-label"
              id="x-axis-select"
              value={state.axisOptions.selectedXAxis}
              onChange={handleXAxisChange}
              label="X-Axis"
              variant="outlined"
            >
              {state.axisOptions.xAxisOptions.map((col) => (
                <MenuItem key={col.field} value={col.field}>
                  {col.headerName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <FormControl fullWidth>
            <InputLabel id="y-axis-select-label">Y-Axis</InputLabel>
            <Select
              labelId="y-axis-select-label"
              id="y-axis-select"
              value={state.axisOptions.selectedYAxis}
              onChange={handleYAxisChange}
              label="Y-Axis"
              variant="outlined"
            >
              {state.axisOptions.yAxisOptions.map((col) => (
                <MenuItem key={col.field} value={col.field}>
                  {col.headerName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        {!customize && (
          <Grid size={{ xs: 12 }}>
            <Grid container spacing={2} justifyContent="flex-end">
              <Button
                startIcon={<PaletteIcon />}
                variant="contained"
                onClick={handleToggleCustomizePanel}
              >
                Customize
              </Button>
            </Grid>
          </Grid>
        )}

        <Grow in={!customize} timeout={{ enter: 500, exit: 0 }} unmountOnExit>
          <Grid size={{ xs: 12 }} sx={{ minHeight: 600 }}>
            <Chart
              ref={chartRef}
              options={state.options}
              series={state.series}
              type={visRef.chart.code}
              height="100%"
            />
          </Grid>
        </Grow>

        <Grow in={customize} timeout={{ enter: 500, exit: 0 }} unmountOnExit>
          <Grid size={{ xs: 12, md: 8 }} sx={{ minHeight: 600 }}>
            <Chart
              ref={chartRef}
              options={state.options}
              series={state.series}
              type={visRef.chart.code}
              height="100%"
            />
          </Grid>
        </Grow>
        <Grow in={customize} timeout={{ enter: 500, exit: 0 }} unmountOnExit>
          <Grid size={{ xs: 12, md: 4 }} sx={{ minHeight: 600 }}>
            <Grid
              container
              spacing={2}
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography>Customization panel</Typography>
              <Tooltip title="Close">
                <IconButton onClick={handleToggleCustomizePanel}>
                  <CloseIcon color="primary" />
                </IconButton>
              </Tooltip>
            </Grid>
            <CustomizationPanel state={state} setState={setState} />
          </Grid>
        </Grow>
      </Grid>
    </>
  );
};

export default BarChart;
