namespace Utils {

  export function between(x: number, low: number, high: number) {
    return x >= low && x <= high;
  }

  export let KeyCode = {
    ENTER: 'Enter',
    LEFT_ARROW: 'a',
    UP_ARROW: 'w',
    RIGHT_ARROW: 'd',
    DOWN_ARROW: 's'
  };
}

export default Utils;
