import { useId } from 'react';
import type { Problem } from './types';
export default function Diagram({ problem: p }: { problem: Problem }) {
  const grid = useId();
  if (p.shape === 'text') return <div className="fractionvisual">{p.visual}<span>Make a plan before calculating.</span></div>;
  const rectangle = p.shape === 'rectangle' || p.shape === 'square';
  const y = p.shape === 'triangle' ? 40 : 55;
  return <><svg viewBox="0 0 310 240" role="img" aria-label={`${p.shape} with base ${p.a} and height ${p.b}. Diagram not to scale.`}>
    <defs><pattern id={grid} width="19" height="26" patternUnits="userSpaceOnUse"><path d="M19 0H0V26" fill="none" stroke="#668e49" strokeWidth=".8" /></pattern></defs>
    <g fill="#d6ecb4" stroke="#517b3a" strokeWidth="2">{p.shape === 'triangle' ? <path d="M45 180 L245 180 L145 40 Z" /> : p.shape === 'parallelogram' ? <path d="M40 180 L220 180 L265 55 L85 55 Z" /> : <rect x="55" y="50" width="190" height="130" />}</g>
    {rectangle ? <rect x="55" y="50" width="190" height="130" fill={`url(#${grid})`} opacity=".65" /> : <path d={`M145 ${y}V180h14v-14h-14`} fill="none" stroke="#436935" strokeDasharray="4 4" />}
    <g fill="#305632" fontFamily="Arial" fontSize="18" textAnchor="middle"><text x="150" y="212">{p.a}</text><text x={rectangle ? 278 : 170} y="120">{p.b}</text></g>
  </svg><p>Measurements use the units in the question.<br />Diagram is not to scale; grid is illustrative.</p></>;
}
