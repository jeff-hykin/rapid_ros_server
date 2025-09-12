# What is this?

RRS (Rapid Ros Server) is a way to easily use/explore rosbag files **without installing Ros**. Its a cli command that can power a Roslib.js frontend as if ros was installed, by faking the backend with data from a rosbag file.

# How do I use it?

### Install

First install Deno, then install `rrs`

```sh
# install Deno
curl -fsSL https://deno.land/x/install/install.sh | sh
# windows users do: irm https://deno.land/install.ps1 | iex

# install rrs (ros bag backend)
deno install -n rrs -Afrg --reload https://raw.githubusercontent.com/jeff-hykin/rapid_ros_server/dev/rosbagAsBackend.js
```

### Usage

Start by listing the topics

```sh
# just list topics
rrs --list-topics --bag-file 'your_file.bag' 

# full summary can be decently large, so it's best to redirect to a file
rrs --summarize --bag-file 'your_file.bag' > 'your_file.summary.yaml'
```

Then start the server that can power a Roslib.js frontend:

```sh
# basic
rrs --bag-file 'your_file.bag'
rrs --bag-file 'your_file.bag' --port 9090
rrs --bag-file 'your_file.bag' --port 9090 --address 127.0.0.1
rrs --bag-file 'your_file.bag' --topic-whitelist "/my1/topic1,/my2/topic2"
rrs --bag-file 'your_file.bag' --no-repeat-on-end
rrs --bag-file 'your_file.bag' \
    --config-file ./package.json
    # package.json ex: { rbbConfig: { port: 9093 } } 

# advanced
rrs --bag-file 'your_file.bag' \
    --port 9093 \
    --address 127.0.0.1 \
    --playback-speed 2 \
    --topic-whitelist "/my1/topic1,/my2/topic2" \
    --no-repeat-on-end

rrs --bag-file 'your_file.bag' \
    --port 9093 \
    --address 127.0.0.1 \
    --no-repeat-on-end \
    --playback-speed 2 \
    --topic-whitelist "/my1/topic1,/my2/topic2" \
    --fast-forward-function '({topic,timeMin,...other})=>timeMin<0.5' \
    --log-function '({message,topic,...other})=>[ date.toLocaleString(), topic ]'

rrs --bag-file 'your_file.bag' \
    --port 9093 \
    --address 127.0.0.1 \
    --no-repeat-on-end \
    --playback-speed 2 \
    --topic-whitelist "/my1/topic1,/my2/topic2" \
    --fast-forward-function '({topic,timeMin,...other})=>timeMin<0.5' \
    --log-function '({message,topic,...other})=>{
        if (other.timeMin > 3 && other.timeMin < 5) {
            return null
        } else {
            return [ date.toLocaleString(), topic ]
        }
    '

```

Here's the full set of options:
```
All Options:
    --bag-file [path]
        The path to the rosbag file to serve
        default: null
    
    --debug, -d
        Run in debug mode (prints more stuff, maybe)

    --list-topics
        List all the topics in the rosbag file, then exit
    
    --summarize
        Print a yaml summary of the rosbag file, then exit
    
    --help
        Print this help message
    
    --config-file [file_path]
        Highly recommended you use this.
        Use the config file to set port/ipAddress/etc
        It can be a .json/.yaml file or a .js file 
        Json example (can be inside a package.json):
            {
                "rbbConfig": {
                    "port": 9093,
                    "ipAddress": "127.0.0.1",
                    "noRepeatOnEnd": true,
                },
            }
        Js example:
            export default {
                rbbConfig: {
                    port: 9093,
                    ipAddress: "127.0.0.1",
                    playbackSpeed: 4,
                },
            }
    
    --port [portNumber]
        The port to run the server on
        default: 9093

    --address [ipAddress]
        The address to run the server on
        default: 127.0.0.1

    --topic-whitelist [topic1,topic2,...]
        Only read messages from the given topics
        default: all topics
        ex:
            --topic-whitelist /spot/odometry,/spot/status/mobility_params
    
    --no-repeat-on-end
        By default, the rosbag file will be repeated when it reaches the end
        (i.e. when the rosbag file is over, it will start from the beginning)
        This flag will disable that behavior

    --playback-speed, -s [floatValue]
        0.5 is half speed, 2 is double speed
        default: 1
    
    --dummy-wss
        Use a "secure" websocket connection
        (self-signed cert/key, not actually secure)
    
    --fast-forward-function [jsFunctionString]
        The sender will skip messages as fast as possible if the function 
        returns true. This is useful for ignoring start/end conditions.
        It is a javascript function literal, for example:
            --fast-forward-function '({message,topic,timeMin})=>timeMin<0.5'
        Here are the available properties on the message object:
            - message // object
            - topic // string
            - timeMin // time in minutes (relative to first message), float value
            - timeSec
            - timeMs
            - unixTimeMs // time in milliseconds relative to unix epoch
            - date // javascript Date object, ex: date.toLocaleString()
            - connectionId
            - data // Uint8Array (e.g. raw bytes)
    
    --log-function [jsFunctionString]
        A function that will be called for each non-skipped message.
        Whatever non-null value is returned will be printed.
        Examples:
            --log-function '({date,topic})=>[date,topic]'
            --log-function '({message})=>message?.pose?.pose?.position?.x'
            --log-function '({message,date,topic})=>[date, topic, message?.pose?.pose?.position?.x]'
            --log-function '({message,date,topic,timeMin})=>( (timeMin<0.5) ? null : [date, topic, message?.pose?.pose?.position?.x] )'
            --log-function '({message,topic,timeMin,date,...other})=>[ date.toLocaleString(), message?.pose?.pose?.position?.x ]'
            --log-function '({message,date,topic})=>{
                if (topic.startsWith("/spot/odometry")) {
                    return [date,message]
                }
            }'
Notes:
    - Cli arguments take precedence over config file values
    - You can give an argument twice, but only the last one will be used
```
<!-- ./rosbagAsBackend.js --bag-file '/Users/jeffhykin/repos/rapid_ros_server/data.ignore/spot_sample_bag_all_data.bag' --playback-speed 10 --fast-forward-function '({message})=>message.sitting' --log-function '({ topic, message, timestamp })=>[new Date(timestamp), !topic.startsWith("/spot/odometry")?null:message?.pose?.pose?.position?.x]' -->