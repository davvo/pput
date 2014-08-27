pput
===

Parallel put to s3. Requires node 0.11 or later (see http://bahmutov.calepin.co/a-taste-of-nodejs-generators.html)

    node --harmony pput.js --key=AWS_KEY --secret=AWS_SECRET --bucket=S3_BUCKET [FILE] ...

AWS_KEY and AWS_SECRET can optionally be set as environment variables.

The default number of workers is 100. Override with --workers option

    export AWS_KEY=xxxx
    export AWS_SECRET=xxxx
    node --harmony pput.js --bucket=S3_BUCKET --workers=10 [FILE] ...

