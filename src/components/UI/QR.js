import React from 'react';
import styled from 'styled-components/macro';
import { QRCode } from 'react-qr-svg';
import { size, space, themeGet as _ } from 'styled-system';
import { math, rgba, darken } from 'polished';

const QRWrapper = ({link, ...props}) => (
  <a className={props.className} href={link}>
    <QRCode value={link} level='L' bgColor='transparent' fgColor='primary'/>
  </a>
)

export const QR = styled(QRWrapper)`
  ${size}
  ${space}

  display:block;
	border-radius: 5px;
	border: 1px solid rgba(255,255,255, .7);
	background: rgba(255,255,255, .8);
	background-image: linear-gradient(45deg, transparent 10%, rgba(255,255,255,.8) 25%, transparent 40%, transparent 60%, rgba(255,255,255,.8) 75%, transparent 90%, transparent);
	animation: MovingGradient 4s linear infinite;
	transform: translateZ(0);
	background-size: 200% 200%;
	box-shadow: 0px 3px 10px rgba(0,0,0, .3);

	svg {
		max-width: 100%;
		opacity: .8;
    rect{
      fill: ${p=>rgba(darken(0.1, _('colors.primary','#333')(p)), 0.9)};
    }
	}

  @keyframes MovingGradient {
    from {
      background-position: ${p=>math(`${p.size} * 2`)} 0
    }
    to {
      background-position: 0 0;
    }
  }
`;

QR.defaultProps = {
  ml: 'auto',
  mr: 'auto',
  size: '300px',
  p: '10px'
}
