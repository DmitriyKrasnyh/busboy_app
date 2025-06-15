import React from 'react';
import { Wall } from '../types';

const DEFAULT_COLOR = '#475569';

interface Props {
  wall: Wall;
}

export const StaticWall: React.FC<Props> = ({ wall }) => {
  const length = Math.hypot(wall.end.x - wall.start.x, wall.end.y - wall.start.y);
  const angle = Math.atan2(wall.end.y - wall.start.y, wall.end.x - wall.start.x);

  const style: React.CSSProperties = {
    position: 'absolute',
    left: wall.start.x,
    top: wall.start.y,
    width: length,
    height: wall.thickness,
    transform: `rotate(${angle}rad)`,
    transformOrigin: '0 0',
    borderRadius: wall.thickness / 2,
    background: wall.color ?? DEFAULT_COLOR,
  };

  return <div style={style} />;
};
