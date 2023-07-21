terraform {
  required_providers {
    aws = {
      source                = "hashicorp/aws"
      version               = "~> 4.0"
      configuration_aliases = [aws.us-east-1]
    }
  }

  backend "s3" {
    bucket                  = "<TO_BE_REPLACED_STATE_BUCKET_NAME>"
    key                     = "tfstate"
    region                  = "us-east-2"
    profile                 = "default"
    encrypt                 = "true"
    dynamodb_table          = "<TO_BE_REPLACED_DDB_TABLE_NAME>"
    shared_credentials_file = "$HOME/.aws/credentials"
  }
}