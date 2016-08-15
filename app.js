var app = angular.module('vToolsApp', []);

app.controller('vToolsController', function($scope, $compile) {
	var vTools = this,
		video = document.getElementById('video'),
		timeline = document.querySelector('.timeline'),
		videoDuration,
		currentClip = {},
		currentIndex = 0;

	vTools.clips = [];

	vTools.init = function() {
		videoDuration = video.duration;
		video.style.width = video.videoWidth + 'px';
		video.style.height = video.videoHeight + 'px';
		video.removeEventListener('loadedmetadata', vTools.init);

		timeline.style.width = video.videoWidth + 'px';

		vTools.clips.push({
			title: 'Full Video',
			start: 0,
			end: video.duration,
			readOnly: true
		},
		{
			title: 'clip 1',
			start: 1,
			end: 10
		},
		{
			title: 'clip 2',
			start: 15,
			end: 22
		});
		if (localStorage.length > 0) {
			for (var key in localStorage) {
				var clipData = JSON.parse(localStorage[key]);
				// console.log(clipData);

				vTools.clips.push({
					title: clipData.title,
					start: clipData.start,
					end: clipData.end
				});
			}
		}

		// for (var i = 0; i < vTools.clips.length; i++) {
		// 	var clip = vTools.clips[i];
		// 	if (clip.readOnly) {
		// 		continue;
		// 	}
		// 	vTools.createTimelineClip(clip, i);
		// }

		$scope.$apply();
	};

	vTools.handleKeypress = function(_evt) {
		// console.log(_evt.which);
		// console.log($scope)
		switch(_evt.which) {
			case 219: 
				// prev
				if (currentIndex !== 0) {
					vTools.playClip(currentIndex - 1);
					$scope.$apply();
				}
				break;
			case 221: 
				// next
				if (currentIndex !== vTools.clips.length - 1) {
					// alert('calling next with currentIndex ' + (currentIndex + 1));
					vTools.playClip(currentIndex + 1);
					$scope.$apply();
				}
				break;
			default:
		}
	};

	vTools.getTimelineClipValues = function(_start, _end) {
		var width = Math.round((_end - _start) / videoDuration * 100);
		var left = Math.round(_start / videoDuration * 100);
		return {
			width: width,
			left: left
		}
	};

	vTools.checkFields = function(_index) {
		var clip = _index ? vTools.clips[_index] : vTools;
		console.log(clip);
		if (!clip.title || !clip.start || !clip.end) {
			alert('Please fill in all fields.');
			return false;
		}

		clip.timelineClipWidth = vTools.getTimelineClipValues(clip.start, clip.end).width;
		clip.timelineClipLeft = vTools.getTimelineClipValues(clip.start, clip.end).left;

		clip.edit = false;
		return true;
	};

	vTools.removeTimelineClip = function() {

	};

	vTools.addClip = function() {
		if (!vTools.checkFields()) {
			return false;
		}

		var width = Math.round((vTools.end - vTools.start) / videoDuration * 100);
		var left = Math.round(vTools.start / videoDuration * 100);

		vTools.clips.push({
			title: vTools.title,
			start: vTools.start,
			end: vTools.end,
			timelineClipWidth: vTools.getTimelineClipValues(vTools.start, vTools.end).width,
			timelineClipLeft: vTools.getTimelineClipValues(vTools.start, vTools.end).left
		});
		vTools.title = vTools.start = vTools.end = '';
	};

	vTools.editClip = function(_index, _newTitle, _newStart, _newEnd) {
		vTools.clips[_index].title = _newTitle;
		vTools.clips[_index].start = _newStart;
		vTools.clips[_index].end = _newEnd;
		vTools.clips[_index].edit = false;
	};

	vTools.removeClip = function(_index) {
		if (confirm('Are you sure you want to delete this clip? It will also be removed from localStorage.')) {
			vTools.clips.splice(_index, 1);
		}
		localStorage.removeItem(_index);
	};

	vTools.playClip = function(_index) {
		// alert('called playClip with _index ' + _index);
		var clip = vTools.clips[_index],
			newSrc = video.getAttribute('src');
		newSrc = newSrc.indexOf('#') === -1 ? newSrc : newSrc.substr(0, newSrc.indexOf('#'));
		newSrc += '#t=' + clip.start + ',' + clip.end;
		video.setAttribute('src', newSrc);
		video.play();
		vTools.clips[currentIndex].isPlaying = false;
		currentIndex = _index;
		vTools.clips[currentIndex].isPlaying = true;
	};

	vTools.saveClip = function(_index) {
		localStorage.setItem(_index, JSON.stringify(vTools.clips[_index]));
		alert('Clip saved to localStorage.');
	}

	document.body.addEventListener('keyup', vTools.handleKeypress);
	video.addEventListener('loadedmetadata', vTools.init);
	video.addEventListener('pause', function() {
		console.log('pause');
	});


/*
	vTools.remaining = function() {
		var count = 0;
		angular.forEach(vTools.todos, function(todo) {
			count += todo.done ? 0 : 1;
		});
		return count;
	};

	vTools.archive = function() {
		var oldTodos = vTools.todos;
		vTools.todos = [];
		angular.forEach(oldTodos, function(todo) {
			if (!todo.done) {
				vTools.todos.push(todo);
			}
		});
	};

	vTools.createTimelineClip = function(_clip, _index) {
		var width = Math.round((_clip.end - _clip.start) / videoDuration * 100);
		var left = Math.round(_clip.start / videoDuration * 100);
		var clipTimeline = document.createElement('div');
		var label = document.createElement('span');
		label.innerText = '{{clip.title}}';
		clipTimeline.setAttribute('ng-click', 'vTools.playClip(' + _index + ')');
		clipTimeline.appendChild(label);
		clipTimeline.style.width = width + '%';
		clipTimeline.style.left = left + '%';
		timeline.appendChild(clipTimeline);

		// compile to pick up ng-click on new element
		$compile(clipTimeline)($scope);
	};
*/
});