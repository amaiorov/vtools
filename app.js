var app = angular.module('vToolsApp', []);

app.controller('vToolsController', function($scope, $compile) {
	var vTools = this,
		video = document.getElementById('video'),
		timeline = document.querySelector('.timeline'),
		videoDuration,
		currentClip = {},
		currentIndex = 0,
		currentId;

	vTools.clips = [];

	vTools.init = function() {
		videoDuration = video.duration;
		video.style.width = video.parentElement.style.width = video.videoWidth + 'px';
		video.style.height = video.videoHeight + 'px';
		video.removeEventListener('loadedmetadata', vTools.init);

		timeline.style.width = video.videoWidth + 'px';

		vTools.clips.push({
			id: 'fullvideo',
			title: 'Full Video',
			start: 0,
			end: video.duration,
			readOnly: true
		});

		if (localStorage.length > 0) {
			for (var key in localStorage) {
				var clipData = JSON.parse(localStorage[key]);
				// console.log(clipData);

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

		$scope.$apply();
	};

	vTools.handleKeypress = function(_evt) {
		// console.log(_evt.which);
		switch(_evt.which) {
			case 219: 
				// prev
				if (currentIndex > 1) {
					vTools.playClip(currentIndex - 1);
					$scope.$apply();
				}
				break;
			case 221: 
				// next
				if (currentIndex !== vTools.clips.length - 1) {
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

	vTools.getIndexById = function(_id) {
		for (var i = 0; i < vTools.clips.length; i++) {
			if (vTools.clips[i].id === _id) {
				return i;
			}
		}

	}

	vTools.checkFields = function(_id) {
		var clip = _id ? vTools.clips[vTools.getIndexById(_id)] : vTools;

		if (!clip.title || !clip.start || !clip.end) {
			alert('Please fill in all fields.');
			return false;
		}

		clip.timelineClipWidth = vTools.getTimelineClipValues(clip.start, clip.end).width;
		clip.timelineClipLeft = vTools.getTimelineClipValues(clip.start, clip.end).left;

		clip.edit = false;
		return true;
	};

	vTools.addClip = function() {
		if (!vTools.checkFields()) {
			return false;
		}

		var newId = Math.random().toString(16).substring(2);

		vTools.clips.push({
			id: newId,
			title: vTools.title,
			start: vTools.start,
			end: vTools.end,
			timelineClipWidth: vTools.getTimelineClipValues(vTools.start, vTools.end).width,
			timelineClipLeft: vTools.getTimelineClipValues(vTools.start, vTools.end).left
		});
		vTools.title = vTools.start = vTools.end = '';
	};

	vTools.editClip = function(_id, _newTitle, _newStart, _newEnd) {
		vTools.clips[_id].title = _newTitle;
		vTools.clips[_id].start = _newStart;
		vTools.clips[_id].end = _newEnd;
		vTools.clips[_id].edit = false;
	};

	vTools.removeClip = function(_id) {
		if (confirm('Are you sure you want to delete this clip? It will also be removed from localStorage.')) {
			vTools.clips.splice(vTools.getIndexById(_id), 1);
			localStorage.removeItem(_id);
		}
	};

	vTools.playClip = function(_id) {
		// alert('called playClip with _id ' + _id);
		
		var index = typeof(_id) === 'number' ? _id : vTools.getIndexById(_id),
			clip = vTools.clips[index],
			newSrc = video.getAttribute('src');
			
		currentId = currentId || _id;
		currentIndex = currentIndex || index;
		newSrc = newSrc.indexOf('#') === -1 ? newSrc : newSrc.substr(0, newSrc.indexOf('#'));
		newSrc += '#t=' + clip.start + ',' + clip.end;
		video.setAttribute('src', newSrc);
		video.play();
		vTools.clips[currentIndex].isPlaying = false;
		currentIndex = index;
		vTools.clips[currentIndex].isPlaying = true;
	};

	vTools.saveClip = function(_id) {
		localStorage.setItem(_id, JSON.stringify(vTools.clips[vTools.getIndexById(_id)]));
		alert('Clip saved to localStorage.');
	}

	document.body.addEventListener('keyup', vTools.handleKeypress);
	video.addEventListener('loadedmetadata', vTools.init);
	video.addEventListener('pause', function() {
		if (currentIndex + 1 === vTools.clips.length) {
			return;
		}
		console.log('load next in 3');
		video.parentElement.classList.add('loading');
		// alert('play next in 3 sec');
		window.setTimeout(function() {
			console.log('load next now');
			vTools.playClip(currentIndex + 1);
			video.parentElement.classList.remove('loading');
		}, 3000);
		// console.log('pause');
	});


/*
	vTools.clips.push({
		title: 'Full Video',
		start: 0,
		end: video.duration,
		readOnly: true
	},
	{
		title: 'clip 1',
		start: 1,
		end: 10,
		timelineClipWidth: 17,
		timelineClipLeft: 1.9
	},
	{
		title: 'clip 2',
		start: 15,
		end: 22,
		timelineClipWidth: 13,
		timelineClipLeft: 29.9
	});
	
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

	vTools.removeTimelineClip = function() {

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