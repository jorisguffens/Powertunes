import {BrowserRouter} from "react-router-dom";
import {QueryClient, QueryClientProvider} from "react-query";

import {StyledEngineProvider, ThemeProvider} from '@mui/material/styles';
import {CssBaseline} from "@mui/material";

import theme from "./theme";
import Router from "./router";

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: false,
            refetchOnWindowFocus: false,
            staleTime: 1000 * 60 * 5
        }
    }
});

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
