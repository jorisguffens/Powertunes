import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Center from "../../layout/center/center";
import {Card, CardContent} from "@mui/material";
import Container from "@mui/material/Container";
import {useAuth} from "react-oauth2-pkce";
import {useUser} from "../../util/spotify";
import {useEffect} from "react";
import {useNavigate} from "react-router";

export default function Login() {

    const auth = useAuth();

    const {data: user, isLoading} = useUser();
    const navigate = useNavigate();

    useEffect(() => {
        if ( user ) {
            navigate("/");
        }
    }, [user, navigate]);

    if ( isLoading ) {
        return null;
    }

    return (
        <Center text>
            <Container maxWidth={"xs"}>
                <Card style={{width: "100%"}}>
                    <CardContent>
                        <Typography variant={"h3"} component={"h1"}>
                            Playlist Magic
                        </Typography>
                        <br/>
                        <Typography>
                            This app combines a lot of awesome tools to improve, fix or update your playlists.
                        </Typography>
                        <br/>
                        <Typography>
                            Login with Spotify to experience the magic.
                        </Typography>
                        <br/>
                        <Button variant="contained" onClick={() => auth.authService.login()}
                                style={{borderRadius: "50px"}}>
                            <span style={{fontSize: "21px"}}>
                                <i className="fab fa-spotify"/>
                            </span>
                            &nbsp; Log in with spotify
                        </Button>
                    </CardContent>
                </Card>
            </Container>
        </Center>
    )
}