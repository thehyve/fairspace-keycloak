import React from 'react';
import {withRouter} from "react-router-dom";
import {AppBar, Toolbar, Typography, withStyles} from "@material-ui/core";

import UserMenu from "../UserMenu/UserMenu";

const styles = theme => ({
    root: {
        zIndex: theme.zIndex.drawer + 1
    },
    title: {
        flexGrow: 1
    }
});

const TopBar = ({classes, name, location, history}) => (
    <AppBar className={classes.root} position="sticky">
        <Toolbar>
            <Typography variant="h6" color="inherit" noWrap className={classes.title}>
                {name}
            </Typography>
            <UserMenu/>
        </Toolbar>
    </AppBar>
);

export default withRouter(withStyles(styles)(TopBar));