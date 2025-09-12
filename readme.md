# What is this?

A quick way to analyze rosbag files, without having to install ros. It can run a Ros.js frontend as if ros was installed, by having the backend serve the rosbag file over a websocket.


# How do I use it?

### Install

First install Deno, then:

```sh
deno install -n rosbagSummary -Afrg --reload https://raw.githubusercontent.com/jeff-hykin/rapid_ros_server/dev/rosbagSummary.js
deno install -n rosbagAsBackend -Afrg --reload https://raw.githubusercontent.com/jeff-hykin/rapid_ros_server/dev/rosbagAsBackend.js
```

### Usage

To get a summary of a rosbag file:

```sh
rosbagSummary --bag-file 'your_file.bag' --list-topics
# full summary can be decently large, so it's best to redirect to a file
rosbagSummary --bag-file 'your_file.bag' > 'your_file.summary.yaml'
```

To start a server to visualize a rosbag file:
```sh
# 
rosbagAsBackend --bag-file 'your_file.bag' --port 9093 

# Advanced usage:
rosbagAsBackend --bag-file 'your_file.bag' \
    --port 9093 \
    --playback-speed 2 \
    --no-repeat-on-end \
    --fast-forward-function '({message})=>message.sitting' \
    --log-function '
        ({ topic, message, timestamp })=>[new Date(timestamp), !topic.startsWith("/spot/odometry")?null:message?.pose?.pose?.position?.x]
    '

# All options:
rosbagAsBackend --help

    --debug, -d
        Run in debug mode (prints more stuff, maybe)
    
    --list-topics
        List all the topics in the rosbag file, then exit
    
    --no-repeat-on-end
        By default, the rosbag file will be repeated when it reaches the end
        (i.e. when the rosbag file is over, it will start from the beginning)
        This flag will disable that behavior

    --playback-speed, -s
        The relative speed to play back the rosbag file at
        default: 1
    
    --bag-file [path]
        The path to the rosbag file to serve
        default: ./data.ignore/co_ral_narrow.bag
    
    --port
        The port to run the server on
        default: 9093

    --address
        The address to run the server on
        default: 127.0.0.1
    
    --dummy-wss
        Use a "secure" websocket connection
        (self-signed cert/key, not actually secure)
```
<!-- ./rosbagAsBackend.js --bag-file '/Users/jeffhykin/repos/rapid_ros_server/data.ignore/spot_sample_bag_all_data.bag' --playback-speed 10 --fast-forward-function '({message})=>message.sitting' --log-function '({ topic, message, timestamp })=>[new Date(timestamp), !topic.startsWith("/spot/odometry")?null:message?.pose?.pose?.position?.x]' -->