import {BrowserRouter} from "react-router-dom";
import {QueryClientProvider} from "react-query";

import {StyledEngineProvider, ThemeProvider} from '@mui/material/styles';
import {CssBaseline} from "@mui/material";

import {queryClient} from "../hooks/spotify";

import theme from "./theme";
import Router from "./router";

export default function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                <StyledEngineProvider injectFirst>
                    <ThemeProvider theme={theme}>
                        <CssBaseline/>
                        <Router/>
                    </ThemeProvider>
                </StyledEngineProvider>
            </BrowserRouter>
        </QueryClientProvider>
    );
}
