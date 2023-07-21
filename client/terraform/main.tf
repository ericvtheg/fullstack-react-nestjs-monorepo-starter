# Bucket used to host your static website files
resource "aws_s3_bucket" "client-bucket" {
  bucket = var.domain_name
}

# Bucket policy to enable public read access
resource "aws_s3_bucket_policy" "client-bucket-policy" {
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
resource "aws_s3_bucket_website_configuration" "beta-test-songs-frontend-hosting" {
  bucket = aws_s3_bucket.beta-test-songs-frontend-bucket.id

  index_document {
    suffix = "index.html"
  }
  error_document {
    key = "index.html"
  }
}
