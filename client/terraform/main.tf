# Bucket used to host your static website files
resource "aws_s3_bucket" "client-bucket" {
  bucket = var.domain_name
}

resource "aws_s3_bucket_ownership_controls" "client-bucket-ownership-controls" {
  bucket = aws_s3_bucket.client-bucket.id
  rule {
    object_ownership = "BucketOwnerPreferred"
  }
}

resource "aws_s3_bucket_acl" "client-bucket-acl" {
  depends_on = [
    aws_s3_bucket_ownership_controls.client-bucket-ownership-controls,
    aws_s3_bucket_public_access_block.client-bucket-access,
  ]

  bucket = aws_s3_bucket.client-bucket.id
  acl    = "public-read"
}

resource "aws_s3_bucket_public_access_block" "client-bucket-access" {
  bucket = aws_s3_bucket.client-bucket.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

# Bucket policy to enable public read access
resource "aws_s3_bucket_policy" "client-bucket-policy" {
  depends_on = [aws_s3_bucket_public_access_block.client-bucket-access]

  bucket = aws_s3_bucket.client-bucket.id
  policy = jsonencode(
    {
      "Version" : "2012-10-17",
      "Statement" : [
        {
          "Sid" : "PublicReadGetObject",
          "Effect" : "Allow",
          "Principal" : "*",
          "Action" : "s3:GetObject",
          "Resource" : "arn:aws:s3:::${aws_s3_bucket.client-bucket.id}/*"
        }
      ]
    }
  )
}

# Website config that specifies the index and error documents
# If using a SPA framework, you'll want to set the error document to index.html
resource "aws_s3_bucket_website_configuration" "client-bucket-config" {
  bucket = aws_s3_bucket.client-bucket.id

  index_document {
    suffix = "index.html"
  }
  error_document {
    key = "index.html"
  }
}
