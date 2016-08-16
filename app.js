var app = angular.module('vToolsApp', []);

app.controller('vToolsController', function($scope, $compile) {

	var vTools = this,
		video = document.getElementById('video'),
		timeline = document.querySelector('.timeline'),
		videoDuration,
		currentClip = {},
		currentIndex = 0;

	vTools.clips = [];
	vTools.autoAdvance = false;

/**
 * set up DOM and model values
 */
	vTools.init = function() {
		// once video is loaded, set dimensions to prevent jumping and remove event listener
		videoDuration = video.duration;
		video.style.width = video.parentElement.style.width = video.videoWidth + 'px';
		video.style.height = video.videoHeight + 'px';
		video.removeEventListener('loadedmetadata', vTools.init);
		timeline.style.width = video.videoWidth + 'px';

		// manually add full video as first item to clip collection
		vTools.clips.push({
			id: 'fullvideo',
			title: 'Full Video',
			start: 0,
			end: video.duration,
			readOnly: true
		});

		// if clips exist in localStorage, iterate and add to main collection
		if (localStorage.length > 0) {
			for (var key in localStorage) {
				var clipData = JSON.parse(localStorage[key]);

				vTools.clips.push({
					id: clipData.id,
					title: clipData.title,
					start: clipData.start,
					end: clipData.end,
					timelineClipWidth: vTools.getTimelineClipValues(clipData.start, clipData.end).width,
					timelineClipLeft: vTools.getTimelineClipValues(clipData.start, clipData.end).left
				});
			}
		}

		// make sure the changes are reflected in the DOM
		$scope.$apply();
	};

/**
 * handle keyboard strokes
 * @param {object} _evt
 */
	vTools.handleKeyup = function(_evt) {
		switch(_evt.which) {
			case 65:
				// toggle auto advance
				vTools.autoAdvance = vTools.autoAdvance ? false : true;
				// make sure the changes are reflected in the DOM
				$scope.$apply();
				break;
			case 219: 
				// previous
				if (currentIndex > 1) {
					vTools.playClip(currentIndex - 1);
					// make sure the changes are reflected in the DOM
					$scope.$apply();
				}
				break;
			case 221: 
				// next
				if (currentIndex !== vTools.clips.length - 1) {
					vTools.playClip(currentIndex + 1);
					// make sure the changes are reflected in the DOM
					$scope.$apply();
				}
				break;
			default:
		}
	};

/**
 * calculate left and width values for timeline clips
 * @param {number} _start
 * @param {number} _end
 * @returns {object}
 */
	vTools.getTimelineClipValues = function(_start, _end) {
		var width = Math.round((_end - _start) / videoDuration * 100);
		var left = Math.round(_start / videoDuration * 100);
		return {
			width: width,
			left: left
		}
	};

/**
 * look up array index based on id 
 * @param {string} _id
 * @returns {number}
 */
	vTools.getIndexById = function(_id) {
		for (var i = 0; i < vTools.clips.length; i++) {
			if (vTools.clips[i].id === _id) {
				return i;
			}
		}

	};

/**
 * make sure input fields are not empty (if id is passed this is an edit, otherwise it's a new entry)
 * @param {string} _id
 * @returns {boolean}
 */
	vTools.checkFields = function(_id) {
		var clip = _id ? vTools.clips[vTools.getIndexById(_id)] : vTools;

		if (!clip.title || !clip.start || !clip.end) {
			alert('Please fill in all fields.');
			return false;
		}

		// set position of the timeline clip
		clip.timelineClipWidth = vTools.getTimelineClipValues(clip.start, clip.end).width;
		clip.timelineClipLeft = vTools.getTimelineClipValues(clip.start, clip.end).left;

		clip.edit = false;
		return true;
	};

/**
 * create a new clip with a random id and add it to main clip collection
 */
	vTools.addClip = function() {
		if (!vTools.checkFields()) {
			return false;
		}

		// generate random id
		var newId = Math.random().toString(16).substring(2);

		vTools.clips.push({
			id: newId,
			title: vTools.title,
			start: vTools.start,
			end: vTools.end,
			timelineClipWidth: vTools.getTimelineClipValues(vTools.start, vTools.end).width,
			timelineClipLeft: vTools.getTimelineClipValues(vTools.start, vTools.end).left
		});

		// reset "add new" fields
		vTools.title = vTools.start = vTools.end = '';
	};

/**
 * push changes to clip data based on id
 * @param {string} _id
 * @param {text} _newTitle
 * @param {number} _newStart
 * @param {number} _newEnd
 */
	vTools.editClip = function(_id, _newTitle, _newStart, _newEnd) {
		vTools.clips[_id].title = _newTitle;
		vTools.clips[_id].start = _newStart;
		vTools.clips[_id].end = _newEnd;
		vTools.clips[_id].edit = false;
	};

/**
 * if user confirms, remove clip from collection and from localStorage based on id
 * @param {string} _id
 */
	vTools.removeClip = function(_id) {
		if (confirm('Are you sure you want to delete this clip? It will also be removed from localStorage.')) {
			vTools.clips.splice(vTools.getIndexById(_id), 1);
			localStorage.removeItem(_id);
		}
	};

/**
 * play a clip based on id
 * @param {string} _id 
 * @returns {boolean}
 */
	vTools.playClip = function(_id) {		
		var index = typeof(_id) === 'number' ? _id : vTools.getIndexById(_id),
			clip = vTools.clips[index],
			newSrc = video.getAttribute('src');

		// if currentIndex is not set, set it
		currentIndex = currentIndex || index;
		newSrc = newSrc.indexOf('#') === -1 ? newSrc : newSrc.substr(0, newSrc.indexOf('#'));
		newSrc += '#t=' + clip.start + ',' + clip.end;
		video.setAttribute('src', newSrc);
		video.play();
		vTools.clips[currentIndex].isPlaying = false;
		currentIndex = index;
		vTools.clips[currentIndex].isPlaying = true;
	};

/**
 * store clip data in localStorage for later retrieval based on id
 * @param {string} _id
 */
	vTools.saveClip = function(_id) {
		localStorage.setItem(_id, JSON.stringify(vTools.clips[vTools.getIndexById(_id)]));
		alert('Clip saved to localStorage.');
	}

	// event listeners
	document.body.addEventListener('keyup', vTools.handleKeyup);
	video.addEventListener('loadedmetadata', vTools.init);
	video.addEventListener('pause', function() {
		// if the video stopped playing, remove the class
		vTools.clips[currentIndex].isPlaying = false;

		// make sure the changes are reflected in the DOM
		$scope.$apply();

		// in case this is the last clip in the collection or autoAdvance is turned off, do nothing
		if (currentIndex + 1 === vTools.clips.length || !vTools.autoAdvance) {
			return;
		}

		video.parentElement.classList.add('loading');

		// wait for 3 seconds and then play the next clip
		window.setTimeout(function() {
			vTools.playClip(currentIndex + 1);
			// make sure the changes are reflected in the DOM
			$scope.$apply();
			video.parentElement.classList.remove('loading');
		}, 3000);
	});
});