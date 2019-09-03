import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import React, {useState} from "react";
import Typography from "@material-ui/core/Typography";
import DialogActions from "@material-ui/core/DialogActions";
import Button from "@material-ui/core/Button";
import DialogContent from "@material-ui/core/DialogContent";
import TextField from "@material-ui/core/TextField";

const defaultLogAndFilesVolumeSize = 1024;
const defaultDatabaseVolumeSize = 1024;

export default ({onCreate, onClose}) => {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [logAndFilesVolumeSize, setLogAndFilesVolumeSize] = useState(defaultLogAndFilesVolumeSize);
    const [databaseVolumeSize, setDatabaseVolumeSize] = useState(defaultDatabaseVolumeSize);

    return (<Dialog
        open
        onClose={onClose}
        aria-labelledby="form-dialog-title"
        fullWidth
        maxWidth="md"
    >
        <DialogTitle disableTypography id="form-dialog-title">
            <Typography variant="h5">Add a new Workspace</Typography>
            <Typography variant="subtitle1">Specify parameters for the new Workspace</Typography>
        </DialogTitle>
        <DialogContent style={{overflowX: 'hidden'}}>
            <TextField
                autoFocus
                margin="dense"
                id="name"
                label="Name"
                value={name}
                name="name"
                onChange={(event) => setName(event.target.value)}
                fullWidth
                required
            />
            <TextField
                margin="dense"
                id="description"
                label="Description"
                value={description}
                name="description"
                onChange={(event) => setDescription(event.target.value)}
                fullWidth
            />
            <TextField
                margin="dense"
                id="logAndFilesVolumeSize"
                label="Log and files volume size, Gb"
                value={logAndFilesVolumeSize}
                name="logAndFilesVolumeSize"
                type="number"
                onChange={(event) => setLogAndFilesVolumeSize(event.target.value)}
                fullWidth
                required
            />
            <TextField
                margin="dense"
                id="databaseVolumeSize"
                label="Log and files volume size, Gb"
                value={databaseVolumeSize}
                name="databaseVolumeSize"
                type="number"
                onChange={(event) => setDatabaseVolumeSize(event.target.value)}
                fullWidth
                required
            />
        </DialogContent>
        <DialogActions>
            <Button
                onClick={onClose}
                color="secondary"
            >
                Cancel
            </Button>
            <Button
                onClick={() => onCreate({name, description, logAndFilesVolumeSize, databaseVolumeSize})}
                color="primary"
                variant="contained"
            >
                Create
            </Button>
        </DialogActions>
    </Dialog>)
};
