import React, { useEffect, useRef } from 'react';

type Props = {
  addingEth: number;
  addingToken: number;
  ethReserve: number;
  tokenReserve: number;
  width: number;
  height: number;
};

export default function Curve(props: Props) {
  const ref = useRef<HTMLCanvasElement | null>(null);

  const { tokenReserve, ethReserve, addingToken, addingEth } = props;
  // @ts-ignore
  const drawArrow = (ctx, x1, y1, x2, y2) => {
    const [dx, dy] = [x1 - x2, y1 - y2];
    const norm = Math.sqrt(dx * dx + dy * dy);
    const [udx, udy] = [dx / norm, dy / norm];
    const size = norm / 15;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 + udx * size - udy * size, y2 + udx * size + udy * size);
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 + udx * size + udy * size, y2 - udx * size + udy * size);
    ctx.stroke();
  };

  useEffect(() => {
    const canvas = ref.current;

    if (!canvas) {
      return;
    }

    const textSize = 12;

    const width = canvas.width;
    const height = canvas.height;

    if (ethReserve && tokenReserve) {
      const k = ethReserve * tokenReserve;

      const ctx = canvas.getContext('2d');

      if (!ctx) {
        return;
      }

      ctx.clearRect(0, 0, width, height);

      let maxX = ethReserve * 4;
      const minX = 0;

      if (addingEth) {
        maxX = (ethReserve + addingEth) * 1.25;
      }

      const plotRatio = height / width;
      let maxY = tokenReserve * 4 * plotRatio;
      const minY = 0;
      if (addingToken) {
        maxY = (tokenReserve + addingToken) * 1.25;
      }

      const plotX = (x: number) => {
        return ((x - minX) / (maxX - minX)) * width;
      };

      const plotY = (y: number) => {
        return height - ((y - minY) / (maxY - minY)) * height;
      };

      ctx.strokeStyle = '#000000';
      ctx.fillStyle = '#000000';
      ctx.font = textSize + 'px Arial';
      // +Y axis
      ctx.beginPath();
      ctx.moveTo(plotX(minX), plotY(0));
      ctx.lineTo(plotX(minX), plotY(maxY));
      ctx.stroke();
      // +X axis
      ctx.beginPath();
      ctx.moveTo(plotX(0), plotY(minY));
      ctx.lineTo(plotX(maxX), plotY(minY));
      ctx.stroke();

      ctx.lineWidth = 2;
      ctx.beginPath();
      let first = true;
      for (let x = minX; x <= maxX; x += maxX / width) {
        // ///
        const y = k / x;
        // ///
        if (first) {
          ctx.moveTo(plotX(x), plotY(y));
          first = false;
        } else {
          ctx.lineTo(plotX(x), plotY(y));
        }
      }
      ctx.stroke();

      ctx.lineWidth = 1;

      if (addingEth) {
        const newEthReserve = ethReserve + addingEth;

        ctx.fillStyle = '#bbbbbb';
        ctx.beginPath();
        ctx.arc(plotX(newEthReserve), plotY(k / newEthReserve), 5, 0, 2 * Math.PI);
        ctx.fill();

        ctx.strokeStyle = '#009900';
        drawArrow(ctx, plotX(ethReserve), plotY(tokenReserve), plotX(newEthReserve), plotY(tokenReserve));

        ctx.fillStyle = '#000000';
        ctx.fillText(`${addingEth} 🔷 input`, plotX(ethReserve) + textSize, plotY(tokenReserve) - textSize);

        ctx.strokeStyle = '#990000';
        drawArrow(ctx, plotX(newEthReserve), plotY(tokenReserve), plotX(newEthReserve), plotY(k / newEthReserve));

        const amountGained = Math.round((10000 * (addingEth * tokenReserve)) / newEthReserve) / 10000;
        ctx.fillStyle = '#000000';
        ctx.fillText(
          `${amountGained} 🥑 output (-0.3% fee)`,
          plotX(newEthReserve) + textSize,
          plotY(k / newEthReserve)
        );
      } else if (addingToken) {
        const newTokenReserve = tokenReserve + addingToken;

        ctx.fillStyle = '#bbbbbb';
        ctx.beginPath();
        ctx.arc(plotX(k / newTokenReserve), plotY(newTokenReserve), 5, 0, 2 * Math.PI);
        ctx.fill();

        // console.log("newTokenReserve",newTokenReserve)
        ctx.strokeStyle = '#990000';
        drawArrow(ctx, plotX(ethReserve), plotY(tokenReserve), plotX(ethReserve), plotY(newTokenReserve));

        ctx.fillStyle = '#000000';
        ctx.fillText(`${addingToken} 🥑 input`, plotX(ethReserve) + textSize, plotY(tokenReserve));

        ctx.strokeStyle = '#009900';
        drawArrow(ctx, plotX(ethReserve), plotY(newTokenReserve), plotX(k / newTokenReserve), plotY(newTokenReserve));

        const amountGained = Math.round((10000 * (addingToken * ethReserve)) / newTokenReserve) / 10000;
        // console.log("amountGained",amountGained)
        ctx.fillStyle = '#000000';
        ctx.fillText(
          `${amountGained} 🔷 output (-0.3% fee)`,
          plotX(k / newTokenReserve) + textSize,
          plotY(newTokenReserve) - textSize
        );
      }

      ctx.fillStyle = '#0000FF';
      ctx.beginPath();
      ctx.arc(plotX(ethReserve), plotY(tokenReserve), 5, 0, 2 * Math.PI);
      ctx.fill();
    }
  }, [tokenReserve, ethReserve, addingToken, addingEth]);

  return (
    <div style={{ position: 'relative', width: props.width, height: props.height }}>
      <canvas style={{ position: 'absolute', left: 0, top: 0 }} ref={ref} width={props.width} height={props.height} />
      <div style={{ position: 'absolute', left: '20%', bottom: -20 }}>-- 🔷 ETH Reserve --</div>
      <div
        style={{ position: 'absolute', left: -20, bottom: '20%', transform: 'rotate(-90deg)', transformOrigin: '0 0' }}>
        -- 🥑 Token Reserve --
      </div>
    </div>
  );
}
