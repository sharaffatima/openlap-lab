import React, { useContext, useEffect, useState } from "react";
import {
  Autocomplete,
  Button,
  FormControl,
  FormHelperText,
  Grid,
  IconButton,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { ISCContext } from "../../../indicator-specification-card.jsx";
import { Close as CloseIcon } from "@mui/icons-material";
import { createFilterOptions } from "@mui/material/Autocomplete";
import { v4 as uuidv4 } from "uuid";
import { AuthContext } from "../../../../../../setup/auth-context-manager/auth-context-manager.jsx";
import { requestAllGoals } from "../utils/requirements-api.js";
import { useSnackbar } from "notistack";

const filter = createFilterOptions();

const GoalList = () => {
  const { api } = useContext(AuthContext);
  const { enqueueSnackbar } = useSnackbar();
  const { requirements, setRequirements } = useContext(ISCContext);
  const [state, setState] = useState({
    goalList: [],
    message: "Loading...",
  });
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    const loadGoalList = async (api) => {
      try {
        return await requestAllGoals(api);
      } catch (error) {
        console.log(error);
        enqueueSnackbar(error.message, { variant: "error" });
        setState((prevState) => ({
          ...prevState,
          message: "No goals found",
        }));
        return [];
      }
    };

    loadGoalList(api).then((response) => {
      if (state.goalList.length === 0) {
        setState((prevState) => ({
          ...prevState,
          goalList: response.sort((a, b) => a.verb.localeCompare(b.verb)),
          message: "I want to",
        }));
      }
    });
  }, []);

  const goalExists = state.goalList.some((goal) => goal.verb === inputValue);

  const handleAddCustomGoal = () => {
    console.log("Current inputValue:", inputValue);
    if (inputValue.trim() === "" || goalExists) return;

    console.log("Current inputValue:", inputValue);
    const newGoal = {
      id: uuidv4(),
      verb: inputValue.trim(),
      custom: true,
    };
    const updatedGoals = [...state.goalList, newGoal].sort((a, b) =>
      a.verb.localeCompare(b.verb)
    );
    setState((prevState) => ({
      ...prevState,
      goalList: updatedGoals,
    }));
    setRequirements((prevState) => ({
      ...prevState,
      goalType: newGoal,
    }));
    setInputValue(newGoal.verb); // <-- This is the missing part
  };

  return (
    <FormControl fullWidth>
      <Grid container spacing={1} alignItems="flex-start">
        <Grid item xs>
          <Autocomplete
            value={requirements.goalType || null}
            inputValue={inputValue}
            onInputChange={(event, newInputValue) => {
              setInputValue(newInputValue);
            }}
            selectOnFocus
            disablePortal
            disableClearable
            clearOnBlur
            handleHomeEndKeys
            freeSolo
            options={state.goalList}
            onChange={(event, newValue) => {
              if (newValue === null || newValue === "") {
                setInputValue("");
                setRequirements((prevState) => ({
                  ...prevState,
                  goalType: { verb: "" },
                }));
              } else if (typeof newValue === "string") {
                setInputValue(newValue);
                setRequirements((prevState) => ({
                  ...prevState,
                  goalType: { verb: newValue },
                }));
              } else if (newValue && newValue.inputValue) {
                const newGoal = {
                  id: uuidv4(),
                  verb: newValue.inputValue,
                  custom: true,
                };
                const updatedGoals = [...state.goalList, newGoal].sort((a, b) =>
                  a.verb.localeCompare(b.verb)
                );
                setInputValue(newValue.inputValue);
                setState((prevState) => ({
                  ...prevState,
                  goalList: updatedGoals,
                }));
                setRequirements((prevState) => ({
                  ...prevState,
                  goalType: newGoal,
                }));
            } else {
              setRequirements((prevState) => ({
                ...prevState,
                goalType: newValue,
              }));
            }
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              placeholder={
                state.goalList.length > 0 ? "e.g., monitor" : undefined
              }
              label={state.message}
            />
          )}
          getOptionLabel={(option) => {
            if (typeof option === "string") {
              return option;
            }
            if (option.inputValue) {
              return option.inputValue;
            }
            return option.verb;
          }}
          filterOptions={(options, params) => {
            return filter(options, params);
          }}
          renderOption={(props, option) => {
            const { key, ...restProps } = props;
            return (
              <li key={key} {...restProps}>
                <Grid container alignItems="center">
                  <Grid item xs>
                    <Tooltip
                      arrow
                      title={
                        option.description ? (
                          <Typography variant="body2" sx={{ p: 1 }}>
                            {option.description}
                          </Typography>
                        ) : undefined
                      }
                    >
                      <Typography>{option.verb}</Typography>
                    </Tooltip>
                  </Grid>
                  <Grid item>
                    {option.custom && (
                      <Tooltip title="Remove custom goal">
                        <IconButton
                          size="small"
                          onClick={(event) => {
                            event.stopPropagation();
                            setState((prevState) => ({
                              ...prevState,
                              goalList: prevState.goalList.filter(
                                (goal) => goal.id !== option.id
                              ),
                            }));
                          }}
                        >
                          <CloseIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Grid>
                </Grid>
              </li>
            );
          }}
        />
        {requirements.goalType?.verb === "" && (
          <FormHelperText sx={{ color: "#b71c1c" }}>
            Select a goal or create a new one
          </FormHelperText>
        )}
        </Grid>
        <Grid item>
          { !goalExists && inputValue.trim() && (
            <Button 
              onClick={handleAddCustomGoal}
              variant="contained"
              color="primary"
              sx={{ height: "100%", whiteSpace: "nowrap" }}
            >
              Add
            </Button>
          )}
        </Grid>
      </Grid>
      </FormControl>
  );
};

export default GoalList;
