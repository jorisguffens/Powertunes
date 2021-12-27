import {createTheme} from "@mui/material";

export default createTheme({
    palette: {
        mode: "dark",
        primary: {
            main: "#00d0be",
            // contrastText: "#fff"
        },
        background: {
            default: "#191414",
            paper: "#191414"
        }
    },
    components: {
        MuiTypography: {
            styleOverrides: {
                h1: {
                    fontSize: "2.6rem",
                },
                h2: {
                    fontSize: "2.2rem",
                },
                h3: {
                    fontSize: "2rem",
                },
                h4: {
                    fontSize: "1.8rem",
                },
                h5: {
                    fontSize: "1.4rem",
                }
            }
        }
    }
});