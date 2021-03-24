import {
  forceCollide,
  forceRadial,
  forceSimulation,
  forceManyBody,
  forceCenter,
  forceLink,
  forceY,
} from './_snowpack/pkg/d3.js'
import scrollama from './_snowpack/pkg/scrollama.js'
import {
  BoxGeometry,
  BufferGeometry,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
} from './_snowpack/pkg/three.js'
import { BufferGeometryUtils } from './_snowpack/pkg/three/examples/jsm/utils/BufferGeometryUtils.js'
import { Easing, Tween, autoPlay } from './_snowpack/pkg/es6-tween.js'

const red = 'pink' //'#762304'
const gray = '#88958d'

const scroller = scrollama();

const graphicsContainer = document.querySelector('.graphics-container') //window.d = select('.graphics-container')
const graphicsWidth = graphicsContainer.clientWidth

const numberOfPeopleWhoWillSleepInJailTonight = 60000
const numberOfPeopleWhoAreUnsentenced = 43000

const numberOfPeoplePerDot = 1
const numberOfDots = numberOfPeopleWhoWillSleepInJailTonight / numberOfPeoplePerDot
const numberOfDotsUnsentenced = numberOfPeopleWhoAreUnsentenced / numberOfPeoplePerDot

const geometries = window.g = []
const nodes = window.n = []
for (let i = 1; i < numberOfDots; i++) {
  nodes.push({
    id: i,
    representsUnsentenced: i <= numberOfDotsUnsentenced
  })
}

const scene = new Scene()
const camera = window.c = new PerspectiveCamera( 75, graphicsWidth / 500, 0.1, 1000 )

const renderer = new WebGLRenderer()
renderer.setSize(graphicsWidth, 500)
graphicsContainer.appendChild(renderer.domElement)



// const simulation = window.s = forceSimulation(nodes)
//     // .force("charge", forceManyBody().strength(1.3))
//     // .force("center", forceCenter(0, 0))
//     .force("collide", forceCollide(2))
// const sourceGeometry = new BoxGeometry()
// const material = new MeshBasicMaterial({ color: red })

// nodes.forEach((node, i) => {
//   const geometry = sourceGeometry.clone()  
//   const mesh = new Mesh(geometry, material)
//   mesh.position.set(node.x, node.y, 0)

//   geometries[i] = mesh
//   scene.add(mesh)
// })

// // const cubes = BufferGeometryUtils.mergeBufferGeometries(geometries)

// // console.log('cubes', cubes)

// camera.position.z = 1000

// function animate() {
// 	requestAnimationFrame(animate)
// 	renderer.render(scene, camera)
// }

// animate()

// // simulation.on('tick', () => { 
// //   nodes.forEach((node, i) => {
// //     const geometry = geometries[i]
// //     geometry.position.set(node.x, node.y, 0)
// //   })
// // })

// async function show60KInJail() {
//   camera.position.z = 250
//   simulation.force("charge", forceManyBody().strength(1.3))
//   simulation.force('radial', forceRadial().radius(10))
//   geometries.forEach(geo => {
//     geo.material.color.set(red)
//   })
// }

// async function threeQuartersNoCrime() {
//   const r = d => {
//     if (d.representsUnsentenced) return 1
//     return 300
//   }
//   // const y = d => {
//   //   if (d.representsUnsentenced) return 10
//   //   return 300
//   // }
//   // const radialForce = forceRadial().x(d => {
//   //   if (d.representsUnsentenced) return 10
//   //   return 100
//   // })

//   camera.position.z = 450
//   simulation.force("charge", forceManyBody().strength(-2.2))
//   simulation.force('radial', forceRadial().radius(r))
//   nodes.forEach((node, i) => {
//     if (!node.representsUnsentenced) return

//     const geo = geometries[i]
//     geo.material.color.set(gray)
//   })
// }

// const functions = {
//   '60k-in-jail': show60KInJail,
//   '3-4-no-crime': threeQuartersNoCrime,
// }

// // setup the instance, pass callback functions
// scroller
//   .setup({
//     step: ".step",
//   })
//   .onStepEnter((response) => {
//       const { element } = response
//       const step = element.getAttribute('data-step')
//       const fn = functions[step]

//       if (!fn) return

//       fn()
//   })
//   .onStepExit((response) => {
//     // { element, index, direction }
//   });

// // setup resize event
// window.addEventListener("resize", scroller.resize);

// // const t = window.t = d3.transition('x').duration(750)

// // t.tween(function() {
// //   console.log('started')
// //   let i = 0;
// //   return t => {
// //     i += 1
// //     console.log({ t, i })
// //     return i
// //   }
// // })

// // console.log(t)