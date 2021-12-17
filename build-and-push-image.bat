setlocal

docker build -t registry.jorisg.be/jorisguffens/spotify-playlist-tool .
docker push registry.jorisg.be/jorisguffens/spotify-playlist-tool

endlocal

PAUSE