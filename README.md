## Project Roadmap

* Build bot module
* Make base game

## Bot module

* Post to forum thread
* Read thread, return posts

## Base game module

* Main loop
  * Fetch most recent post from db ------------------ nedb
  * Determine if any new posts (after recentpost)
  * For each post:
    * Execute commands
    * Save post to db
  * Reply to thread
* Database
    * Posts read

## General game pseudocode

* Main controller (registers commands)
* Game state stored in db:
  * Farm plot
    * Plot A: {}
    * Plot B: {}
  * Users
    * User stats
    * User inventory
