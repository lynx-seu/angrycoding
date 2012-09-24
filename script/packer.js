(function() {

	function removeRect(cells, left, top, width, height) {
		for (var i = top; i < top + height; i++) {
			for (var j = left; j < left + width; j++) {
				delete cells[i + '.' + j];
			}
		}
	}

	function canFitRect(cells, left, top, width, height) {
		for (var i = top; i < top + height; i++) {
			for (var j = left; j < left + width; j++) {
				if (!cells[i + '.' + j]) return false;
			}
		}
		return true;
	}

	function Packer(width, height, tiles) {

		var maxWidth = 0, maxHeight = 0;
		var output = [], waiting = [], emptyCells = {};
		var tile, emptyCell, hash, mWidth, mHeight;

		for (var i = 0; i < height; i++) {
			for (var j = 0; j < width; j++) {
				emptyCells[i + '.' + j] = [i, j];
			}
		}

		while (tiles.length) {
			tile = tiles.shift();
			emptyCell = null;

			for (hash in emptyCells) {
				emptyCell = emptyCells[hash];
				break;
			}

			if (!emptyCell) continue;

			if (!canFitRect(emptyCells,
				emptyCell[1], emptyCell[0],
				tile['width'], tile['height'])) {
				waiting.push(tile);
				continue;
			}

			while (waiting.length) {
				tiles.unshift(waiting.shift());
			}

			tile['left'] = emptyCell[1];
			tile['top'] = emptyCell[0];
			mWidth = tile['left'] + tile['width'];
			mHeight = tile['top'] + tile['height'];
			if (mWidth > maxWidth) maxWidth = mWidth;
			if (mHeight > maxHeight) maxHeight = mHeight;

			output.push(tile);

			removeRect(emptyCells,
				emptyCell[1], emptyCell[0],
				tile['width'], tile['height']
			);

		}

		return {
			width: maxWidth,
			height: maxHeight,
			items: output
		};
	};

	window['Packer'] = Packer;

})();