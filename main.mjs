import * as THREE from 'three';
import {TrackballControls} from 'three/addons/controls/TrackballControls.js';

const SCENE_HELPERS = true; // for debugging

const scene = new THREE.Scene();

// Camera
const CAMERA_DIST = 15;
const camera = new THREE.PerspectiveCamera(
	75,
	window.innerWidth / window.innerHeight,
	0.6,
	1200
);
// Set camera position
camera.position.x = CAMERA_DIST;
camera.position.y = CAMERA_DIST;
camera.position.z = CAMERA_DIST;

// Renderer
const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setClearColor('#708090'); // Set background color
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement); // Add renderer to HTML as a canvas element

// Make Canvas Responsive
window.addEventListener('resize', () => {
	renderer.setSize(window.innerWidth, window.innerHeight); // Update size
	camera.aspect = window.innerWidth / window.innerHeight; // Update aspect ratio
	camera.updateProjectionMatrix(); // Apply changes
});

// Create box:
const BOX_SIZE = 10;
const FACE_THICKNESS = 0.001;
const cellColors = {
	red: new THREE.MeshStandardMaterial({color: 0xff0000}),
	green: new THREE.MeshStandardMaterial({color: 0x00ff00}),
	blue: new THREE.MeshStandardMaterial({color: 0x0000ff}),
	cyan: new THREE.MeshStandardMaterial({color: 0x00ffff}),
	magenta: new THREE.MeshStandardMaterial({color: 0xff00ff}),
	yellow: new THREE.MeshStandardMaterial({color: 0xffff00}),
	black: new THREE.MeshStandardMaterial({color: 0x000000}),
};

const getGeometryForFace = (thickness, faceIndex, size = BOX_SIZE) => {
	const geometry = [
		[thickness, size, size],
		[-thickness, size, size],
		[size, thickness, size],
		[size, -thickness, size],
		[size, size, thickness],
		[size, size, -thickness],
	];
	return faceIndex === false ? geometry : geometry[faceIndex];
};

getGeometryForFace(FACE_THICKNESS, false).forEach((boxGeometry, index) => {
	const geometry = new THREE.BoxGeometry(...boxGeometry);
	const material = Object.entries(cellColors)[index];
	console.log(index, material[0]);
	const box = new THREE.Mesh(geometry, material[1]);
	box.position.set(...getGeometryForFace(BOX_SIZE / 2, index, 0));
	scene.add(box);
});

// Lights
const lightValues = [
	{color: 0xffffff, intensity: 8, dist: 12, x: 0, y: 0, z: 8},
	{color: 0xffffff, intensity: 8, dist: 12, x: 0, y: 0, z: -8},
	{color: 0xffffff, intensity: 8, dist: 12, x: 0, y: 8, z: 0},
	{color: 0xffffff, intensity: 8, dist: 12, x: 0, y: -8, z: 0},
	{color: 0xffffff, intensity: 8, dist: 12, x: 8, y: 0, z: 0},
	{color: 0xffffff, intensity: 8, dist: 12, x: -8, y: 0, z: 0},
];
lightValues.forEach(lightValue => {
	const light = new THREE.PointLight(
		lightValue['color'],
		lightValue['intensity'],
		lightValue['dist']
	);
	light.position.set(lightValue['x'], lightValue['y'], lightValue['z']);
	scene.add(light);

	if (SCENE_HELPERS) {
		// Add helper to visualize the lights
		const lightHelper = new THREE.PointLightHelper(light);
		scene.add(lightHelper);
	}

	return light;
});

//Trackball Controls for Camera
const controls = new TrackballControls(camera, renderer.domElement);
controls.rotateSpeed = 4;
controls.dynamicDampingFactor = 0.15;

// Axes Helper
if (SCENE_HELPERS) {
	// X axis = red, Y axis = green, Z axis = blue
	const axesHelper = new THREE.AxesHelper(BOX_SIZE * 1.5);
	scene.add(axesHelper);
}

const CELL_SIZE = 1;
const loadData = configData => {
	// for (let i = 0; i < 1000000; i++) { // 1 million test
		configData.forEach(({owner, cells}, index) => {
			cells.forEach(({face, location, color}) => {
				const offset = BOX_SIZE / 2 - location[0] - CELL_SIZE / 2;// - i;
				const origin = getGeometryForFace(
					BOX_SIZE / 2 + FACE_THICKNESS,
					face,
					offset
				);
        
				const geometry = new THREE.BoxGeometry(
          ...getGeometryForFace(FACE_THICKNESS, face, CELL_SIZE)
				);
        
				const cube = new THREE.Mesh(geometry, cellColors[color]);
				cube.position.set(...origin);
				scene.add(cube);
			});
		});
	// }
  console.log('done');
};

const loader = new THREE.FileLoader();
loader.load(
	'./config.json',
	function onLoad(configData) {
		console.log('configData', JSON.parse(configData));
		loadData(JSON.parse(configData));
	},
	function onProgress(xhr) {
		console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
	},
	function onError(err) {
		console.log('An error happened', err);
	}
);

const rendering = () => {
	// Rerender every time the page refreshes (auto-pauses when focus is lost)
	requestAnimationFrame(rendering);

	// Update trackball controls
	controls.update();

	// Constantly rotate box
	// scene.rotation.z -= 0.005;
	// scene.rotation.x -= 0.01;

	renderer.render(scene, camera);
};

// init
rendering();
