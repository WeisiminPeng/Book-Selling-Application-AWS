#!/bin/bash

aws ec2 create-vpc  --cidr-block "10.0.0.0/16" --no-amazon-provided-ipv6-cidr-block  --instance-tenanvy default

aws ec2 delete-vpc --vpc-id vpc-08ccb95c7042bc32e

aws ec2 describe-vpcs  --filters Name=Name, Values=demo

aws ec2 modify-vpc-attribute --enable-dns-hostname --enable-dns-support --vpc-id <value>

aws ec2 modify-vpc-attribute --no-enable-dns-hostname --vpc-id vpc-08f37ad6c277af8a5