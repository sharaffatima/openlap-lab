import React from "react";
import { Grid, Typography } from "@mui/material";

const NoRowsOverlay = () => {
  return (
    <>
      <Grid
        container
        justifyContent="center"
        alignItems="center"
        sx={{ height: "100%" }}
      >
        <Grid item>
          <Typography align="center">No dataset available.</Typography>
        </Grid>
      </Grid>
    </>
  );
};

export default NoRowsOverlay;
