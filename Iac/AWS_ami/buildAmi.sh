#!/bin/bash

packer build \
    -var 'aws_region=us-east-1' \
    -var 'subnet_id=subnet-535bdb5d' \
    ami.json