#!/bin/sh
# Runs the node script to check my exercise regime
echo $USER &> /Users/paul/Dev/forcexercise/loguser.txt
/usr/local/bin/node /Users/paul/Dev/forcexercise/checker.js &> /Users/paul/Dev/forcexercise/log.txt