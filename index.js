var fs = require('fs'),
    knox = require('knox'),
    path = require('path'),
    parseArgs = require('minimist');

function *walks(files, prefix) {
    for (var i in files) {
        yield* walk(files[i], path.dirname(files[i]), prefix);
    }
}

function *walk(file, dirname, prefix) {    
    var stat = fs.statSync(file);
    if (stat.isDirectory()) {
        var files = fs.readdirSync(file);
        for (var i in files) {
            yield* walk(path.join(file, files[i]), dirname, prefix);
        }
    } else {
        var key = file;
        if (key.indexOf(dirname) === 0) {
            key = key.substring(dirname.length + 1);
        }
        if (prefix) {
            key = path.join(prefix, key);
        }
	if (folder) {
	    key = path.join(folder, key);
	}
        yield {
            file: file,
            key: key,
            stat: stat
        };
    }
}

var argv = parseArgs(process.argv.slice(2));

var files = walks(argv._, argv.prefix || '');

var s3 = knox.createClient({
    key: argv.key || process.env.AWS_KEY, 
    secret: argv.secret || process.env.AWS_SECRET,
    bucket: argv.bucket || 'oblique',
    region: 'eu-west-1',
    secure: false,
    agent: false
});

var workers = argv.workers || 100,
    folder = argv.folder,
    done = 0,
    bytesSent = 0,
    filesSent = 0,
    start = new Date();

function putNext(task) {
    if (!task) {
        try {
            var next = files.next();
            if (next.done) {
                return done++;
            }
            task = next.value;
        } catch (x) {
            return done++;
        }
    }
    fs.readFile(task.file, function (err, data) {
        if (err) {
            throw err;
        }
        var req = s3.put(task.key, {
            'Content-Length': data.length,
            'x-amz-acl': 'public-read'
        });
        req.on('error', function (err) {
            console.error(err.message);
            putNext(task);
        });
        req.on('response', function(res) {
            res.resume();
            filesSent++;
            bytesSent += task.stat.size;
            putNext();
        });
        req.end(data);
    });
}

function getSpeed() {
    var seconds = (new Date() - start) / 1000,
        bytesPerSec = bytesSent / seconds;
    if (bytesPerSec > 1e6) {
        return (bytesPerSec / 1e6).toFixed(1) + ' MB/s';
    } else if (bytesPerSec > 1e3) {
        return (bytesPerSec / 1e3).toFixed(1) + ' KB/s';
    }
    return bytesPerSec.toFixed(1) + ' B/s';
}

for (var i = 0; i < workers; ++i) {
    putNext();
}

(function printProgress() {
    process.stdout.clearLine();
    process.stdout.write('Files sent: ' + filesSent + '. Average speed: ' + getSpeed() + '\r');
    if (done < workers) {
        setTimeout(printProgress, 1000);
    } else {
        console.log('\nDone!');
    }
}());
