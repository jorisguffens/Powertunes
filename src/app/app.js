import {QueryClient, QueryClientProvider} from "react-query";
import {AuthProvider, AuthService} from "react-oauth2-pkce";

import {StyledEngineProvider, ThemeProvider} from '@mui/material/styles';
import {CssBaseline} from "@mui/material";

import theme from "./theme";
import Router from "./router";
import {SpotifyProvider} from "../util/spotify";

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: false,
            refetchOnWindowFocus: false,
            staleTime: 1000 * 60 * 5
        }
    }
});

const authService = new AuthService({
    clientId: process.env.REACT_APP_SPOTIFY_CLIENT_ID,
    tokenEndpoint: 'https://accounts.spotify.com/api/token',
    authorizeEndpoint: 'https://accounts.spotify.com/authorize',
    redirectUri: process.env.REACT_APP_APP_URI,
    scopes: [
        'user-library-modify',
        'user-library-read',
        'playlist-modify-private',
        'playlist-modify-public',
        'playlist-read-private'
    ]
});

export default function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <AuthProvider authService={authService}>
                <SpotifyProvider>
                    <StyledEngineProvider injectFirst>
                        <ThemeProvider theme={theme}>
                            <CssBaseline/>
                            <Router/>
                        </ThemeProvider>
                    </StyledEngineProvider>
                </SpotifyProvider>
            </AuthProvider>
        </QueryClientProvider>
    );
}
