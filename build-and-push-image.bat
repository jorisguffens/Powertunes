setlocal
setlocal EnableDelayedExpansion

SET BUILDARGS = ""
FOR /F "tokens=*" %%i in (.env.production) do SET BUILDARGS=!BUILDARGS! --build-arg %%i

docker build %BUILDARGS% -t registry.jorisg.be/jorisguffens/spotify-playlist-tool .
docker push registry.jorisg.be/jorisguffens/spotify-playlist-tool

endlocal

PAUSE