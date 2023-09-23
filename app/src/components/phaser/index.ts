import { Game, Types } from 'phaser';
import { EventBus, GameEvents, MainPGame } from './scenes/main';
import { Player } from '../../utils/common';

declare global {
  interface Window {
    sizeChanged: () => void;
    PUBLIC_URL: string;
    game: Phaser.Game;
    player: Player;
    p1GridPos: {x:number,y:number};
    p2GridPos: {x:number,y:number};
  }
}
  
const gameConfig: Types.Core.GameConfig = {
	title: 'Phaser game tutorial',
  type: Phaser.AUTO,
  parent: 'game',
  backgroundColor: '#351f1b',
  scale: {
    mode: Phaser.Scale.ScaleModes.NONE,
    width: window.innerWidth,
    height: window.innerHeight,
  },
  physics: {
    default: 'arcade',
    arcade: {
      debug: false,
    },
  },
  render: {
    antialiasGL: true,
    pixelArt: false,
  },
  callbacks: {
    postBoot: () => {
      window.sizeChanged();
    },
  },
  canvasStyle: `display: block; width: 100%; height: 100%;`,
  autoFocus: true,
  audio: {
    disableWebAudio: false,
  },
  scene: [MainPGame],
};

window.game = new Game(gameConfig);


window.sizeChanged = () => {
    if (window.game.isBooted) {
      setTimeout(() => {
        window.game.scale.resize(window.innerWidth, window.innerHeight);
        window.game.canvas.setAttribute(
          'style',
          `display: block; width: ${window.innerWidth}px; height: ${window.innerHeight}px;`,
        );
        EventBus.emit(GameEvents.ScreenResize,{});
      }, 100);
    }
  };
  window.onresize = () => window.sizeChanged();
