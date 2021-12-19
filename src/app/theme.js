import {createTheme} from "@mui/material";

export default createTheme({
    palette: {
        mode: "dark",
        primary: {
            main: "#1DB954",
            contrastText: "#fff"
        },
        background: {
            default: "#191414",
            paper: "#191414"
        }
    },
    // components: {
    //     MuiTypography: {
    //         styleOverrides: {
    //             h1: {
    //                 fontSize: "3rem",
    //                 fontWeight: "400",
    //             },
    //             h2: {
    //                 fontSize: "2.6rem",
    //                 fontWeight: "400",
    //             },
    //             h3: {
    //                 fontSize: "2.2rem",
    //                 fontWeight: "400",
    //             },
    //             h4: {
    //                 fontSize: "1.8rem",
    //                 fontWeight: "400",
    //             },
    //             h5: {
    //                 fontSize: "1.4rem",
    //                 fontWeight: "400",
    //             }
    //         }
    //     }
    // }
});