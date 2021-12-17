import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import {useLogin} from "../../hooks/oauth2";
import Center from "../../layout/center/center";
import {Card, CardContent} from "@mui/material";
import Container from "@mui/material/Container";

export default function Login() {

    const login = useLogin();

    return (
        <Center text>
            <Container maxWidth={"xs"}>
                <Card style={{width: "100%"}}>
                    <CardContent>
                        <Typography variant={"h2"} component={"h3"}>Login</Typography>
                        <br/>
                        <Typography color={"secondary"}>
                            Login with your spotify account to continue.
                        </Typography>
                        <br/>
                        <Button variant="contained" onClick={login} style={{borderRadius: "50px"}}>
                            <i className="fab fa-spotify"/>&nbsp; Log in
                        </Button>
                    </CardContent>
                </Card>
            </Container>
        </Center>
    )
}