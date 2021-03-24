import dayjs from './_snowpack/pkg/dayjs.js'
import * as d3 from './_snowpack/pkg/d3.js'
import scrollama from './_snowpack/pkg/scrollama.js'

const red = '#762304'
const gray = '#88958d'

const scroller = scrollama();
const graphicsContainer = document.querySelector('.graphics-container')
const graphicsWidth = graphicsContainer.clientWidth
const svg = d3.select(graphicsContainer).append('svg')
const g = svg.append('g')
const gg = g.append('g').attr('transform', `translate(0 200)`)

svg.attr('width', graphicsWidth).attr('height', 400)

const parseDate = d3.timeParse('%m/%d/%Y')
const firstDate = parseDate('03/01/2020')
const lastDate = parseDate('02/15/2021')
const daysBetween = dayjs(lastDate).diff(dayjs(firstDate), 'days')
const everyTenthDay = []
const daysBetweenRange = []
const pixelsPerDay = 25
const msPerDay = 62

for (let i = 0; i < daysBetween; i++) {
    daysBetweenRange.push(i)

    if (i % 10 === 0) {
        everyTenthDay.push(i)
    }
}

const scale = d3.scaleTime().domain([firstDate, lastDate]).range([0, daysBetween * pixelsPerDay])
const line = g.append('line').attr('x1', 0).attr('y1', 200).attr('y2', 200).attr('stroke', red).attr('stroke-width', 1.5)
const ticks = gg.selectAll('line.tick')
    .data(daysBetweenRange)
const dayLabels = gg.selectAll('text.label')
    .data(everyTenthDay)

ticks.enter()
    .append('line')
    .classed('tick', true)
    .attr('y1', -5)
    .attr('y2', 5)
    .attr('x1', d => {
        const dd = dayjs(firstDate).add(d, 'day')
        return scale(dd)
    })
    .attr('x2', d => {
        const dd = dayjs(firstDate).add(d, 'day')
        return scale(dd)
    })
    .attr('stroke', 'rgb(232, 229, 229)')
    .attr('opacity', 0)

dayLabels.enter()
    .append('text')
    .classed('label', true)
    .attr(`transform`, d => {
        const date = dayjs(firstDate).add(d, 'day')
        const scaled = scale(date)
        return `translate(${scaled - 20} -25)`
    })
    .attr('opacity', 0)
    .text((d, i) => {
        if (i + 1 === everyTenthDay.length) return `${d} days waiting`
        return `${d} days`
    })

g.attr('transform', `translate(${graphicsWidth / 2} 0)`)



scroller
  .setup({
    step: ".step",
  })
  .onStepEnter((response) => {
      const { element } = response
      const date = element.getAttribute('data-date')
      const label = element.getAttribute('data-label')

      if (!date && !label) return

      const parsed = parseDate(date)
      const days = dayjs(parsed).diff(firstDate, 'days')
      const scaled = scale(parsed)
      const duration = msPerDay * days
      const t = d3.transition().duration(duration).ease(d3.easeLinear)
      const tickLength = Math.ceil(duration / days)

      gg.selectAll('line.tick')
        .data(daysBetweenRange)
        .transition()
        .duration((d, i) => {
            return i * tickLength
        })
        .attr('opacity', (d, i) => {
            if (i < days) return .5
            return 0
        })

        gg.selectAll('text.label')
        .data(everyTenthDay)
        .transition(t)
        .attr('opacity', (d, i) => {
            if (d < days) return .75
            return 0
        })

      const newGTransform = (graphicsWidth / 2) - scaled

      g.transition(t).attr('transform', `translate(${newGTransform} 0)`)
      line.transition(t).attr('x2', scaled)

      const text = g.append('text').text(label)
      const textWidth = text.node().getBBox().width
      text.attr(`transform`, `translate(${scaled - (textWidth / 2)} 235)`)
      g.append('line')
        .attr('x1', scaled)
        .attr('x2', scaled)
        .attr('y1', 190)
        .attr('y2', 210)
        .attr('stroke', red)
  })
  .onStepExit((response) => {
    // { element, index, direction }
  });

// setup resize event
window.addEventListener("resize", scroller.resize);