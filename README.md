docker build -t minerapp/registration-service .
docker run -t -e REGURL=10.0.3.65 -e TICK=1000 --volume=/var/run/docker.sock:/var/run/docker.sock --net=host minerapp/registration-service /bin/sh -c ./run.sh

need to code healthchecks as an "i am ready you can register me now" ability
need to add persistance layer to registrations - maybe onload, get all thalassa registrations, if registration has containerId then add to registrations map, reap if necessary
however this may not be needed since thalassa has its own health reaper. We would essentially be doing the same job twice. And its only for if the registration-service crashes, in which case we assume any state that changed can be handled by thalassa. BUT, we lose the ability after crashes for quick removal of service endpoints. we probably also want to lower thalassas reap time.

Consul will be its own beast, but for now this is good
