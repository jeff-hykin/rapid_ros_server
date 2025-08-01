```sh
deno install -n rosbagSummary -Afrg --reload https://raw.githubusercontent.com/jeff-hykin/rapid_ros_server/dev/rosbagSummary.js
deno install -n rosbagAsBackend -Afrg --reload https://raw.githubusercontent.com/jeff-hykin/rapid_ros_server/dev/rosbagAsBackend.js
```

<!-- ./rosbagAsBackend.js --bag-file '/Users/jeffhykin/repos/rapid_ros_server/data.ignore/spot_sample_bag_all_data.bag' --playback-speed 10 --fast-forward-function '({message})=>message.sitting' --log-function '({ topic, message, timestamp })=>[new Date(timestamp), !topic.startsWith("/spot/odometry")?null:message?.pose?.pose?.position?.x]' -->