import React from 'react';

// Small original pen-style drawings, kept decorative so headings stay concise.
export default function Sketch({kind = 'chip', className = ''}) {
  return <svg className={'sketch sketch--' + kind + ' ' + className} viewBox="0 0 80 80" aria-hidden="true" focusable="false" fill="none">
    {kind === 'rocket' ? <>
      <path className="sketch-wash" d="M12 48C5 30 23 10 45 13c24 2 31 23 18 42S22 73 12 48Z"/>
      <g className="sketch-rocket">
        <path d="M28 49c0-17 10-27 29-31 0 19-7 32-24 37l-5-6Z"/>
        <circle cx="45" cy="32" r="5"/>
        <path d="m29 37-11 7 10 5m14 2-6 13-3-10M24 56l-7 9m13-5-4 8"/>
      </g>
      <path d="m63 54 1 8m-5-4 9-1M17 21l3 5m-4 0 5-4"/>
    </> : kind === 'star' ? <>
      <path className="sketch-wash" d="M11 35C9 11 44 6 61 21s12 41-9 46S14 59 11 35Z"/>
      <path d="m40 17 6 16 17 4-15 10 1 18-14-12-17 6 7-17-10-14 18 1 7-12Z"/>
      <path d="m63 15 1 7m-4-3 7-1M11 62l4 5m-5 0 6-4"/>
    </> : <>
      <path className="sketch-wash" d="M18 16c15-11 42-4 47 15s-6 38-27 37S2 39 18 16Z"/>
      <g className="sketch-orbit"><ellipse cx="40" cy="40" rx="34" ry="15" transform="rotate(-32 40 40)"/><circle className="sketch-satellite" cx="69" cy="22" r="3"/></g>
      <rect x="27" y="27" width="26" height="26" rx="5" transform="rotate(7 40 40)"/>
      <path d="m34 35 12 2-1 10-12-2 1-10ZM34 19l-1 8m10-7-1 7m10-5-1 7M32 53l-1 8m10-7-1 8m10-8-1 7M20 31l7 1m-8 9 7 1m-5 8 6 1m26-16 8 1m-8 9 8 1"/>
    </>}
  </svg>;
}
