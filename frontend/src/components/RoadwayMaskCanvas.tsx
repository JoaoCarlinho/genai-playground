import { useActions, useValues } from 'kea';
import { canvasLogic } from '../CanvasLogic';
import { useEffect, useMemo, useRef, useState } from 'react';
import  blackX6 from '../assets/white-x6.png';

interface CompassPosition {
  x: number;
  y: number;
}
const person: CompassPosition = { x: 100, y: 200 };
type Coordinate = { x: number; y: number };
type Mask = {
  name:string,
  type: 'building' | 'roadway' | 'field';
  coords: Coordinate[];
  orientation?: 'horizontal' | 'vertical'
};
type CarImageFile = {
  name: string;
  image_file_type: 'image/png' | 'image/jpg';
};
const carImageFiles: CarImageFile[] = [
  { name: 'black-x6.png', image_file_type: 'image/png' },
  { name: 'blue-x6.png', image_file_type: 'image/png' },
  { name: 'navy-x6.png', image_file_type: 'image/png' }
];
type Commuter = {
  type: 'car' | 'bike' | 'inline skater' | 'bus' | 'taxi' | 'pedestrian';
  position: Coordinate;
  destination: Coordinate;
  speed: {
    xDirection: number,
    yDirection: number,
    velocity:number,
    cardinalDirection: string
  };
  color: string;
  isblinking?: boolean
};
type AirCraft = {
  type: 'drone' | 'helicopter' | 'airplane';
  position: Coordinate;
  destination: Coordinate;
  speed: {
    xDirection: number,
    yDirection: number,
    velocity:number,
    cardinalDirection: string
  };
  color: string;
  isblinking?: boolean
};
type BuildingType = {
  id: string;
  name: string;
};
type RoadwayType = {
  id: string;
  type: 'roadway' | 'building';
};

import defaultMasks from '../../public/masks.json';

function square(num: number): number {
  return num * num;
}

function getCardlinalDirection(xDirection: number, yDirection: number): string {
  if (xDirection > 0) return 'east';
  if (xDirection < 0) return 'west';
  if (yDirection > 0) return 'south';
  if (yDirection < 0) return 'north';
  return 'stationary';
}

function pointInRect(point: Coordinate, rect: Coordinate[]) {
  const x1 = Math.min(rect[0].x, rect[3].x);
  const y1 = Math.min(rect[0].y, rect[1].y);
  const x2 = Math.max(rect[1].x, rect[2].x);
  const y2 = Math.max(rect[2].y, rect[3].y);
  return point.x >= x1 && point.x <= x2 && point.y >= y1 && point.y <= y2;
}

function getIntersectionDirections(
  pos: Coordinate,
  roadwayMasks: Mask[],
  step: number = 2,
  canvasWidth: number = 800,
  canvasHeight: number = 800
): Coordinate[] {
  const directions: Coordinate[] = [];
  const candidates = [
    { x: pos.x + step, y: pos.y }, // right
    { x: pos.x - step, y: pos.y }, // left
    { x: pos.x, y: pos.y + step }, // down
    { x: pos.x, y: pos.y - step }, // up
  ];
  for (const c of candidates) {
    if (
      c.x >= 0 &&
      c.x < canvasWidth &&
      c.y >= 0 &&
      c.y < canvasHeight &&
      roadwayMasks.some((mask) => pointInRect(c, mask.coords))
    ) {
      directions.push(c);
    }
  }
  return directions;
}

const BLINK_SIZE = 10;
const FPS = 15;

function makeRoadways(canvasWidth = 800, canvasHeight = 800, spacing = 250) {
  let roadwayMasks: Mask[] = [];
  for (let i = 0; i <= canvasHeight / spacing; i++) {
    // draw roadway every 100px horizontally
    roadwayMasks.push({
      name: `Township-${(i + 1) * 10 }-EW`,
      type: 'roadway',
      orientation: 'horizontal',
      coords: 
      [
        { x: 0, y: spacing * i + 10 }, { x: canvasWidth, y: spacing * i + 10 }, { x: canvasWidth, y: spacing * i + 15 }, { x: 0, y: spacing * i + 15 }
      ]
    });
  }

  // draw roadway every spacingpx vertically
  for (let j = 0; j <= canvasWidth / spacing; j++) {
    roadwayMasks.push({
      name: `Township-${(j + 1) * 10 + 5}-NS`,
      type: 'roadway', 
      orientation: 'vertical',
      coords: 
      [
        { x: spacing * j + 10, y: 0 }, { x: spacing * j + 15, y: 0 }, { x: spacing * j + 15, y: canvasHeight }, { x: spacing * j + 10, y: canvasHeight }
      ]
    });
  }
  return roadwayMasks
}

function rectsOverlap(a: Coordinate[], b: Coordinate[]) {
  const ax1 = Math.min(a[0].x, a[3].x);
  const ay1 = Math.min(a[0].y, a[1].y);
  const ax2 = Math.max(a[1].x, a[2].x);
  const ay2 = Math.max(a[2].y, a[3].y);

  const bx1 = Math.min(b[0].x, b[3].x);
  const by1 = Math.min(b[0].y, b[1].y);
  const bx2 = Math.max(b[1].x, b[2].x);
  const by2 = Math.max(b[2].y, b[3].y);

  return !(ax2 <= bx1 || ax1 >= bx2 || ay2 <= by1 || ay1 >= by2);
}

function buildingArea(mask: Mask) {
  const w = Math.abs(mask.coords[1].x - mask.coords[0].x);
  const h = Math.abs(mask.coords[2].y - mask.coords[1].y);
  return w * h;
}

function fillBuildings(
  maxBuildingWidth = 75,
  maxBuildingHeight = 45,
  canvasWidth = 800,
  canvasHeight = 800,
  count = 40
) {
  let buildingMasks: Mask[] = [];
  let attempts = 0;
  while (buildingMasks.length < count && attempts < count * 10) {
    attempts++;
    let buildingMask: Mask;
    const x = Math.floor(Math.random() * (canvasWidth - 100));
    const y = Math.floor(Math.random() * (canvasHeight - 100));
    const buildingWidth = Math.floor(Math.random() * (maxBuildingWidth - 1) + 9);
    const buildingHeight = Math.floor(Math.random() * (maxBuildingHeight - 1) + 9);
    const name = buildingMasks.length == 1 ? 'Home'
      : buildingMasks.length == 2 ? 'Office'
      : buildingMasks.length == 3 ? 'Mall'
      : buildingMasks.length == 4 ? 'School'
      : buildingMasks.length == 5 ? 'Hospital'
      : buildingMasks.length == 6 ? 'Factory'
      : buildingMasks.length == 7 ? 'Library'
      : buildingMasks.length == 8 ? 'Stadium'
      : buildingMasks.length == 9 ? 'Airport'
      : buildingMasks.length == 10 ? 'Gas Station'
      : `Building-${buildingMasks.length + 1}`;

    buildingMask = {
      name,
      type: 'building',
      coords: [
        { x, y },
        { x: x + buildingWidth, y },
        { x: x + buildingWidth, y: y + buildingHeight },
        { x, y: y + buildingHeight },
      ],
    };

    // Check overlap with existing buildings
    let overlapIdx = -1;
    for (let i = 0; i < buildingMasks.length; i++) {
      if (rectsOverlap(buildingMasks[i].coords, buildingMask.coords)) {
        overlapIdx = i;
        break;
      }
    }

    if (overlapIdx === -1) {
      buildingMasks.push(buildingMask);
    } else {
      // If overlap, keep only the larger building
      const areaNew = buildingArea(buildingMask);
      const areaOld = buildingArea(buildingMasks[overlapIdx]);
      if (areaNew > areaOld) {
        // Replace the old building with the new one
        buildingMasks.splice(overlapIdx, 1, buildingMask);
      }
      // If the new building is smaller, do not add it
      // (so nothing to do here)
    }
  }

  return buildingMasks;
}

// After generating roadway and building masks, fill remaining space with fields
// function fillFields(width: number, height: number, cellSize: number = 20) {
//   const fieldMasks: Mask[] = [];
//   for (let x = 0; x < width; x += cellSize) {
//     for (let y = 0; y < height; y += cellSize) {
//       const cell: Coordinate[] = [
//         { x, y },
//         { x: Math.min(x + cellSize, width), y },
//         { x: Math.min(x + cellSize, width), y: Math.min(y + cellSize, height) },
//         { x, y: Math.min(y + cellSize, height) },
//       ];
//       // Check overlap with any existing mask
//       const overlaps = defaultMasks.some(mask => rectsOverlap(mask.coords, cell));
//       if (!overlaps) {
//         fieldMasks.push({ type: 'field', coords: cell });
//       }
//     }
//   }
//   return fieldMasks;
// }

function fillFields(width: number, height: number, cellSize: number = 10, roadwayMasks: Mask[] = [], buildingMasks: Mask[] = []) {
  // Step 1: Build a grid of cells and mark which are available for field
  const cols = Math.ceil(width / cellSize);
  const rows = Math.ceil(height / cellSize);
  const grid: boolean[][] = Array.from({ length: rows }, () => Array(cols).fill(true));

  // Mark cells that overlap with any mask as unavailable
  const checkMaps = [...roadwayMasks, ...buildingMasks];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const cell: Coordinate[] = [
        { x: col * cellSize, y: row * cellSize },
        { x: Math.min((col + 1) * cellSize, width), y: row * cellSize },
        { x: Math.min((col + 1) * cellSize, width), y: Math.min((row + 1) * cellSize, height) },
        { x: col * cellSize, y: Math.min((row + 1) * cellSize, height) },
      ];
      const overlaps = checkMaps.some(mask => rectsOverlap(mask.coords, cell));
      if (overlaps) grid[row][col] = false;
    }
  }

  // Step 2: Merge adjacent available cells into larger rectangles
  const visited: boolean[][] = Array.from({ length: rows }, () => Array(cols).fill(false));
  const fieldMasks: Mask[] = [];

  function bfs(startRow: number, startCol: number) {
    // Find the largest rectangle starting from (startRow, startCol)
    let maxRow = startRow;
    let maxCol = startCol;

    // Expand horizontally
    while (maxCol + 1 < cols && grid[startRow][maxCol + 1] && !visited[startRow][maxCol + 1]) {
      maxCol++;
    }
    // Expand vertically for each column in the horizontal range
    let endRow = startRow;
    let canExpand = true;
    while (canExpand && endRow + 1 < rows) {
      for (let c = startCol; c <= maxCol; c++) {
        if (!grid[endRow + 1][c] || visited[endRow + 1][c]) {
          canExpand = false;
          break;
        }
      }
      if (canExpand) endRow++;
    }

    // Mark all cells in the rectangle as visited
    for (let r = startRow; r <= endRow; r++) {
      for (let c = startCol; c <= maxCol; c++) {
        visited[r][c] = true;
      }
    }

    // Create the mask polygon for the rectangle
    const x1 = startCol * cellSize;
    const y1 = startRow * cellSize;
    const x2 = Math.min((maxCol + 1) * cellSize, width);
    const y2 = Math.min((endRow + 1) * cellSize, height);
    const name = fieldMasks.length == 1 ? 'metro park'
      : fieldMasks.length == 2 ? 'central park'
      : fieldMasks.length == 3 ? 'playground'
      : fieldMasks.length == 4 ? 'soccer field'
      : fieldMasks.length == 5 ? 'baseball field'
      : fieldMasks.length == 6 ? 'golf course'
      : fieldMasks.length == 7 ? 'farm'
      : fieldMasks.length == 8 ? 'orchard'
      : fieldMasks.length == 9 ? 'vineyard'
      : fieldMasks.length == 10 ? 'meadow'
      : fieldMasks.length == 11 ? 'pasture'
      : fieldMasks.length == 12 ? 'ranch'
      : fieldMasks.length == 13 ? 'cemetery'
      : fieldMasks.length == 14 ? 'arboretum'
      : fieldMasks.length == 15 ? 'botanical garden'
      : fieldMasks.length == 16 ? 'nature reserve'
      : fieldMasks.length == 17 ? 'wildlife sanctuary'
    : `Field-${fieldMasks.length + 1}`;

    fieldMasks.push({
      name,
      type: 'field',
      coords: [
        { x: x1, y: y1 },
        { x: x2, y: y1 },
        { x: x2, y: y2 },
        { x: x1, y: y2 },
      ],
    });
  }

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      if (grid[row][col] && !visited[row][col]) {
        bfs(row, col);
      }
    }
  }

  return fieldMasks;
}

const RoadwayMasksCanvas = () => {
  const { width, height, showMasks } = useValues(canvasLogic);
  const { setWidth, setHeight, setShowMasks } = useActions(canvasLogic);
  const [spacing, setSpacing] = useState(250);
  const [personMoving, setPersonMoving] = useState(false);
  const [carImageFile, setCarImageFile] = useState<CarImageFile>({name: 'black-x6.png', image_file_type: 'image/png'});
  const handleCarImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCarImageFile({ name: e.target.value as string, image_file_type: 'image/png' });
  };

  // Commuter state
  const [person, setPerson] = useState<Commuter | null>(null);
  const [blinkOn, setBlinkOn] = useState(false);

  const roadwayMasks = useMemo(
    () => makeRoadways(width, height, spacing),
    [width, height, spacing]
  );
  const buildingMasks = useMemo(
    () => fillBuildings(75, 45, width, height, width * height / 50000),
    [width, height]
  );
  const fieldMasks = useMemo(
    () => fillFields(width, height, 20, roadwayMasks, buildingMasks),
    [width, height, roadwayMasks, buildingMasks]
  );
  const allMasks = useMemo(
    () => [...defaultMasks, ...roadwayMasks, ...fieldMasks, ...buildingMasks],
    [defaultMasks, roadwayMasks, fieldMasks, buildingMasks]
  );

  const Car = () => (
    <img
      src={blackX6} // replace with the actual file path
      alt="Car"
      width={40}
      height={30} />
  );

  // Find a starting point on a roadway
  useEffect(() => {
    // Find the first roadway mask and set the person at its center
    if (roadwayMasks.length > 0) {
      const mask = roadwayMasks[0];
      const x = Math.floor((mask.coords[0].x + mask.coords[1].x) / 2);
      const y = Math.floor((mask.coords[0].y + mask.coords[2].y) / 2);
      // initialize speed  in a random direction with random x and y components between 0 and 10
      const xDirection = Math.floor(Math.random() * 2) + 1; // speed between 1 and 2
      const yDirection = 0 //Math.floor(Math.random() * 2) + 2; // speed between 1 and 10
      const velocity = Math.sqrt(square(xDirection) + square(yDirection));
      const cardinalDirection = xDirection > 0 ? 'east' : xDirection < 0 ? 'west' : yDirection > 0 ? 'south' : 'north';

      setPerson({
        type: 'car',
        position: { x, y },
        destination: { x, y },
        speed: {xDirection, yDirection, velocity, cardinalDirection},
        color: 'orange',
        isblinking: false,
      });
    }
  }, [width, height, spacing, person]);

  // Store previous direction in a ref so it persists across renders
  const directionRef = useRef<Coordinate>({ x: 1, y: 0 })
  // Track if we just made a turn at an intersection
  const stepRef = useRef<number>(Math.max(Math.abs(directionRef.current.x), Math.abs(directionRef.current.y)) || 1);
  const boostedStepRef = useRef<boolean>(false);
  let initialSpeed:{xDirection: number, yDirection: number} = { xDirection: 1, yDirection: 0 };
  // Animation loop for movement and blinking

useEffect(() => {
  if (!person || !directionRef) return;

  const movePerson = () => {
    setBlinkOn((prev) => !prev);

    const currentPos = person.position;
    const currentDir = directionRef.current;

    // Find all roadway masks under the commuter
    const masksUnder = roadwayMasks.filter(mask => pointInRect(currentPos, mask.coords));

    // Determine allowed directions based on all orientations present
    let allowedDirections: Coordinate[] = [];
    let step = stepRef.current;

    const hasHorizontal = masksUnder.some(m => m.orientation === 'horizontal');
    const hasVertical = masksUnder.some(m => m.orientation === 'vertical');

    if (hasHorizontal) {
      allowedDirections.push({ x: step, y: 0 }, { x: -step, y: 0 });
    }
    if (hasVertical) {
      allowedDirections.push({ x: 0, y: step }, { x: 0, y: -step });
    }

    // Filter allowed directions to those that stay on a roadway mask
    const possible = allowedDirections
      .map(dir => ({
        x: currentPos.x + dir.x,
        y: currentPos.y + dir.y,
        dir,
      }))
      .filter(p =>
        p.x >= 0 &&
        p.x < width &&
        p.y >= 0 &&
        p.y < height &&
        roadwayMasks.some(mask => pointInRect({ x: p.x, y: p.y }, mask.coords))
      );

    // Filter out the reverse direction
    const reverseDir = { x: -currentDir.x, y: -currentDir.y };
    const filtered = possible.filter(
      p => !(p.dir.x === reverseDir.x && p.dir.y === reverseDir.y)
    );

    let nextDir = currentDir;
    let nextPos = {
      x: currentPos.x + currentDir.x,
      y: currentPos.y + currentDir.y,
    };

    // If blocked, reverse direction
    if (
      nextPos.x < 0 ||
      nextPos.x >= width ||
      nextPos.y < 0 ||
      nextPos.y >= height ||
      !roadwayMasks.some((mask) => pointInRect(nextPos, mask.coords))
    ) {
      if (possible.length > 0) {
        // Reverse direction if possible
        const reverse = possible.find(
          p => p.dir.x === reverseDir.x && p.dir.y === reverseDir.y
        );
        if (reverse) {
          nextDir = reverse.dir;
          nextPos = { x: reverse.x, y: reverse.y };
        } else {
          nextPos = { ...currentPos };
        }
      } else if (currentPos.x + currentDir.x < 16 || currentPos.x + currentDir.x > width - 32) {
          // If so, reverse the x-direction
          nextDir = { x: -currentDir.x, y: 0 };
      } else {
        nextPos = { ...currentPos };
      }
      if (boostedStepRef.current) {
        stepRef.current = 1;
        boostedStepRef.current = false;
        initialSpeed = { xDirection: 1, yDirection: 0 }; // Reset the initial speed
      } else {
        // If filtered.length === 1, keep moving in the same direction
        const nextDir = currentDir;
        const nextPos = { x: currentPos.x + nextDir.x, y: currentPos.y + nextDir.y };
        setPerson((prev) => 
          prev ? { ...prev, position: nextPos, speed: { xDirection: nextDir.x, yDirection: nextDir.y, velocity: Math.sqrt(square(nextDir.x) + square(nextDir.y)), cardinalDirection: getCardlinalDirection(nextDir.x, nextDir.y)} } : prev);
      }
    } else if (masksUnder.length > 1 && filtered.length > 1) {
      // At intersection (pixel shared by two masks), pick a new direction (not reverse)
      stepRef.current = 2;
      boostedStepRef.current = true;

      // Recompute allowedDirections with boosted step
      let boostedDirections: Coordinate[] = [];
      if (hasHorizontal) {
        boostedDirections.push({ x: 2, y: 0 }, { x: -2, y: 0 });
      }
      if (hasVertical) {
        boostedDirections.push({ x: 0, y: 2 }, { x: 0, y: -2 });
      }
      const boostedPossible = boostedDirections
        .map(dir => ({
          x: currentPos.x + dir.x,
          y: currentPos.y + dir.y,
          dir,
        }))
        .filter(p =>
          p.x >= 0 &&
          p.x < width &&
          p.y >= 0 &&
          p.y < height &&
          roadwayMasks.some(mask => pointInRect({ x: p.x, y: p.y }, mask.coords))
        );
      const boostedFiltered = boostedPossible.filter(
        p => !(p.dir.x === reverseDir.x && p.dir.y === reverseDir.y)
      );
      const chosen = boostedFiltered[Math.floor(Math.random() * boostedFiltered.length)];
      nextDir = chosen ? chosen.dir : currentDir;
      nextPos = chosen ? { x: chosen.x, y: chosen.y } : nextPos;
    } else {
      if (boostedStepRef.current) {
        stepRef.current = 1;
        boostedStepRef.current = false;
        initialSpeed = { xDirection: 1, yDirection: 0 }; // Reset the initial speed
      }
    }
    // If filtered.length === 1, keep moving in the same direction
    // If not at an intersection and initial speed is null, set it to 2
    if (!boostedStepRef.current && initialSpeed.xDirection === 0 && initialSpeed.yDirection === 0) {
      initialSpeed = { xDirection: 1, yDirection: 0 };
    }
    // If the commuter is near an edge, introduce some randomness in their movement
    if (currentPos.x < 10 || currentPos.x > width - 15) {
      // Randomly choose a new direction within ±1 from the current direction
      const newXDir = Math.floor(Math.random() * 2);
      if (newXDir === 0 && currentDir.x < 0) {
        nextDir = { x: -currentDir.x, y: 0 };
      } else if (newXDir === 1 && currentDir.x > 0) {
        nextDir = { x: currentDir.x, y: 0 };
      }
    }

    // Repeat the same logic for vertical orientation
    if (currentPos.y < 10 || currentPos.y > height - 15) {
      const newYDir = Math.floor(Math.random() * 2);
      if (newYDir === 0 && currentDir.y < 0) {
        nextDir = { x: 0, y: -currentDir.y };
      } else if (newYDir === 1 && currentDir.y > 0) {
        nextDir = { x: 0, y: currentDir.y };
      }
    }

    // Update the position
    nextPos = { x: currentPos.x + nextDir.x, y: currentPos.y + nextDir.y };
    directionRef.current = nextDir;

    if (personMoving) {
      setPerson((prev) => 
        prev ? {
          ...prev,
          position: nextPos,
          speed: {
            xDirection: nextDir.x,
            yDirection: nextDir.y,
            velocity: Math.sqrt(square(nextDir.x) + square(nextDir.y)),
            cardinalDirection: getCardlinalDirection(nextDir.x, nextDir.y) },
            isblinking: blinkOn } : prev);
    }
  };

  const interval = setInterval(movePerson, 1000 / FPS);
  return () => clearInterval(interval);
}, [person, width, height, roadwayMasks, personMoving]);

  return (
    <div>
      <div style={{ marginBottom: 8 }}>
      <button
        onClick={() => setPersonMoving(!personMoving)}
        style={{ marginBottom: 8 }}
      >
        {personMoving ? 'reset' : 'start'}
      </button>
        <label>
          Canvas Width:&nbsp;
          <input
            type="number"
            value={width}
            min={10}
            max={800}
            onChange={e => setWidth(Number(e.target.value))}
            style={{ marginRight: 16 }}
          />
        </label>
        <label>
          Canvas Height:&nbsp;
          <input
            type="number"
            value={height}
            min={10}
            max={1500}
            onChange={e => setHeight(Number(e.target.value))}
          />
        </label>
        <label>
          Canvas Spacing:&nbsp;
          <input
            type="number"
            value={spacing}
            min={10}
            max={500}
            step={10}
            onChange={e => setSpacing(Number(e.target.value))}
            style={{ marginRight: 16 }}
          />
        </label>
      </div>
      <button
        onClick={() => setShowMasks(!showMasks)}
        style={{ marginBottom: 8 }}
      >
        {showMasks ? 'Hide Masks' : 'Show Masks'}
      </button>
      {person && (
          <div
          >
            {person.position.x}, {person.position.y} <br />
            {person.speed.cardinalDirection} at {person.speed.velocity.toFixed(2)} px/frame
          </div>
        )}
      <div>
      <label> Toggle Commuter Type</label>
      <button onClick={() => {
        person && person.type !== 'car' && setPerson({...person, type: 'pedestrian', color: 'orange'});
        person && person.type === 'pedestrian' && setPerson({...person, type: 'car'});
      }}>Car</button>
      <label>Car Image File:</label>
      <input
      type="file"
      accept="image/png"
      onChange={e => {
        const file = e.target.files?.[0];
        if (file && (file.type === "image/png" || file.type === "image/jpg") && e.target.files && e.target.files[0]) {
          setCarImageFile({
            name: e.target.files[0].name,
            image_file_type: file.type as "image/png" | "image/jpg",
          });
        }
      }}
    />
    <button onClick={() => setCarImageFile({ name: '', image_file_type: 'image/png' })}>Reset</button>
      {/* <Car/> */}
      {/* {carImageFile.image_file_type === 'image/png' && (
        <img
          src="src/assets/black-x6.png" // replace with the actual file path
          alt="Roadway Masks"
        />
      )} */}
    </div>
      <div
        style={{
          border: '1px solid #333',
          width: width,
          height: height,
          position: 'relative',
          background: '#fafafa',
        }}
      >
        {showMasks &&
          allMasks.map((mask, idx) => (
            <div
              key={idx}
              style={{
                position: 'absolute',
                left: Math.min(...mask.coords.map(c => c.x)),
                top: Math.min(...mask.coords.map(c => c.y)),
                width: Math.abs(mask.coords[1].x - mask.coords[0].x),
                height: Math.abs(mask.coords[2].y - mask.coords[1].y),
                background:
                  mask.type === 'building'
                    ? 'rgba(255,0,0, 1)'
                    : mask.type === 'roadway'
                      ? 'rgba(128,128,128,0.5)'
                      : 'rgba(0,255,0,0.5)',
                border: '1px solid #222',
                zIndex: mask.type === 'roadway' ? 3
                : mask.type === 'field' ? 1
                : 10,
              }}
            >
              <span style={{ fontSize: 10, color: '#222' }}>{mask.name}</span>
            </div>
          ))}
          {/* Blinking person */}
        {person && (
          <div
            style={{
              position: 'absolute',
              left: person.position.x - BLINK_SIZE / 2,
              top: person.position.y - BLINK_SIZE / 2,
              width: BLINK_SIZE,
              height: BLINK_SIZE,
              background: person.type === 'car' ? '###' : person.color, // no background for car, use image instead
              opacity: 1,
              zIndex: 10,
              boxShadow: person.type === 'car' ? 'none' : '0 0 8px 2px #00f',
            }}
          >
            {person.type === 'car' ? (
              <Car />
            ): null}
          </div>
        )}
      </div>
    </div>
  );
};

export default RoadwayMasksCanvas;