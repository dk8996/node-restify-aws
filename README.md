node-restify-aws
================
Install Node:

```shell
sudo yum install gcc-c++ make
sudo apt-get  update
sudo apt-get check node
sudo apt-get install python-software-properties python g++ make
sudo add-apt-repository ppa:chris-lea/node.js
sudo apt-get update
sudo apt-get install nodejs
```

Install RESTify

```shell
npm install restify
```

Install AWS-SDK for Node.js
```shell
npm install aws-sdk
```

Create credentails.json 

```json
{"accessKeyId":"XXXXXXX","secretAccessKey":"XXXXX"}
```

Using AB util
```shell
ab -n10 -c10 -p post.json -v2 yourserver:8080/mappings?api_key=test
```
