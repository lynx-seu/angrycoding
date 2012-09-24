/******************************************************************************

This is a very simple binary tree based bin packing algorithm that is initialized
with a fixed width and height and will fit each block into the first node where
it fits and then split that node into 2 parts (down and right) to track the
remaining whitespace.

Best results occur when the input blocks are sorted by height, or even better
when sorted by max(width,height).

Inputs:
------

  w:       width of target rectangle
  h:      height of target rectangle
  blocks: array of any objects that have .w and .h attributes

Outputs:
-------

  marks each block that fits with a .fit attribute pointing to a
  node with .x and .y coordinates

Example:
-------

  var blocks = [
    { w: 100, h: 100 },
    { w: 100, h: 100 },
    { w:  80, h:  80 },
    { w:  80, h:  80 },
    etc
    etc
  ];

  var packer = new Packer(500, 500);
  packer.fit(blocks);

  for(var n = 0 ; n < blocks.length ; n++) {
    var block = blocks[n];
    if (block.fit) {
      Draw(block.fit.x, block.fit.y, block.w, block.h);
    }
  }


******************************************************************************/

Packer = {};

    Packer.removeRect = function(cells, left, top, width, height) {
      for (var i = top; i < top + height; i++) {
        for (var j = left; j < left + width; j++) {
          var hash = (i + '.' + j);
          delete cells[hash];
        }
      }
    };

      Packer.canFitRect = function(cells, left, top, width, height) {
        for (var i = top; i < top + height; i++) {
          for (var j = left; j < left + width; j++) {
            var hash = (i + '.' + j);
            if (!cells[hash]) return false;
          }
        }
        return true;
      };

    Packer.pack = function(width, height, tiles) {

        var maxWidth = 0;
        var maxHeight = 0;

        var output = [];
        var waiting = [];
        var emptyCells = {};

        for (var i = 0; i < height; i++) {
          for (var j = 0; j < width; j++) {
            var hash = (i + '.' + j);
            emptyCells[hash] = [i, j];
          }
        }

        while (tiles.length) {
          var tile = tiles.shift();
          var emptyCell = null;

          for (var hash in emptyCells) {
            emptyCell = emptyCells[hash];
            break;
          }

          if (Packer.canFitRect(
            emptyCells,
            emptyCell[1],
            emptyCell[0],
            tile['width'],
            tile['height'])) {

            while (waiting.length) {
              tiles.unshift(waiting.shift());
            }

            tile['left'] = emptyCell[1];
            tile['top'] = emptyCell[0];

            var mw = tile['left'] + tile['width'];
            var mh = tile['top'] + tile['height'];

            if (mw > maxWidth) maxWidth = mw;
            if (mh > maxHeight) maxHeight = mh;

            output.push(tile);

            Packer.removeRect(
              emptyCells,
              emptyCell[1],
              emptyCell[0],
              tile['width'],
              tile['height']
            );
          } else {
            waiting.push(tile);
          }
        }

        return {
          width: maxWidth,
          height: maxHeight,
          items: output
        };
      };