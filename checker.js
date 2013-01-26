var http = require('http'),
  childProcess = require('child_process'),
  cronJob = require('cron').CronJob;

var MY_ID = '67005DBEE367';

console.log("starting up. " + (new Date()).toString() )
function check() {
  console.log('checking ' + (new Date()).toString());
  http.get('http://forcexercise.herokuapp.com/' + MY_ID, function(result) {
    var output = '';
    result.on('data', function (chunk) {
        output += chunk;
    });

    result.on('end', function() {
      try {
        var checkins = JSON.parse(output);
        if (checkins.length) {
          var most_recent_time = new Date(checkins[0].time - 6 * 60 * 60 * 1000); // sorted already, take down by 6 hours
          var today = new Date(Date.now()- 6 * 60 * 60 * 1000); // take down 6 hours
          if (most_recent_time.getDate() == today.getDate()) {
            // we went to the gym today, good job
            goodJob();
          } else {
            // we need to go to the gym
            badStuff();
          }
        } else {
          // no data found
          say('No checkins found.');
          console.log("No checkins found.")
        }
      } catch(e) {
        say('Something is wrong with the get command.');
        console.log("Broken. Something wrong with ooutput.");
        console.log(output);
      }
    });
  }).on('error', function(e) {
      console.log("oh no the get didn't work. Error.");
      say("Could not retrieve checkin history.");
      minuteChecker.start();
    });
};

// attempts to get the correct command for saying things.
function getCorrectSpeechCommand() {
  var isWin = !!process.platform.match(/^win/i);
  var isMac = !!process.platform.match(/^darwin/i);
  if (isWin) {
    return 'echo'; // got nothing here
  } else if (isMac) {
    return 'say';
  } else {
    return 'espeak';
  }
}

// not guaranteed to work
function say(thing_to_say) {
  var say = childProcess.exec('echo "' + thing_to_say + '" | ' + getCorrectSpeechCommand(), function (error, stdout, stderr) {
  });
};

// we went to the gym, yay!
function goodJob() {
  say('Good job exercising today!');
  minuteChecker.stop();
}

// uh oh, F up our s
// based on my alias
// alias maclogout='osascript -e '\''tell application "System Events" to log out'\'''
function badStuff() {
  say('You need your exercise.');
  var logout = childProcess.exec("osascript -e 'tell application \"System Events\" to log out'", function (error, stdout, stderr) {
  });
  minuteChecker.start();
}

//cron job stuff

var minuteChecker = new cronJob('00 * * * * *', check, null, false, null);


var dailyChecker = new cronJob('00 05 06 * * *', 
    // Runs everyday at 06:05:00 AM.
   check
  , null, 
  true /* Start the job right now */,
  null /* Time zone of this job. */
);
check();