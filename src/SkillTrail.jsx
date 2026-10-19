import React, {useEffect, useId, useRef, useState} from 'react';

// Measure real milestone positions so wrapping text cannot detach the sketch
// from its markers. Scroll changes only paint variables, not React layout.
export function SkillTrail({container}) {
  const [geometry, setGeometry] = useState(null);
  const svg = useRef(null);
  const paint = useRef(() => {});
  const gradient = useId();
  useEffect(() => {
    const root = container.current;
    if (!root) return;
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    let points = [], frame = 0, resizeFrame = 0;
    function update() {
      frame = 0;
      const rect = root.getBoundingClientRect();
      const progress = motion.matches ? 1 : Math.max(0, Math.min(1, (innerHeight * .76 - rect.top) / rect.height));
      root.style.setProperty('--trail-progress', progress);
      svg.current?.querySelectorAll('.skill-trail__branch-progress').forEach((branch, index) => {
        const amount = motion.matches ? 1 : Math.max(0, Math.min(1, (innerHeight * .82 - rect.top - points[index].y) / 120));
        branch.style.setProperty('--branch-progress', amount);
      });
    }
    paint.current = update;
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    function measure() {
      resizeFrame = 0;
      const rect = root.getBoundingClientRect();
      const stops = [...root.querySelectorAll('.skill-stop')];
      points = stops.map(stop => {
        const marker = stop.querySelector('.skill-stop__marker').getBoundingClientRect();
        const body = stop.querySelector('.skill-stop__body').getBoundingClientRect();
        return {x:marker.left + marker.width / 2 - rect.left, y:marker.top + marker.height / 2 - rect.top,
          end:body.left > marker.left ? body.right - rect.left - 8 : body.left - rect.left + 8};
      });
      if (!points.length || !rect.width) return;
      const bend = rect.width < 700 ? 18 : 85;
      const first = points[0], last = points.at(-1);
      let spine = `M ${first.x + bend * .5} ${first.y - 15} Q ${first.x - bend * .8} ${first.y - 14} ${first.x} ${first.y}`;
      points.slice(1).forEach((point, index) => {
        const prev = points[index], gap = (point.y - prev.y) * .42, direction = index % 2 ? -1 : 1;
        spine += ` C ${prev.x + bend * direction} ${prev.y + gap}, ${point.x - bend * direction} ${point.y - gap}, ${point.x} ${point.y}`;
      });
      spine += ` Q ${last.x - bend * .5} ${last.y + 35} ${last.x - bend * .25} ${Math.min(rect.height - 8, last.y + 70)}`;
      const branches = points.map(point => {
        const direction = point.end > point.x ? 1 : -1;
        return `M ${point.x} ${point.y} C ${point.x + direction * 45} ${point.y - 7}, ${point.end - direction * 70} ${point.y - 5}, ${point.end} ${point.y - 12}`;
      });
      setGeometry({width:rect.width,height:rect.height,spine,branches});
      schedule();
    }
    const scheduleMeasure = () => { if (!resizeFrame) resizeFrame = requestAnimationFrame(measure); };
    const observer = typeof ResizeObserver === 'function' ? new ResizeObserver(scheduleMeasure) : null;
    observer?.observe(root);
    addEventListener('resize', scheduleMeasure);
    addEventListener('scroll', schedule, {passive:true});
    motion.addEventListener('change', schedule);
    measure();
    return () => {
      observer?.disconnect();
      removeEventListener('resize', scheduleMeasure);
      removeEventListener('scroll', schedule);
      motion.removeEventListener('change', schedule);
      cancelAnimationFrame(frame); cancelAnimationFrame(resizeFrame);
      paint.current = () => {};
    };
  }, [container]);
  // Geometry renders asynchronously; apply the current reading position once
  // SVG branches exist, including on a direct visit partway down the page.
  useEffect(() => { if (geometry) paint.current(); }, [geometry]);
  if (!geometry) return null;
  return <svg ref={svg} className="skill-trail" viewBox={`0 0 ${geometry.width} ${geometry.height}`} aria-hidden="true">
    <defs><linearGradient id={gradient} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#b39ad9"/><stop offset=".5" stopColor="#8abdad"/><stop offset="1" stopColor="#d5bd74"/></linearGradient></defs>
    <path className="skill-trail__track" d={geometry.spine}/>
    <path className="skill-trail__progress" d={geometry.spine} pathLength="1" stroke={`url(#${gradient})`}/>
    {geometry.branches.map((path,index) => <g key={index}>
      <path className="skill-trail__branch" d={path}/>
      <path className="skill-trail__branch-progress" d={path} pathLength="1" stroke={`url(#${gradient})`}/>
    </g>)}
  </svg>;
}
