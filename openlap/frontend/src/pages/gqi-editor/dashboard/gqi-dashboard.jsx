import {
  Button,
  // TODO: import button from material-ui
  Divider, Grid, Typography
} from "@mui/material";



const GQIDashboard = () => {
  
  // const [myState, setMyState] = useState("Hello World");
  
  // const [myString, setMyString] = useState("Hello World");
  // <Button variant="contained">Contained</Button>
  
  const handleButtonClick = () => {
    console.log("Button Clicked")
  };
  
  return (
    <>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Typography>GQI Dashboard</Typography>
        </Grid>
        <Grid item xs={12}>
          <Divider />
        </Grid>
        <Grid item xs={12}>
          <Button variant="contained" onClick={handleButtonClick}>
            Click Me
          </Button>
        </Grid>
        </Grid>
    </>
  );
};
export default GQIDashboard;
