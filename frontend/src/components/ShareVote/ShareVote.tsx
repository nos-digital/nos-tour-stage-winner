import React, { useEffect, useState } from 'react';
import { Rider, Stage } from '../../types';
import styles from './ShareVote.module.css';

interface ShareVoteProps {
  rider: Rider;
  stage: Stage;
}

function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

function drawCard(canvas: HTMLCanvasElement, rider: Rider, stage: Stage) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const W = 500, H = 500;
  const M = 28; // margin

  // ── Yellow gradient background
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, '#ffe95c');
  bg.addColorStop(0.55, '#ffd900');
  bg.addColorStop(1, '#f2c500');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // ── Speed lines
  ctx.save();
  ctx.globalAlpha = 0.22;
  ctx.fillStyle = '#fff';
  ctx.translate(W / 2, H / 2);
  ctx.rotate((-55 * Math.PI) / 180);
  const diag = Math.sqrt(W * W + H * H);
  for (let y = -diag; y < diag; y += 44) {
    ctx.fillRect(-diag, y + 41, diag * 2, 3);
  }
  ctx.restore();

  // ── Top black bar
  const BAR_TOP = 42;
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(0, 0, W, BAR_TOP);

  // ── NOS letters
  ctx.textBaseline = 'alphabetic';
  ctx.font = `bold 27px "EffraBold", "Arial Narrow", Arial, sans-serif`;
  const nW = ctx.measureText('N').width;
  const oW = ctx.measureText('O').width;
  ctx.fillStyle = '#fff';
  ctx.fillText('N', M, 31);
  ctx.fillStyle = '#E61E14';
  ctx.fillText('O', M + nW, 31);
  ctx.fillStyle = '#fff';
  ctx.fillText('S', M + nW + oW, 31);

  // ── "TOUR DE FRANCE 2026"
  ctx.font = `700 15px "EffraBold", "Arial Narrow", Arial, sans-serif`;
  ctx.fillStyle = '#ffd900';
  ctx.textAlign = 'right';
  ctx.fillText('Tour De France 2026', W - M, 28);
  ctx.textAlign = 'left';

  // ── Label
  ctx.font = `600 20px "EffraBold", "Arial Narrow", Arial, sans-serif`;
  ctx.fillStyle = '#1a1a1a';
  ctx.fillText('Mijn keuze voor de etappe', M, BAR_TOP + 26);

  // ── Stage badge
  const stageLabel = `ETAPPE ${stage.number}  ·  ${stage.start} → ${stage.finish}`;
  ctx.font = `700 16px "EffraBold", "Arial Narrow", Arial, sans-serif`;
  const labelW = Math.min(ctx.measureText(stageLabel).width, W - M * 2);
  const bPad = 13, bH = 27, bY = BAR_TOP + 34;
  ctx.fillStyle = '#1a1a1a';
  roundedRect(ctx, M, bY, labelW + bPad * 2, bH, 14);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.save();
  ctx.rect(M, bY, labelW + bPad * 2, bH);
  ctx.clip();
  ctx.fillText(stageLabel, M + bPad, bY + 19);
  ctx.restore();

  // ── Rider name: auto-fit to card width
  const maxNameW = W - M * 2;
  const nameText = rider.name;
  ctx.font = `italic 800 66px "EffraBold", Impact, Arial, sans-serif`;
  const rawW = ctx.measureText(nameText).width;
  if (rawW > maxNameW) {
    const fitted = Math.floor(66 * (maxNameW / rawW));
    ctx.font = `italic 800 ${fitted}px "EffraBold", Impact, Arial, sans-serif`;
  }
  ctx.fillStyle = '#1a1a1a';
  ctx.fillText(nameText, M, 265);

  // ── Team
  ctx.font = `500 24px "EffraBold", "Arial Narrow", Arial, sans-serif`;
  ctx.fillStyle = '#444';
  ctx.fillText(rider.team || '', M, 298);

  // ── Divider
  ctx.strokeStyle = 'rgba(0,0,0,0.15)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(M, 316);
  ctx.lineTo(W - M, 316);
  ctx.stroke();

  // ── CTA
  ctx.font = `600 18px "EffraBold", "Arial Narrow", Arial, sans-serif`;
  ctx.fillStyle = '#1a1a1a';
  ctx.textAlign = 'center';
  ctx.fillText('Stem ook mee via nos.nl/tour', W / 2, 344);
  ctx.textAlign = 'left';

  // ── Bottom black bar
  const BAR_BOT = 38;
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(0, H - BAR_BOT, W, BAR_BOT);
  ctx.font = `500 16px "EffraBold", "Arial Narrow", Arial, sans-serif`;
  ctx.fillStyle = '#ffd900';
  ctx.textAlign = 'center';
  ctx.fillText('nos.nl/tour', W / 2, H - 12);
  ctx.textAlign = 'left';
}

function ShareVote({ rider, stage }: ShareVoteProps) {
  const [imageUrl, setImageUrl] = useState('');
  const [sharing, setSharing] = useState(false);

  useEffect(() => {
    let active = true;
    document.fonts.ready.then(() => {
      if (!active) return;
      const canvas = document.createElement('canvas');
      canvas.width = 500;
      canvas.height = 500;
      drawCard(canvas, rider, stage);
      if (active) setImageUrl(canvas.toDataURL('image/png'));
    });
    return () => { active = false; };
  }, [rider.id, stage.id]);

  const handleShare = async () => {
    if (sharing) return;
    setSharing(true);
    try {
      await document.fonts.ready;
      const canvas = document.createElement('canvas');
      canvas.width = 500;
      canvas.height = 500;
      drawCard(canvas, rider, stage);

      canvas.toBlob(async (blob) => {
        if (!blob) return;
        const file = new File([blob], 'mijn-etappekeuze.png', { type: 'image/png' });

        if (navigator.canShare?.({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: `Mijn keuze: ${rider.name}`,
            text: `Ik kies voor ${rider.name} als winnaar van etappe ${stage.number}! Stem ook mee.`,
          });
        } else {
          const a = document.createElement('a');
          a.href = URL.createObjectURL(blob);
          a.download = 'mijn-etappekeuze.png';
          a.click();
          URL.revokeObjectURL(a.href);
        }
      }, 'image/png');
    } finally {
      setSharing(false);
    }
  };

  if (!imageUrl) return null;

  return (
    <div className={styles.wrap}>
      <p className={styles.label}>Jouw keuze</p>
      <img src={imageUrl} alt={`Mijn keuze: ${rider.name}`} className={styles.preview} />
      <button className={styles.shareButton} onClick={handleShare} disabled={sharing}>
        {sharing ? 'Bezig…' : 'Delen'}
      </button>
    </div>
  );
}

export { ShareVote };
