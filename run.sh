npm install .
C_ID=$(cat /proc/self/cgroup | grep "cpu:/" | sed 's/\([0-9]\):cpu:\/docker\///g')
H_IP=$(/sbin/ip route|awk '/default/ { print $3 }')
export CONTAINER_ID=$C_ID
export HOST_IP=$H_IP
node index.js
