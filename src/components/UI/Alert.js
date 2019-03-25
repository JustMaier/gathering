import React from 'react';
import Styled, { css } from 'styled-components/macro';

export const Alert = Styled.div`
  position: fixed;
	top: -180px;
	margin: 0 5px;
	width: calc(100% - #{($gutter*2) + 10px});
	max-width: ($container-size - ($gutter*2) - 10px);
	padding: 55px 15px 15px;
	background: rgba(lighten($bg, 5%), .95);
	border: 1px solid rgba(#fff, .1);
	border-top: 0;
	box-shadow: 0px 5px 10px rgba(#000, .3);
	border-radius: 0 0 5px 5px;
	animation: appear ease 1s 500ms forwards;
	transform: translateZ(0);
	font-weight:300;

  p {
    margin: 0 0 10px;
  }

  ${p=>p.success && css`
    background: rgba(darken($brand-success, 0%), .8);
		border: 1px solid rgba(#fff, .3);
    animation: appear ease 1s 500ms forwards, disappear ease 2s 4s forwards;
  `}

  @keyframes appear {
    from { top: -180px }
    to { top: 0 }
  }
  @keyframes disappear {
    from { top: 0px }
    to { top: -180px }
  }
`;
