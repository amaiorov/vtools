# vTools

## Description
A simple video tool experiment that allows the user to slice a video source into any number of sub-clips with a **title**, **start time** and **end time** using [media fragments](https://www.w3.org/TR/media-frags/). Built with [AngularJS 1](https://angularjs.org/) and vanilla CSS.

## Usage
### Video element
The source video itself; underneath is a bar representation of each of the user created clips.

### Current clips
First item is immutable original source video, the rest are user created clips.
* **play** - play the current clip
* **edit** - modify clip info
* **OK** - save changes
* **delete** - remove clip from playlist (and from localStorage)
* **save** - stores clip data in localStorage for later retrieval

### Add new clip
Specify title, the start time and end time (in seconds).
* **add** - add new clip to playlist

### Keyboard shortcuts
* **[** - skip to the previous clip in the playlist
* **]** - skip to the next clip in the playlist
* **a** - toggle auto-advance; when turned on the next clip will play after the current clip finishes