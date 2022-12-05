interface GraphicalElement {
  draw: () => void;
  update: (deltaTime: number) => void;
  x: number;
  y: number;
}

export default GraphicalElement;
