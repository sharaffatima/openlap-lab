import React, { useContext, useRef, useState } from "react";
import {
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
} from "@mui/material";
import { Delete as DeleteIcon } from "@mui/icons-material";
import { ISCContext } from "../../../../indicator-specification-card.jsx";

const TableMenu = ({ state, setState }) => {
  const { setDataset, setRequirements } = useContext(ISCContext);

  // ───────────── countdown helpers ─────────────
  const [countdown, setCountdown] = useState(5);
  const timerRef = useRef(null);

  const resetTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    setCountdown(5);
  };

  // ───────────── menu + dialog helpers ─────────
  const closeMenu = () =>
    setState((prev) => ({ ...prev, anchorEl: null }));

  const openDialog = () => {
    closeMenu();
    setState((prev) => ({ ...prev, deleteDialog: true }));
  };

  const closeDialog = () => {
    resetTimer();
    setState((prev) => ({ ...prev, deleteDialog: false }));
  };

  // ───────────── actual deletion ───────────────
  const performDeletion = () => {
    // wipe the dataset
    setDataset((prev) => ({
      ...prev,
      rows: [],
      columns: [],
      file: { name: "" },
    }));

    // remove all column‑requirements (no blank placeholders)
    setRequirements((prev) => ({
      ...prev,
      data: [],
    }));
  };

  // ───────────── start the 5‑second grace period
  const startDeleteCountdown = () => {
    if (timerRef.current) return; // already running
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          performDeletion();
          closeDialog();
          return 5;
        }
        return prev - 1;
      });
    }, 1000);
  };

  return (
    <>
      {/* menu */}
      <Menu
        anchorEl={state.anchorEl}
        open={Boolean(state.anchorEl)}
        onClose={closeMenu}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <MenuItem onClick={openDialog}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Delete dataset</ListItemText>
        </MenuItem>
      </Menu>

      {/* confirmation dialog */}
      <Dialog
        open={state.deleteDialog}
        onClose={closeDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Are you sure you want to delete this dataset?</DialogTitle>
        <DialogContent dividers>
          <Typography gutterBottom>
            Deleting this dataset will permanently remove all associated data
            and cannot be undone. Please consider the following before
            proceeding:
          </Typography>
          <Typography component="div" gutterBottom>
            <li>All data contained within this dataset will be lost.</li>
            <li>Any analyses or reports dependent on this dataset may be affected.</li>
            <li>There is no way to recover this dataset once it is deleted.</li>
          </Typography>
          {timerRef.current && (
            <Typography color="error" sx={{ mt: 2 }}>
              Deleting in&nbsp;{countdown}&nbsp;s… click Cancel to abort.
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button fullWidth onClick={closeDialog}>
            Cancel
          </Button>
          <Button
            fullWidth
            variant="contained"
            color="error"
            onClick={startDeleteCountdown}
            disabled={Boolean(timerRef.current)}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default TableMenu;
