var resizeTimer = null;
var resizeDelay = 200;
var animationDelay = 300;
var boardMaxWidth = 10;
var animationEasing = 'easeOutExpo';
var documentObj = $(document);

documentObj.ready(function() {

	var gadgetBoard = $('.gadget-board');
	var gadgetWindow = $('.gadget-window');
	var gadgetWindowPointer = $('.gadget-window-pointer');
	var activeContainer = $('.gadget-container-active');
	var gadgetBoardSettings = gadgetBoard.data('settings');
	var gadgetWidth = gadgetBoardSettings.gadget.width;
	var gadgetHeight = gadgetBoardSettings.gadget.height;
	var gadgetSpacing = gadgetBoardSettings.gadget.spacing;

	function isNumber(value) {
		return (typeof(value) === 'number');
	}

	function isArray(value) {
		return (value instanceof Array);
	}

	function range(start, end) {
		var result = [];
		var start = parseFloat(start);
		var end = parseFloat(end);
		if (!isNumber(start) || !isNumber(end) ||
			start % 1 !== 0 ||
			end % 1 !== 0) {
			return result;
		}
		if (start > end) {
			for (var i = start; i >= end; i -= 1) result.push(i);
		} else if (start < end) {
			for (var i = start; i <= end; i += 1) result.push(i);
		} else result.push(start);
		return result;
	}

	function getGadgetByCellRow(cell, row) {
		var className = '';
		if (isNumber(row)) className += ('.gadget-row-' + row);
		if (isNumber(cell)) className += ('.gadget-cell-' + cell);
		if (isArray(row)) {
			className += '.gadget-row-';
			className += row.join('.gadget-row-');
		}
		if (isArray(cell)) {
			className += '.gadget-cell-';
			className += row.join('.gadget-cell-');
		}
		if (!className) return null;
		var gadgets = $(className, activeContainer);
		return (gadgets.length > 0 ? gadgets : null);
	}

	function expandGadget(gadget, callback) {
		var gadgetSettings = gadget.data('settings');
		var maxWidth = gadgetSettings.maximized.width;
		var maxHeight = gadgetSettings.maximized.height;
		var targetWidth = maxWidth * gadgetWidth;
		targetWidth  += (maxWidth - 1) * gadgetSpacing;
		var targetHeight = maxHeight * gadgetHeight;
		targetHeight += (maxHeight - 1) * gadgetSpacing;
		if (getGadgetByCellRow(
			gadgetSettings.left + maxWidth - 1,
			gadgetSettings.top + maxHeight - 1)) return gadget.animate({
			width: targetWidth, height: targetHeight
		}, animationDelay, animationEasing, callback);
		else if (getGadgetByCellRow(
			gadgetSettings.left + maxWidth - 1,
			gadgetSettings.top - maxHeight + 1) && getGadgetByCellRow(
			gadgetSettings.left + maxWidth - 1,
			gadgetSettings.top)) return gadget.animate({
			width: targetWidth, height: targetHeight,
			marginTop: gadget.outerHeight() - targetHeight
		}, animationDelay, animationEasing, callback);
		else if (getGadgetByCellRow(
			gadgetSettings.left - maxWidth + 1,
			gadgetSettings.top - maxHeight + 1)) return gadget.animate({
			width: targetWidth, height: targetHeight,
			marginLeft: gadget.outerWidth() - targetWidth,
			marginTop: gadget.outerHeight() - targetHeight
		}, animationDelay, animationEasing, callback);
		else if (getGadgetByCellRow(
			gadgetSettings.left + gadgetSettings.width - 1,
			gadgetSettings.top + maxHeight - 1)) return gadget.animate({
			width: targetWidth, height: targetHeight,
			marginLeft: gadget.outerWidth() - targetWidth
		}, animationDelay, animationEasing, callback);
	}

	function collapseGadget(gadget, callback) {
		var gadgetSettings = gadget.data('settings');
		var targetWidth = gadgetSettings.width * gadgetWidth;
		var targetHeight = gadgetSettings.height * gadgetHeight;
		targetWidth += (gadgetSettings.width - 1) * gadgetSpacing;
		targetHeight += (gadgetSettings.height - 1) * gadgetSpacing;
		gadget.animate({marginTop: 0, marginLeft: 0,
			width: targetWidth, height: targetHeight
		}, animationDelay, animationEasing, callback);
	}

	function maximizeGadget(gadget, callback) {
		var maximizeUp = false;
		var gadgetSettings = gadget.data('settings');
		var nextRowId = (gadgetSettings.top + gadgetSettings.height - 1);
		if (!getGadgetByCellRow(null, nextRowId + 1)) {
			maximizeUp = true;
			nextRowId = gadgetSettings.top - 1;
		}

		var nextRow = getGadgetByCellRow(null, nextRowId);
		nextRow = nextRow.last().nextAll('.gadget');

		var overlay = getGadgetByCellRow(null, [nextRowId, nextRowId + 1]);
		if (overlay) {
			overlay = overlay.clone();
			overlay.insertAfter(gadget);
			overlay.addClass('gadget-overlay');
			overlay.css({clip: 'rect(' + (
				gadget.outerHeight()
			) + 'px, 10000px, 10000px, 0px)'});
			nextRow = nextRow.add(overlay);
		}

		// gadgetWindow.insertAfter(gadget);

		gadgetWindowPointer.css({marginLeft: (
			gadget.position().left +
			gadget.outerWidth() / 2
		)});
		if (maximizeUp) {
			gadgetWindow.addClass('gadget-window-opened-bottom');
		} else {
			gadgetWindow.addClass('gadget-window-opened-top');
		}

		gadgetWindow.addClass('gadget-window-opened');
		var gadgetWindowHeight = gadgetWindow.outerHeight();
		gadgetWindow.css({height: 0, top: (
			gadget.offset().top + (
				maximizeUp ?
				-gadgetSpacing :
				gadget.outerHeight()
			)
		)}).animate({
			height: gadgetWindowHeight
		}, animationDelay, animationEasing);

		nextRow.animate({marginTop: (
			gadgetWindowHeight -
			gadgetSpacing
		)}, animationDelay, animationEasing);

		activeContainer.animate({height: (
			activeContainer.outerHeight() +
			gadgetWindowHeight -
			gadgetSpacing
		)}, animationDelay, animationEasing, callback);
	}

	function minimizeGadget(gadget, callback) {
		var gadgetSettings = gadget.data('settings');
		var gadgetWindowHeight = gadgetWindow.outerHeight();
		var nextRowId = (gadgetSettings.top + gadgetSettings.height - 1);
		if (!getGadgetByCellRow(null, nextRowId + 1)) {
			nextRowId = gadgetSettings.top - 1;
		}
		var nextRow = getGadgetByCellRow(null, nextRowId);
		nextRow = nextRow.last().nextAll('.gadget');
		var overlay = getGadgetByCellRow(null, [nextRowId, nextRowId + 1]);
		if (overlay) nextRow = nextRow.add(overlay);
		nextRow.animate({marginTop: 0}, animationDelay, animationEasing,
			function() { $('.gadget-overlay').remove(); }
		);
		activeContainer.animate({height: (
			activeContainer.outerHeight() -
			gadgetWindowHeight + gadgetSpacing
		)}, animationDelay, animationEasing);
		gadgetWindow.animate({height: 0}, animationDelay, animationEasing,
			function() {
				gadgetWindow.css({height: ''});
				gadgetWindow.removeClass('gadget-window-opened');
				gadgetWindow.removeClass('gadget-window-opened-top');
				gadgetWindow.removeClass('gadget-window-opened-bottom');
				if (callback instanceof Function) callback();
			}
		);
	}

	function closeGadget(gadget, callback) {
		if (!gadget.hasClass('gadget-opened')) {
			if (callback instanceof Function) callback();
		} else if (gadget.hasClass('gadget-expanded')) {
			collapseGadget(gadget, function() {
				gadget.removeClass('gadget-opened');
				gadget.removeClass('gadget-expanded');
				gadgetBoard.removeClass('gadget-board-opened');
				if (callback instanceof Function) callback();
			});
		} else if (gadget.hasClass('gadget-maximized')) {
			minimizeGadget(gadget, function() {
				gadget.removeClass('gadget-opened');
				gadget.removeClass('gadget-maximized');
				gadgetBoard.removeClass('gadget-board-opened');
				if (callback instanceof Function) callback();
			});
		}
	}

	function openGadget(gadget, callback) {
		var openedGadget = $('.gadget-opened');
		if (openedGadget.is(gadget)) {
			if (callback instanceof Function) callback();
		} else if (openedGadget.length) {
			closeGadget(openedGadget, function() {
				openGadget(gadget, callback);
			});
		} else {
			gadget.addClass('gadget-opened');
			gadgetBoard.addClass('gadget-board-opened');
			if (!gadget.data('settings').maximized ||
				!expandGadget(gadget, function() {
					gadget.addClass('gadget-expanded');
					if (callback instanceof Function) callback();
				})
			) maximizeGadget(gadget, function() {
				gadget.addClass('gadget-maximized');
				if (callback instanceof Function) callback();
			});
		}
	}

	function setActiveContainer(container, callback) {
		var openedGadget = $('.gadget-opened');
		if (!openedGadget.length) {
			activeContainer.removeClass('gadget-container-active');
			activeContainer = container.addClass('gadget-container-active');
			if (callback instanceof Function) callback();
		} else closeGadget(openedGadget, function() {
			setActiveContainer(container, callback);
		});
	}

	function setBoardSize(cols, rows) {
		gadgetBoardSettings.cols = cols;
		gadgetBoardSettings.rows = rows;

		var newBoardWidth = cols * gadgetWidth;
		newBoardWidth += (cols - 1) * gadgetSpacing;
		gadgetBoard.animate({width: newBoardWidth}, animationDelay, animationEasing);

		var containers = gadgetBoardSettings.containers;
		for (var i = 0; i < containers.length; i++) {
			var container = containers[i];
			var gadgets = [].concat(container.gadgets);
			var packed = Packer.pack(cols, rows, gadgets);

			var containerObj = $('.gadget-container-' + container.name);
			var newContainerHeight = packed.height * gadgetHeight;
			newContainerHeight += (packed.height - 1) * gadgetSpacing;
			containerObj.animate({height: newContainerHeight}, animationDelay, animationEasing);

			var items = packed.items;
			var prevGadget = null;
			for (var j = 0; j < items.length; j++) {
				var gadget = items[j];
				var gadgetObj = $('#' + gadget.id);
				if (gadgetObj.length) {

					if (prevGadget) gadgetObj.insertAfter(prevGadget);

					prevGadget = gadgetObj;

					gadgetObj[0].className = [
						'gadget',
						'gadget-row-' + range(gadget.top, gadget.top + gadget.height - 1).join(' gadget-row-'),
						'gadget-cell-' + range(gadget.left, gadget.left + gadget.width - 1).join(' gadget-cell-')
					].join(' ');

					gadgetObj.data('settings', gadget);
					gadgetObj.animate({
						top: gadget.top * gadgetHeight + gadget.top * gadgetSpacing,
						left: gadget.left * gadgetWidth + gadget.left * gadgetSpacing
					}, animationDelay, animationEasing);
				} else {
					// console.error('foo');
				}
			}

		}

	}

	function resizeEvent() {
		var documentWidth = $(window).outerWidth();
		var boardCols = documentWidth / (gadgetWidth + gadgetSpacing);
		boardCols = Math.floor(boardCols);
		if (boardCols > boardMaxWidth) boardCols = boardMaxWidth;
		if (gadgetBoardSettings.cols === boardCols) return;
		var openedGadget = $('.gadget-opened');
		if (!openedGadget.length) {
			setBoardSize(boardCols, 10);
		} else closeGadget(openedGadget, function() {
			resizeEvent();
		});
	}

	documentObj.on('click', '.gadget', function() {
		var gadget = $(this);
		var settings = gadget.data('settings');
		gadget = getGadgetByCellRow(settings.left, settings.top);
		gadget.removeClass('gadget-hovered');
		gadget = gadget.not('.gadget-overlay');
		openGadget(gadget);
	});

	documentObj.on('mouseover', '.gadget', function() {
		var gadget = $(this);
		var settings = gadget.data('settings');
		var gadget = getGadgetByCellRow(settings.left, settings.top);
		gadget.addClass('gadget-hovered');
	});

	documentObj.on('mouseout', '.gadget', function() {
		var gadget = $(this);
		var settings = gadget.data('settings');
		var gadget = getGadgetByCellRow(settings.left, settings.top);
		gadget.removeClass('gadget-hovered');
	});

	documentObj.on('click', function(event) {
		var sender = $(event.target);
		if (sender.closest('.gadget').length) return;
		closeGadget($('.gadget-opened'));
	});

	documentObj.on('click', '.menu-item', function() {
		var menuItem = $(this);
		if (menuItem.hasClass('menu-item-active')) return;
		$('.menu-item-active').removeClass('menu-item-active');
		menuItem.addClass('menu-item-active');
		setActiveContainer($('.gadget-container-' + menuItem.data('name')));
	});

	$(window).on('resize', function() {
		clearTimeout(resizeTimer);
		resizeTimer = setTimeout(resizeEvent, resizeDelay);
	});

	documentObj.ready(resizeEvent);

});