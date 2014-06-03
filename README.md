put
===

Copy files to s3. Requires node 0.11 or later (see http://bahmutov.calepin.co/a-taste-of-nodejs-generators.html)

    node --harmony index.js --key=AWS_KEY --secret=AWS_SECRET --bucket=S3_BUCKET [FILE] ...

The default number of workers is 100. Override with --workers option

    node --harmony index.js --key=AWS_KEY --secret=AWS_SECRET --bucket=S3_BUCKET --workers=10 [FILE] ...
    
