/* eslint-disable wrap-iife */
/**
 * Albion bot
 * v 1.0
 *
 * @author Vyacheslav B
 */

const cv = require('opencv4nodejs');
const robot = require('robotjs');

const width = 1920;
const height = 1080;

/**
 * main function
*/
const aoFisher = (async function () {
  const float = await cv.imreadAsync(`${__dirname}/bobberInWater8.png`);
  const board = await cv.imreadAsync(`${__dirname}/board.jpg`);
  const floatboard = await cv.imreadAsync('./floatboard.png');
  const floatGray = float.bgrToGray();
  const boardGray = board.bgrToGray();
  const floatboardGray = floatboard.bgrToGray();
  return {
    run: async function () {
      console.log(`Start Albion Fisher`);
      const coordFloat = await floatSearch(floatGray);
      while (true) {
      	if(coordFloat == null){ break;}
        let coord = await searchThing(floatGray);
        console.log(coord.maxLoc.y, coordFloat.maxLoc.y + 7);
        if (coord.maxLoc.y  >= coordFloat.maxLoc.y + 7) {
          console.log("click");
          console.log('hook start');
          await hookSearch(boardGray, floatboardGray);
          console.log('hook end');
          break;
        }
      }
      aoFisher.then((func)=>func.run())
    },
  };
})();

aoFisher.then((func) => func.run());

async function floatSearch(float) {
  for (let i = 0; i < 3; i++) {
    let coord = await searchThing(float);
    console.log(coord.maxVal);
    if (coord.maxVal <= 0.7) {
      console.log("click");
      robot.mouseToggle("down");
      sleep(1700);
      robot.mouseToggle("up");
      sleep(1000);
    } else {
      return coord;
    }
  }
  return null; 
}

async function searchThing(thing) {
  const screenshot = robot.screen.capture(0, 0, width, height);
  const imageRaw = new cv.Mat(screenshot.image, height, width, cv.CV_8UC4);
  const image = imageRaw.bgrToGray();
  const matched = image.matchTemplate(thing, 5);
  const minMax = matched.minMaxLoc();
  return minMax;
}

async function hookSearch(board, float) {
  console.log("start hook");
  robot.mouseClick("left");
  for (let i = 0; i < 5; i++) {
    sleep(500);
    let coordBoard = await searchThing(float);
    console.log(coordBoard.maxVal);
    if (coordBoard.maxVal > 0.60) {
      await hook(board, float);
      break;
    }
  }
  console.log("end hook");
}

async function hook(board, float) {
  console.log("hook!!!");
  robot.mouseToggle("down");
  const minMax = await searchThing(board);
  let down = 0;
  let maxLoc = minMax.maxLoc.x + (board.cols / 2) + 10 ;

  while (true) {
    const minMaxfloat = await searchThing(float);
    if (minMaxfloat.maxLoc.x <= maxLoc) {
      robot.mouseToggle("down");
    }
 if (minMaxfloat.maxLoc.x > maxLoc + 10) {
     robot.mouseToggle("up");
    }
    console.log(
      minMax.maxLoc.x,
      "-",
      minMaxfloat.maxLoc.x,
      "-",maxLoc, "-",
      minMax.maxLoc.x + board.cols
    );
    console.log(minMaxfloat.maxVal);
   if( minMaxfloat.maxLoc.x > minMax.maxLoc.x + board.cols){   break; }
  }  
  
}

function sleep(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}
