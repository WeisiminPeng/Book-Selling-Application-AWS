resource "aws_vpc" "vpc" {
    cidr_block = var.cidr_block_vpc
    enable_dns_hostnames = true
    enable_dns_support = true
    enable_classiclink_dns_support = true
    assign_generated_ipv6_cidr_block = false

    tags = var.vpc_tags
}

resource "aws_subnet" "subnet" {
  count = length(var.cidr_block_subnet)
  cidr_block  = var.cidr_block_subnet[count.index]
  vpc_id = aws_vpc.vpc.id
  availability_zone = var.zone_subnet[count.index]
  map_public_ip_on_launch = true
  
  tags = var.subnet_tags 
}

resource "aws_internet_gateway" "gw" {
  vpc_id = aws_vpc.vpc.id

  tags = var.internet_gateway_tags
}

resource "aws_route_table" "public" {
  vpc_id = aws_vpc.vpc.id

  tags = var.public_route_table_tags
}

resource "aws_route_table_association" "public" {
  count = length(var.cidr_block_subnet)

  subnet_id      = element(aws_subnet.subnet.*.id, count.index)
  route_table_id = aws_route_table.public.id
}

resource "aws_route" "public" {
  route_table_id            = aws_route_table.public.id
  destination_cidr_block    = var.destination_cidr_block
  gateway_id = aws_internet_gateway.gw.id
}

resource "aws_dynamodb_table" "a5_dynamodb_table" {
  name           = "cloud"
  hash_key       = "id"
  read_capacity  = 20
  write_capacity = 20

  attribute {
    name = "id"
    type = "S"
  }


  ttl {
    attribute_name = "ExpirationTime"
    enabled        = true
  }

  tags = {
    Name        = "cloud"
  }
}


resource "aws_s3_bucket" "bucket" {
  bucket = "webapp.weisimin.peng"
  force_destroy = true
  acl    = "private"

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["PUT", "POST", "HEAD", "GET", "DELETE"]
    allowed_origins = ["*"]
    expose_headers  = ["ETag"]
  }

  lifecycle_rule {
    enabled = true

      transition {
        days          = 30
        storage_class = "STANDARD_IA"
      }
  }

  server_side_encryption_configuration {
    rule {
      apply_server_side_encryption_by_default {
        sse_algorithm     = "AES256"
      }
    }
  }
}



resource "aws_security_group" "web_security_group" {
  name = var.web_security_group
  vpc_id      = aws_vpc.vpc.id

  ingress {
    description = "HTTPS"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    security_groups = [aws_security_group.lb_security_group.id]
  }

  ingress {
    description = "HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    security_groups = [aws_security_group.lb_security_group.id]
  }

  ingress {
    description = "SSH"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = var.security_group_block
    ipv6_cidr_blocks = var.security_group_ipv6_block
  }

  ingress {
    description = "DATABASE_PORT"
    from_port   = 3000
    to_port     = 3000
    protocol    = "tcp"
    security_groups = [aws_security_group.lb_security_group.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_security_group" "lb_security_group" {
  name = "lb_security_group"
  vpc_id      = aws_vpc.vpc.id

  ingress {
    description = "HTTPS"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = var.security_group_block
    ipv6_cidr_blocks = var.security_group_ipv6_block
  }

  ingress {
    description = "HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = var.security_group_block
    ipv6_cidr_blocks = var.security_group_ipv6_block
  }

  # ingress {
  #   description = "SSH"
  #   from_port   = 22
  #   to_port     = 22
  #   protocol    = "tcp"
  #   cidr_blocks = var.security_group_block
  #   ipv6_cidr_blocks = var.security_group_ipv6_block
  # }

  ingress {
    description = "SERVER_PORT"
    from_port   = 3000
    to_port     = 3000
    protocol    = "tcp"
    cidr_blocks = var.security_group_block
    ipv6_cidr_blocks = var.security_group_ipv6_block
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_security_group" "db_security_group" {
  name = var.db_security_group
  vpc_id      = aws_vpc.vpc.id

  ingress {
    description = "MySQL"
    from_port   = 3306
    to_port     = 3306
    protocol    = "tcp"
    security_groups = [aws_security_group.web_security_group.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}




resource "aws_db_subnet_group" "db_subnet_group" {
  name       = "db_subnet_group"
  subnet_ids = [aws_subnet.subnet.0.id,aws_subnet.subnet.1.id ]

  tags = {
    Name = "db_subnet_group"
  }
}

resource "aws_db_instance" "db_instance" {
  identifier           = "cloud-su2020"
  allocated_storage    = 20
  storage_type         = "gp2"
  engine               = "mysql"
  instance_class       = "db.t3.medium"
  name                 = "cloudsu2020"
  username             = "cloudsu2020"
  password             = "Mysql1874"
  multi_az             = false
  publicly_accessible  = false
  storage_encrypted    = true
  performance_insights_enabled = true
  db_subnet_group_name = aws_db_subnet_group.db_subnet_group.name
  vpc_security_group_ids = [aws_security_group.db_security_group.id]
  skip_final_snapshot = true
  tags = {
    Name = "db_instance"
  }
}

resource "aws_iam_role" "EC2role" {
  name = var.EC2-role-name
    assume_role_policy = <<POLICY
{
    "Version": "2012-10-17",
    "Statement": [
      {
        "Action": "sts:AssumeRole",
        "Principal": {
          "Service": "ec2.amazonaws.com"
        },
        "Effect": "Allow",
        "Sid": ""
      }
    ]
}
  POLICY
}

resource "aws_iam_role_policy_attachment" "AWSEC2Role" {
  policy_arn = "arn:aws:iam::aws:policy/CloudWatchAgentServerPolicy"
  role       = aws_iam_role.EC2role.name
}

resource "aws_iam_policy" "CodeDeployEC2S3" {
  name = var.CodeDeploy-EC2-S3
  policy = <<EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Action": [
                "s3:Get*",
                "s3:List*"
            ],
            "Effect": "Allow",
            "Resource": [
                "arn:aws:s3:::codedeploy.weisiminpeng.com",
                "arn:aws:s3:::codedeploy.weisiminpeng.com/*"
            ]
        },
        {
            "Action": [
              "s3:Delete*",
              "s3:Get*",
              "s3:Put*",
              "s3:List*"
            ],
            "Effect": "Allow",
            "Resource": [
                "arn:aws:s3:::webapp.weisimin.peng",
                "arn:aws:s3:::webapp.weisimin.peng/*"
            ]
        }
    ]
}
  EOF
}

resource "aws_iam_role_policy_attachment" "deploy_role_attach" {
  role       = aws_iam_role.EC2role.name
  policy_arn = aws_iam_policy.CodeDeployEC2S3.arn
}

resource "aws_iam_role_policy_attachment" "attach-AWS-lambda-sns-role2" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonSNSFullAccess"
  role       = aws_iam_role.EC2role.name
}

resource "aws_iam_instance_profile" "profile" {
  name = "profile"
  role = aws_iam_role.EC2role.name
}

data "aws_ami" "ami" {
  owners = ["838345291199"]

  filter {
    name = "name"
    values = var.ami_name
  }
}

# resource "aws_instance" "web" {
#   ami           = data.aws_ami.ami.id
#   instance_type = "t2.micro"
#   disable_api_termination = false
#   monitoring = true
#   vpc_security_group_ids = [aws_security_group.web_security_group.id]
#   subnet_id = aws_subnet.subnet.0.id
#   iam_instance_profile = aws_iam_instance_profile.profile.name

#   user_data = <<-EOF
# 		  #! /bin/bash
#       echo export DBname=${aws_db_instance.db_instance.name} >> /etc/profile
#       echo export DBusername=${aws_db_instance.db_instance.username} >> /etc/profile
#       echo export DBpassword=${aws_db_instance.db_instance.password} >> /etc/profile
#       echo export S3name=${aws_s3_bucket.bucket.bucket} >> /etc/profile
#       echo export DBhostname=${aws_db_instance.db_instance.endpoint} >> /etc/profile
# 	EOF

#   depends_on = [aws_db_instance.db_instance, aws_s3_bucket.bucket]
#   key_name = "cloud_aws"
#   root_block_device {
#     volume_size = 20
#     volume_type = "gp2"
#     delete_on_termination = true
#   }
#   tags = var.instance_tag
# }


resource "aws_launch_configuration" "as_conf" {
  name          = "asg_launch_config"
  image_id      = data.aws_ami.ami.id
  instance_type = "t2.micro"
  enable_monitoring = true
  security_groups = [aws_security_group.web_security_group.id]
  iam_instance_profile = aws_iam_instance_profile.profile.name
  associate_public_ip_address = true
  key_name = "cloud_aws"
  user_data = <<-EOF
		  #! /bin/bash
      echo export DBname=${aws_db_instance.db_instance.name} >> /etc/profile
      echo export DBusername=${aws_db_instance.db_instance.username} >> /etc/profile
      echo export DBpassword=${aws_db_instance.db_instance.password} >> /etc/profile
      echo export S3name=${aws_s3_bucket.bucket.bucket} >> /etc/profile
      echo export DBhostname=${aws_db_instance.db_instance.endpoint} >> /etc/profile
      echo export topicArn=${aws_sns_topic.sns-topic.arn} >> /etc/profile
	EOF

  root_block_device {
    volume_size = 20
    volume_type = "gp2"
    delete_on_termination = true
  }
}


resource "aws_autoscaling_group" "autoscale" {
  name                      = "webapp_autoscaling_group"
  max_size                  = 5
  min_size                  = 2
  default_cooldown          = 60
  desired_capacity          = 2
  force_delete              = true
  launch_configuration      = aws_launch_configuration.as_conf.name
  vpc_zone_identifier       = [aws_subnet.subnet.0.id,aws_subnet.subnet.1.id]

  target_group_arns         = [aws_lb_target_group.lb_target80.arn, aws_lb_target_group.lb_target3000.arn]


  tag {
    key                 = var.codedeploy-key
    value               = var.codedeploy-value
    propagate_at_launch = true
  }
}

resource "aws_autoscaling_policy" "scaleup" {
  name                   = "scale_up_policy"
  scaling_adjustment     = 1
  adjustment_type        = "ChangeInCapacity"
  cooldown               = 60
  autoscaling_group_name = aws_autoscaling_group.autoscale.name
}

resource "aws_cloudwatch_metric_alarm" "alarm_scaleup" {
  alarm_name          = "alarm_scale_up"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "1"
  metric_name         = "CPUUtilization"
  namespace           = "AWS/EC2"
  period              = "120"
  statistic           = "Average"
  threshold           = "70"

  dimensions = {
    AutoScalingGroupName = aws_autoscaling_group.autoscale.name
  }

  alarm_description = "Scale-up if CPU > 5% for 1 minutes"
  alarm_actions     = [aws_autoscaling_policy.scaleup.arn]
}

resource "aws_autoscaling_policy" "scaledown" {
  name                   = "scale_down_policy"
  scaling_adjustment     = -1
  adjustment_type        = "ChangeInCapacity"
  cooldown               = 60
  autoscaling_group_name = aws_autoscaling_group.autoscale.name
}

resource "aws_cloudwatch_metric_alarm" "alarm_scaledown" {
  alarm_name          = "alarm_scale_down"
  comparison_operator = "LessThanThreshold"
  evaluation_periods  = "1"
  metric_name         = "CPUUtilization"
  namespace           = "AWS/EC2"
  period              = "60"
  statistic           = "Average"
  threshold           = "10"

  dimensions = {
    AutoScalingGroupName = aws_autoscaling_group.autoscale.name
  }

  alarm_description = "Scale-up if CPU < 3% for 1 minutes"
  alarm_actions     = [aws_autoscaling_policy.scaledown.arn]
}


resource "aws_lb_target_group" "lb_target80" {
  name     = "webapp-lb-target80"
  port     = 80
  protocol = "HTTP"
  target_type = "instance"
  vpc_id   = aws_vpc.vpc.id
  stickiness {    
    type            = "lb_cookie"    
    cookie_duration = 6000   
    enabled         = true 
  } 
}

resource "aws_lb_target_group" "lb_target3000" {
  name     = "webapp-lb-target3000"
  port     = 3000
  protocol = "HTTP"
  target_type = "instance"
  vpc_id   = aws_vpc.vpc.id
    stickiness {    
    type            = "lb_cookie"    
    cookie_duration = 6000   
    enabled         = true 
  } 
}

resource "aws_lb" "lb" {
  name               = "webapp-lb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.lb_security_group.id]
  subnets            = [aws_subnet.subnet.0.id,aws_subnet.subnet.1.id]

  enable_deletion_protection = false
}

# resource "aws_lb_listener" "listener80" {
#   load_balancer_arn = aws_lb.lb.arn
#   port              = "80"
#   protocol          = "HTTP"

#   default_action {
#     target_group_arn = aws_lb_target_group.lb_target80.arn
#     type = "forward"
#   }
# }

resource "aws_lb_listener" "listener443" {
  load_balancer_arn = aws_lb.lb.arn
  port              = "443"
  protocol          = "HTTPS"

  ssl_policy        = "ELBSecurityPolicy-2016-08"
  certificate_arn   = data.aws_acm_certificate.ssl.arn

  default_action {
    target_group_arn = aws_lb_target_group.lb_target80.arn
    type = "forward"
  }
}

resource "aws_lb_listener" "listener3000" {
  load_balancer_arn = aws_lb.lb.arn
  port              = "3000"
  protocol          = "HTTPS"

  ssl_policy        = "ELBSecurityPolicy-2016-08"
  certificate_arn   = data.aws_acm_certificate.ssl.arn

  default_action {
    target_group_arn = aws_lb_target_group.lb_target3000.arn
    type = "forward"
  }
}

resource "aws_route53_record" "route53" {
  zone_id = "Z07415903LIHPZVPEK6K8"
  name    = "prod.weisiminpeng.com"
  type    = "A"

  alias {
    name                   = aws_lb.lb.dns_name
    zone_id                = aws_lb.lb.zone_id
    evaluate_target_health = true
  }
}



data "aws_iam_user" "cicd" {
  user_name = "cicd"
}


resource "aws_iam_policy" "CircleCI-Upload-To-S3" {
  name = "CircleCI-Upload-To-S3"

  policy = <<EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:PutObject",
                "s3:Get*",
                "s3:List*"
            ],
            "Resource": [
                "arn:aws:s3:::codedeploy.weisiminpeng.com",
                "arn:aws:s3:::codedeploy.weisiminpeng.com/*"
            ]
        }
    ]
}
EOF
}

resource "aws_iam_policy" "circleci-ec2-ami" {
  name = "circleci-ec2-ami"

  policy = <<EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "ec2:AttachVolume",
                "ec2:AuthorizeSecurityGroupIngress",
                "ec2:CopyImage",
                "ec2:CreateImage",
                "ec2:CreateKeypair",
                "ec2:CreateSecurityGroup",
                "ec2:CreateSnapshot",
                "ec2:CreateTags",
                "ec2:CreateVolume",
                "ec2:DeleteKeyPair",
                "ec2:DeleteSecurityGroup",
                "ec2:DeleteSnapshot",
                "ec2:DeleteVolume",
                "ec2:DeregisterImage",
                "ec2:DescribeImageAttribute",
                "ec2:DescribeImages",
                "ec2:DescribeInstances",
                "ec2:DescribeInstanceStatus",
                "ec2:DescribeRegions",
                "ec2:DescribeSecurityGroups",
                "ec2:DescribeSnapshots",
                "ec2:DescribeSubnets",
                "ec2:DescribeTags",
                "ec2:DescribeVolumes",
                "ec2:DetachVolume",
                "ec2:GetPasswordData",
                "ec2:ModifyImageAttribute",
                "ec2:ModifyInstanceAttribute",
                "ec2:ModifySnapshotAttribute",
                "ec2:RegisterImage",
                "ec2:RunInstances",
                "ec2:StopInstances",
                "ec2:TerminateInstances",
                "ec2:CreateLaunchTemplate",
                "ec2:DeleteLaunchTemplate",
                "ec2:CreateFleet",
                "ec2:DescribeSpotPriceHistory"
            ],
            "Resource": "*"
        },
        {
            "Sid": "PackerIAMPassRole",
            "Effect": "Allow",
            "Action": [
                "iam:PassRole",
                "iam:GetInstanceProfile"
            ],
            "Resource": [
                "*"
            ]
        },
        {
            "Sid": "PackerIAMCreateRole",
            "Effect": "Allow",
            "Action": [
                "iam:PassRole",
                "iam:CreateInstanceProfile",
                "iam:DeleteInstanceProfile",
                "iam:GetRole",
                "iam:GetInstanceProfile",
                "iam:DeleteRolePolicy",
                "iam:RemoveRoleFromInstanceProfile",
                "iam:CreateRole",
                "iam:DeleteRole",
                "iam:PutRolePolicy",
                "iam:AddRoleToInstanceProfile"
            ],
            "Resource": "*"
        }
    ]
}
EOF
}

resource "aws_iam_policy" "CircleCI-Code-Deploy" {
  name = "CircleCI-Code-Deploy"
  # user = data.aws_iam_user.cicd.user_name

  policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "codedeploy:RegisterApplicationRevision",
        "codedeploy:GetApplicationRevision"
      ],
      "Resource": [
        "arn:aws:codedeploy:us-east-1:084857237573:application:cloud-webapp"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "codedeploy:CreateDeployment",
        "codedeploy:GetDeployment"
      ],
      "Resource": [
        "*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "codedeploy:GetDeploymentConfig"
      ],
      "Resource": [
        "arn:aws:codedeploy:us-east-1:084857237573:deploymentconfig:CodeDeployDefault.OneAtATime",
        "arn:aws:codedeploy:us-east-1:084857237573:deploymentconfig:CodeDeployDefault.HalfAtATime",
        "arn:aws:codedeploy:us-east-1:084857237573:deploymentconfig:CodeDeployDefault.AllAtOnce"
      ]
    }
  ]
}
EOF
}

resource "aws_iam_user_policy_attachment" "attach_CircleCI-Upload-To-S3" {
  user       = data.aws_iam_user.cicd.user_name
  policy_arn = aws_iam_policy.CircleCI-Upload-To-S3.arn
}
resource "aws_iam_user_policy_attachment" "attach_circleci-ec2-ami" {
  user       = data.aws_iam_user.cicd.user_name
  policy_arn = aws_iam_policy.circleci-ec2-ami.arn
}
resource "aws_iam_user_policy_attachment" "attach_CircleCI-Code-Deploy" {
  user       = data.aws_iam_user.cicd.user_name
  policy_arn = aws_iam_policy.CircleCI-Code-Deploy.arn
}

resource "aws_iam_user_policy_attachment" "attach-AWS-lambda-sns-role1" {
  policy_arn = "arn:aws:iam::aws:policy/AWSLambdaFullAccess"
  user       = data.aws_iam_user.cicd.user_name
}


resource "aws_codedeploy_app" "cloud-webapp" {
  compute_platform = "Server"
  name             = "cloud-webapp"
}

resource "aws_iam_role" "CodeDeployServiceRole" {
  name = "CodeDeployServiceRole"

  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "",
      "Effect": "Allow",
      "Principal": {
        "Service": "codedeploy.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF
}

resource "aws_iam_role_policy_attachment" "AWSCodeDeployRole" {
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSCodeDeployRole"
  role       = aws_iam_role.CodeDeployServiceRole.name
}

resource "aws_codedeploy_deployment_group" "deploy-group" {
  app_name              = aws_codedeploy_app.cloud-webapp.name
  deployment_group_name = "cloud-webapp-deployment"
  service_role_arn      = aws_iam_role.CodeDeployServiceRole.arn
  deployment_config_name = "CodeDeployDefault.AllAtOnce"

  autoscaling_groups = [aws_autoscaling_group.autoscale.name]

  deployment_style {
    deployment_type   = "IN_PLACE"
  }

  ec2_tag_set {
    ec2_tag_filter {
      key   = var.codedeploy-key
      type  = "KEY_AND_VALUE"
      value = var.codedeploy-value
    }
  }

    auto_rollback_configuration {
    enabled = true
    events  = ["DEPLOYMENT_FAILURE"]
  }
}


resource "aws_sns_topic" "sns-topic" {
  name = "password_reset"
  display_name  = "webapp-sns-topic"
}

resource "aws_iam_role" "lambda-sns-role" {
  name = "lambda-sns-role"
    assume_role_policy = <<POLICY
{
    "Version": "2012-10-17",
    "Statement": [
      {
        "Action": "sts:AssumeRole",
        "Principal": {
          "Service": [
               "lambda.amazonaws.com",
               "edgelambda.amazonaws.com"
            ]
        },
        "Effect": "Allow",
        "Sid": ""
      }
    ]
}
  POLICY
}

resource "aws_iam_policy" "lambda_logging" {
  name        = "lambda_logging"
  path        = "/"
  description = "IAM policy for logging from a lambda"

  policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents",
        "dynamodb:DescribeStream",
        "dynamodb:GetRecords",
        "dynamodb:GetShardIterator",
        "dynamodb:ListStreams",
        "dynamodb:Query",
        "dynamodb:Scan",
        "dynamodb:GetItem",
        "dynamodb:PutItem",
        "dynamodb:deleteItem",
        "ses:SendEmail",
        "ses:SendRawEmail"
      ],
      "Resource": "*",
      "Effect": "Allow"
    }
  ]
}
EOF
}

resource "aws_iam_role_policy_attachment" "lambda_logs" {
  role       = aws_iam_role.lambda-sns-role.name
  policy_arn = aws_iam_policy.lambda_logging.arn
}

# resource "aws_iam_role_policy_attachment" "AWS-lambda-sns-role1" {
#   policy_arn = "arn:aws:iam::aws:policy/AWSLambdaFullAccess"
#   role       = aws_iam_role.lambda-sns-role.name
# }

# resource "aws_iam_role_policy_attachment" "AWS-lambda-sns-role2" {
#   policy_arn = "arn:aws:iam::aws:policy/AmazonSNSFullAccess"
#   role       = aws_iam_role.lambda-sns-role.name
# }

data "archive_file" "dummy" {
  type = "zip"
  output_path = "${path.module}/lambda_function_payload.zip"

  source {
    content = "dummy file"
    filename = "dummy.js"
  }
}

resource "aws_lambda_function" "func" {
  filename      =  data.archive_file.dummy.output_path
  function_name = "lambda_password_reset"
  role          =  aws_iam_role.lambda-sns-role.arn
  handler       = "lambda.handler"
  runtime       = "nodejs10.x"
}

resource "aws_sns_topic_subscription" "lambda" {
  topic_arn = aws_sns_topic.sns-topic.arn
  protocol  = "lambda"
  endpoint  = aws_lambda_function.func.arn
}

resource "aws_lambda_permission" "with_sns" {
  statement_id  = "AllowExecutionFromSNS"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.func.function_name
  principal     = "sns.amazonaws.com"
  source_arn    = aws_sns_topic.sns-topic.arn
}


data "aws_acm_certificate" "ssl" {
  domain   = "prod.weisiminpeng.com"
  statuses = ["ISSUED"]
}

# resource "aws_lb_listener_certificate" "lb-ssl443" {
#   listener_arn    = aws_lb_listener.listener443.arn
#   certificate_arn = data.aws_acm_certificate.ssl.arn
# }

# resource "aws_lb_listener_certificate" "lb-ssl3000" {
#   listener_arn    = aws_lb_listener.listener3000.arn
#   certificate_arn = data.aws_acm_certificate.ssl.arn
# }


