provider "aws" {
  region     = var.region
}

module "a5_module" {
  source = "../modules/webapp"
}
