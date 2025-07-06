import React, { createContext, useEffect, useRef, useState } from "react";
import { Divider, Typography } from "@mui/material";
import Grid from "@mui/material/Grid2";
import SpecifyRequirements from "./components/specify-requirements/specify-requirements.jsx";
import ChoosePath from "./components/choose-path/choose-path.jsx";
import Visualization from "./components/visualization/visualization.jsx";
import Dataset from "./components/dataset/dataset.jsx";
import Finalize from "./components/finalize/finalize.jsx";
import { useSnackbar } from "notistack";
import { v4 as uuidv4 } from "uuid";

export const ISCContext = createContext(undefined);

const IndicatorSpecificationCard = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [id, setId] = useState(() => {
    const savedState = sessionStorage.getItem("session_isc");
    return savedState
      ? JSON.parse(savedState).id
        ? JSON.parse(savedState).id
        : null
      : null;
  });

  const [requirements, setRequirements] = useState(() => {
    const savedState = sessionStorage.getItem("session_isc");
    return savedState
      ? JSON.parse(savedState).requirements
      : {
          goalType: {
            verb: "",
          },
          goal: "",
          question: "",
          indicatorName: "",
          data: [
            {
              value: "",
              placeholder: "e.g., name of materials",
              type: {},
            },
            { value: "", placeholder: "e.g., number of downloads", type: {} },
          ],
          selectedPath: "",
          edit: {
            goal: true,
            question: true,
            indicatorName: true,
          },
          show: {
            goal: false,
            question: false,
            indicatorName: false,
          },
        };
  });

  const [dataset, setDataset] = useState(() => {
    const savedState = sessionStorage.getItem("session_isc");
    return savedState
      ? JSON.parse(savedState).dataset
      : {
          file: { name: "" },
          rows: [],
          columns: [],
        };
  });

  const lastUpdateSource = useRef(null);

  // requirements.data -> dataset.columns
  useEffect(() => {
    if (lastUpdateSource.current === "dataset") return;
    lastUpdateSource.current = "requirements";

    const newColumns = requirements.data.map((item, index) => ({
      field: item.id || `field_${index}`,
      headerName: item.value || `Column ${index + 1}`,
      type: item.type?.type || "string",
      editable: true,
      sortable: false,
      width: 200,
    }));

    const numberOfRows = 3;

    const newRows = [];
    for (let i = 0; i < numberOfRows; i++) {
      const row = { id: uuidv4() };
      newColumns.forEach((col) => {
        row[col.field] = col.type === "string" 
          ? `${col.headerName} ${i + 1}`
          : 0;
      });
      newRows.push(row);
    }

    setDataset((prev) => ({
      ...prev,
      columns: newColumns,
      rows: newRows,
    }));
  }, [requirements.data, requirements.numberOfRows]);

  // dataset.columns -> requirements.data TODO needs to be fixed
  useEffect(() => {
    if (lastUpdateSource.current === "requirements") return;
    lastUpdateSource.current = "dataset";

    // Map dataset.columns and dataset.rows into requirements.data
    const newData = dataset.columns.map((col) => {
      // Find a sample value from the first row if exists, fallback ""
      const sampleValue = dataset.rows.length > 0 ? dataset.rows[0][col.field] : "";

      return {
        id: col.field,             // use dataset field id
        value: col.headerName,     // column header name as value
        type: { type: col.type || "string" },
        exampleValue: sampleValue,
        placeholder: `e.g., ${col.headerName.toLowerCase()}`,
      };
    });

    setRequirements((prev) => ({
      ...prev,
      data: newData,
    }));
  }, [dataset.columns, dataset.rows]);


  const [visRef, setVisRef] = useState(() => {
    const savedState = sessionStorage.getItem("session_isc");
    return savedState
      ? JSON.parse(savedState).visRef
      : {
          filter: {
            type: "",
          },
          chart: {
            type: "",
          },
          data: {
            series: [],
            options: {},
            axisOptions: {
              selectedXAxis: "",
              selectedYAxis: "",
              selectedLabel: "",    // * StackedBar/Line
              selectedBarValue: "", // * StackedBar/Line
              selectedCategory: "", // * TreeMap
              selectedXValue: "",   // * TreeMap
              selectedValue: "",    // * TreeMap
              xAxisOptions: [],
              yAxisOptions: [],
              labelOptions: [],     // * StackedBar/Line
              barValueOptions: [],  // * StackedBar/Line
              categoryOptions: [],  // * TreeMap
              xValueOptions: [],    // * TreeMap
              valueOptions: [],     // * TreeMap
            },
          },
          edit: false,
        };
  });

  const [lockedStep, setLockedStep] = useState(() => {
    const savedState = sessionStorage.getItem("session_isc");
    return savedState
      ? JSON.parse(savedState).lockedStep
      : {
          requirements: {
            locked: false,
            openPanel: true,
            step: "1",
          },
          path: { locked: true, openPanel: false, step: "2" },
          visualization: {
            locked: true,
            openPanel: false,
            step: "0",
          },
          dataset: {
            locked: true,
            openPanel: false,
            step: "0",
          },
          finalize: {
            locked: true,
            openPanel: false,
            step: "5",
          },
        };
  });
const [globalShowSummary, setGlobalShowSummary] = useState(true);
  const prevDependencies = useRef({
    requirements,
    dataset,
    visRef,
    lockedStep,
  });

  useEffect(() => {
    const intervalId = setInterval(() => {
      let session_isc = {
        id,
        requirements,
        dataset,
        visRef,
        lockedStep,
      };
      // TODO: Add date to the session
      sessionStorage.setItem("session_isc", JSON.stringify(session_isc));

      // Check if any of the dependencies have changed
      if (
        prevDependencies.current.requirements !== requirements ||
        prevDependencies.current.dataset !== dataset ||
        prevDependencies.current.visRef !== visRef ||
        prevDependencies.current.lockedStep !== lockedStep
      ) {
        enqueueSnackbar("Indicator progress saved", {
          variant: "info",
          autoHideDuration: 2000,
        });
      }

      // Update the previous dependencies to the current ones
      prevDependencies.current = {
        requirements,
        dataset,
        visRef,
        lockedStep,
      };
    }, 10000);

    return () => clearInterval(intervalId);
  }, [requirements, dataset, visRef, lockedStep]);

  return (
    <>
<ISCContext.Provider
  value={{
    id,
    requirements,
    setRequirements,
    lockedStep,
    setLockedStep,
    visRef,
    setVisRef,
    dataset,
    setDataset,
    globalShowSummary,        // Global Hide All Summary
    setGlobalShowSummary,     // Global Hide All Summary
  }}


      >
        <Grid container spacing={2}>
          <Typography>ISC Creator</Typography>

          <Grid size={{ xs: 12 }} sx={{ mb: 2 }}>
            <Divider />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <SpecifyRequirements />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <ChoosePath />
          </Grid>
          {lockedStep.visualization.step === "3" && (
            <Grid size={{ xs: 12 }}>
              <Visualization />
            </Grid>
          )}
          {lockedStep.dataset.step === "4" && (
            <Grid size={{ xs: 12 }}>
              <Dataset />
            </Grid>
          )}
          {lockedStep.dataset.step === "3" && (
            <Grid size={{ xs: 12 }}>
              <Dataset />
            </Grid>
          )}
          {lockedStep.visualization.step === "4" && (
            <Grid size={{ xs: 12 }}>
              <Visualization />
            </Grid>
          )}
          {lockedStep.visualization.step !== "0" &&
            lockedStep.dataset.step !== "0" && (
              <Grid size={{ xs: 12 }}>
                <Finalize />
              </Grid>
            )}
        </Grid>
      </ISCContext.Provider>
    </>
  );
};

export default IndicatorSpecificationCard;
