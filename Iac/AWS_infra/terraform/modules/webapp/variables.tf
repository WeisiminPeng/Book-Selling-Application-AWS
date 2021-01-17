variable "vpc_tags" {
  type        = map(string)
  default     = {
    Name   = "a5_web_vpc"
  }
}

variable "subnet_tags" {
  type        = map(string)
  default     = {
    Name   = "a5_web_subnet"
  }
}

variable "internet_gateway_tags" {
  type        = map(string)
  default     = {
    Name   = "a5_web_internet_gateway"
  }
}

variable "public_route_table_tags" {
  type        = map(string)
  default     = {
    Name   = "a5_web_public_route_table"
  }
}

variable "web_volume_tag" {
  type        = map(string)
  default     = {
    Name   = "a5_web_volume"
  }
}

variable "web_snapshot_tag" {
  type        = map(string)
  default     = {
    Name   = "a5_web_snapshot"
  }
}

variable "instance_tag" {
  type        = map(string)
  default     = {
    Name   = "web_instance",
    instance = "cloud"
  }
}

variable "iam_role_name" {
  type        = string
  default     = "EC2-Cloud"
}

variable "iam_role_policy_name" {
  type        = string
  default     = "WebAppS3"
}

variable "ami_name" {
  type        = list(string)
  default     = ["packer_AWS_clous"]
}

variable "web_security_group" {
  type        = string
  default     = "application"
}


variable "db_security_group" {
  type        = string
  default     = "database"
}

variable "web_ami_name" {
  type        = string
  default     = "a5_web_ami"
}

variable "zone_subnet" {
  type = list(string)
  default = ["us-east-1a", "us-east-1b", "us-east-1c"]
}

variable "web_volume_availability_zone" {
  type = string
  default = "us-east-1a"
}

variable "cidr_block_vpc" {
  type = string
  default = "10.0.0.0/16"
}

variable "cidr_block_subnet" {
  type = list(string)
  default = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
}

variable "destination_cidr_block" {
  type = string
  default = "0.0.0.0/0"
}

variable "security_group_block" {
  type = list(string)
  default = ["0.0.0.0/0"]
}

variable "security_group_ipv6_block" {
  type = list(string)
  default = ["::/0"]
}

variable "EC2-role-name" {
  type = string
  default = "CodeDeployEC2ServiceRole"
}

variable "CodeDeploy-EC2-S3" {
  type = string
  default = "CodeDeploy-EC2-S3"
}

variable "codedeploy-key" {
  type = string
  default = "instance"
}

variable "codedeploy-value" {
  type = string
  default = "cloud"
}